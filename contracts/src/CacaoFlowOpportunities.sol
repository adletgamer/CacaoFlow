// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CacaoFlowOpportunities
/// @notice On-chain investment pool for pre-harvest cacao opportunities.
///         Underwriting, scoring, and VPC issuance stay off-chain.
///         This contract only handles: publish → fund → settle lifecycle.
contract CacaoFlowOpportunities is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Constants ───────────────────────────────────────────
    uint256 public constant PLATFORM_FEE_BPS = 100; // 1%
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ─── Types ───────────────────────────────────────────────

    enum OpportunityStatus {
        Published,   // accepting investments
        Funded,      // target reached, waiting for harvest
        Settled,     // repaid by originator, ready for claims
        Cancelled    // funding failed or cancelled
    }

    struct Opportunity {
        string  vpcId;              // off-chain VPC identifier
        string  opportunityId;      // off-chain opportunity identifier
        address originator;         // originator wallet address
        uint256 targetRaise;        // total raise target (USDC, 6 dec)
        uint256 minTicket;          // minimum investment (USDC, 6 dec)
        uint256 expectedReturnBps;  // annualised return in basis points
        uint256 tenorDays;          // duration in days
        uint256 fundingDeadline;    // unix timestamp
        uint256 raisedAmount;       // total invested so far
        uint256 settleAmount;       // principal + return repaid by originator
        OpportunityStatus status;
    }

    struct Position {
        uint256 opportunityId;
        address investor;
        uint256 amount;             // invested amount (USDC, 6 dec)
        bool    claimed;
    }

    // ─── State ───────────────────────────────────────────────

    IERC20 public immutable usdc;

    uint256 public opportunityCount;
    mapping(uint256 => Opportunity) public opportunities;

    uint256 public positionCount;
    mapping(uint256 => Position) public positions;

    /// investor → list of position IDs
    mapping(address => uint256[]) public investorPositions;
    /// opportunityId → list of position IDs
    mapping(uint256 => uint256[]) public opportunityPositions;

    address public feeRecipient;

    // ─── Events ──────────────────────────────────────────────

    event OpportunityPublished(
        uint256 indexed id,
        string vpcId,
        string opportunityId,
        address indexed originator,
        uint256 targetRaise,
        uint256 expectedReturnBps,
        uint256 tenorDays,
        uint256 fundingDeadline
    );

    event InvestmentMade(
        uint256 indexed opportunityId,
        uint256 indexed positionId,
        address indexed investor,
        uint256 amount
    );

    event OpportunityFunded(uint256 indexed id);

    event OpportunitySettled(uint256 indexed id, uint256 settleAmount);

    event RepaymentClaimed(
        uint256 indexed positionId,
        address indexed investor,
        uint256 principal,
        uint256 returnAmount
    );

    event OpportunityCancelled(uint256 indexed id);

    event InvestmentRefunded(
        uint256 indexed positionId,
        address indexed investor,
        uint256 amount
    );

    // ─── Constructor ─────────────────────────────────────────

    constructor(address _usdc, address _feeRecipient) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        feeRecipient = _feeRecipient;
    }

    // ─── Originator actions ──────────────────────────────────

    /// @notice Publish a new investment opportunity (only originator or owner)
    function publishOpportunity(
        string calldata vpcId,
        string calldata opportunityId,
        uint256 targetRaise,
        uint256 minTicket,
        uint256 expectedReturnBps,
        uint256 tenorDays,
        uint256 fundingDeadlineDays
    ) external returns (uint256 id) {
        require(targetRaise > 0, "targetRaise must be > 0");
        require(minTicket > 0 && minTicket <= targetRaise, "invalid minTicket");
        require(expectedReturnBps > 0 && expectedReturnBps <= 5000, "return out of range");
        require(tenorDays > 0 && tenorDays <= 730, "tenor out of range");
        require(fundingDeadlineDays > 0 && fundingDeadlineDays <= 365, "deadline out of range");

        id = opportunityCount++;

        opportunities[id] = Opportunity({
            vpcId: vpcId,
            opportunityId: opportunityId,
            originator: msg.sender,
            targetRaise: targetRaise,
            minTicket: minTicket,
            expectedReturnBps: expectedReturnBps,
            tenorDays: tenorDays,
            fundingDeadline: block.timestamp + (fundingDeadlineDays * 1 days),
            raisedAmount: 0,
            settleAmount: 0,
            status: OpportunityStatus.Published
        });

        emit OpportunityPublished(
            id,
            vpcId,
            opportunityId,
            msg.sender,
            targetRaise,
            expectedReturnBps,
            tenorDays,
            opportunities[id].fundingDeadline
        );
    }

    // ─── Investor actions ────────────────────────────────────

    /// @notice Invest USDC into a published opportunity
    function invest(uint256 id, uint256 amount) external nonReentrant returns (uint256 positionId) {
        Opportunity storage opp = opportunities[id];
        require(opp.status == OpportunityStatus.Published, "not open");
        require(block.timestamp <= opp.fundingDeadline, "deadline passed");
        require(amount >= opp.minTicket, "below min ticket");
        require(opp.raisedAmount + amount <= opp.targetRaise, "exceeds target");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        positionId = positionCount++;
        positions[positionId] = Position({
            opportunityId: id,
            investor: msg.sender,
            amount: amount,
            claimed: false
        });

        investorPositions[msg.sender].push(positionId);
        opportunityPositions[id].push(positionId);

        opp.raisedAmount += amount;

        emit InvestmentMade(id, positionId, msg.sender, amount);

        if (opp.raisedAmount == opp.targetRaise) {
            opp.status = OpportunityStatus.Funded;
            emit OpportunityFunded(id);
        }
    }

    // ─── Settlement (originator repays) ──────────────────────

    /// @notice Originator calls this after harvest to repay principal + return.
    ///         Must approve this contract to spend settleAmount before calling.
    function settle(uint256 id) external nonReentrant {
        Opportunity storage opp = opportunities[id];
        require(msg.sender == opp.originator || msg.sender == owner(), "not originator");
        require(
            opp.status == OpportunityStatus.Funded ||
            opp.status == OpportunityStatus.Published,
            "cannot settle"
        );

        uint256 principal = opp.raisedAmount;
        uint256 returnAmount = (principal * opp.expectedReturnBps) / BPS_DENOMINATOR;
        uint256 total = principal + returnAmount;

        usdc.safeTransferFrom(msg.sender, address(this), total);

        opp.settleAmount = total;
        opp.status = OpportunityStatus.Settled;

        emit OpportunitySettled(id, total);
    }

    /// @notice Investor claims their principal + return after settlement
    function claimRepayment(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.investor == msg.sender, "not your position");
        require(!pos.claimed, "already claimed");

        Opportunity storage opp = opportunities[pos.opportunityId];
        require(opp.status == OpportunityStatus.Settled, "not settled");

        pos.claimed = true;

        uint256 principal = pos.amount;
        uint256 returnAmount = (principal * opp.expectedReturnBps) / BPS_DENOMINATOR;
        uint256 total = principal + returnAmount;

        uint256 fee = (returnAmount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 toInvestor = total - fee;

        usdc.safeTransfer(msg.sender, toInvestor);
        if (fee > 0) {
            usdc.safeTransfer(feeRecipient, fee);
        }

        emit RepaymentClaimed(positionId, msg.sender, principal, returnAmount);
    }

    // ─── Cancellation & Refunds ──────────────────────────────

    /// @notice Owner or originator can cancel a Published opportunity
    function cancelOpportunity(uint256 id) external {
        Opportunity storage opp = opportunities[id];
        require(msg.sender == opp.originator || msg.sender == owner(), "not authorized");
        require(opp.status == OpportunityStatus.Published, "cannot cancel");

        opp.status = OpportunityStatus.Cancelled;
        emit OpportunityCancelled(id);
    }

    /// @notice Investors can claim refund after cancellation or deadline passed
    function claimRefund(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.investor == msg.sender, "not your position");
        require(!pos.claimed, "already claimed");

        Opportunity storage opp = opportunities[pos.opportunityId];
        require(
            opp.status == OpportunityStatus.Cancelled ||
            (opp.status == OpportunityStatus.Published && block.timestamp > opp.fundingDeadline),
            "not refundable"
        );

        pos.claimed = true;
        usdc.safeTransfer(msg.sender, pos.amount);

        emit InvestmentRefunded(positionId, msg.sender, pos.amount);
    }

    // ─── Views ───────────────────────────────────────────────

    function getOpportunity(uint256 id) external view returns (Opportunity memory) {
        return opportunities[id];
    }

    function getPosition(uint256 positionId) external view returns (Position memory) {
        return positions[positionId];
    }

    function getInvestorPositions(address investor) external view returns (uint256[] memory) {
        return investorPositions[investor];
    }

    function getOpportunityPositions(uint256 id) external view returns (uint256[] memory) {
        return opportunityPositions[id];
    }

    // ─── Admin ───────────────────────────────────────────────

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }
}
