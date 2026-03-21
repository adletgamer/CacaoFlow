/**
 * OpportunityStatus enum from CacaoFlowOpportunities.sol
 * Maps contract status to readable labels
 */
export enum OpportunityStatus {
  Draft = 0,
  Open = 1,
  Funded = 2,
  Active = 3,
  Repaid = 4,
  Defaulted = 5,
  Cancelled = 6,
}

export type OpportunityStatusKey = keyof typeof OpportunityStatus;

/**
 * Map contract status number to frontend status string
 */
export function mapContractStatus(status: number): string {
  switch (status) {
    case OpportunityStatus.Draft:
      return "draft";
    case OpportunityStatus.Open:
      return "published"; // frontend still uses "published" for open opportunities
    case OpportunityStatus.Funded:
      return "funded";
    case OpportunityStatus.Active:
      return "active";
    case OpportunityStatus.Repaid:
      return "repaid";
    case OpportunityStatus.Defaulted:
      return "defaulted";
    case OpportunityStatus.Cancelled:
      return "closed";
    default:
      return "unknown";
  }
}

/**
 * Check if opportunity accepts investments
 */
export function isOpenForInvestment(status: number): boolean {
  return status === OpportunityStatus.Open;
}

/**
 * Check if opportunity can be claimed
 */
export function isClaimable(status: number): boolean {
  return status === OpportunityStatus.Repaid;
}

/**
 * Check if opportunity is refundable
 */
export function isRefundable(status: number): boolean {
  return (
    status === OpportunityStatus.Cancelled ||
    status === OpportunityStatus.Defaulted
  );
}

/**
 * Valid state transitions (for admin/owner)
 */
export const VALID_TRANSITIONS: Record<number, number[]> = {
  [OpportunityStatus.Draft]: [OpportunityStatus.Open, OpportunityStatus.Cancelled],
  [OpportunityStatus.Open]: [OpportunityStatus.Funded, OpportunityStatus.Cancelled],
  [OpportunityStatus.Funded]: [OpportunityStatus.Active],
  [OpportunityStatus.Active]: [OpportunityStatus.Repaid, OpportunityStatus.Defaulted],
  [OpportunityStatus.Repaid]: [],
  [OpportunityStatus.Defaulted]: [],
  [OpportunityStatus.Cancelled]: [],
};
