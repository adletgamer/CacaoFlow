import addressesRaw from "./addresses.json";
import cacaoFlowAbi from "./CacaoFlowOpportunities.abi.json";

type ChainAddresses = {
  network: string;
  MockUSDC: `0x${string}`;
  CacaoFlowOpportunities: `0x${string}`;
  deployedAt: string;
  deployer: string;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

const allAddresses = addressesRaw as Record<string, ChainAddresses>;

/** Returns addresses for a given chainId. Falls back to zero addresses if not deployed. */
export function getContractAddresses(chainId: number): ChainAddresses {
  return allAddresses[String(chainId)] ?? {
    network: "unknown",
    MockUSDC: ZERO,
    CacaoFlowOpportunities: ZERO,
    deployedAt: "pending",
    deployer: "pending",
  };
}

/** Returns true if contracts are deployed on the given chain */
export function isDeployedOnChain(chainId: number): boolean {
  const addr = getContractAddresses(chainId);
  return addr.CacaoFlowOpportunities !== ZERO;
}

/** Primary testnet chainId for hackathon MVP — Avalanche Fuji only */
export const PRIMARY_CHAIN_ID = 43113;

/** Convenience: addresses for primary chain */
export const CONTRACT_ADDRESSES = getContractAddresses(PRIMARY_CHAIN_ID);

/** @deprecated use getContractAddresses(chainId) */
export const isContractsDeployed = isDeployedOnChain(PRIMARY_CHAIN_ID);

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


export * from "./opportunityStatus";
