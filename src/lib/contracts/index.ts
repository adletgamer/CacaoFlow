import addresses from "./addresses.json";
import cacaoFlowAbi from "./CacaoFlowOpportunities.abi.json";

export const CONTRACT_ADDRESSES = addresses as {
  chainId: number;
  network: string;
  MockUSDC: `0x${string}`;
  CacaoFlowOpportunities: `0x${string}`;
  deployedAt: string;
  deployer: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CACAO_FLOW_ABI = cacaoFlowAbi as any[];

export const MOCK_USDC_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "faucet",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "pure",
  },
] as const;

export const USDC_DECIMALS = 6;

export function toUsdcUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** USDC_DECIMALS));
}

export function fromUsdcUnits(amount: bigint): number {
  return Number(amount) / 10 ** USDC_DECIMALS;
}

export const isContractsDeployed =
  CONTRACT_ADDRESSES.CacaoFlowOpportunities !== "0x0000000000000000000000000000000000000000";
