import { createConfig, http } from "wagmi";
import { avalancheFuji, avalanche, mainnet, sepolia, polygon, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Chains soportadas - Avalanche Fuji es primaria para el hackathon MVP
export const supportedChains = [avalancheFuji, avalanche, arbitrumSepolia, arbitrum, mainnet, sepolia, polygon] as const;

export type SupportedChain = (typeof supportedChains)[number];

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [sepolia.id]: http("https://sepolia.llamarpc.com"),
    [polygon.id]: http("https://polygon.llamarpc.com"),
  },
});

// Chain helpers
export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    [arbitrumSepolia.id]: "Arbitrum Sepolia",
    [arbitrum.id]: "Arbitrum One",
    [avalancheFuji.id]: "Avalanche Fuji",
    [avalanche.id]: "Avalanche C-Chain",
    [mainnet.id]: "Ethereum",
    [sepolia.id]: "Sepolia",
    [polygon.id]: "Polygon",
  };
  return chainNames[chainId] || "Unknown Network";
}

export function getChainColor(chainId: number): string {
  const chainColors: Record<number, string> = {
    [arbitrumSepolia.id]: "text-sky-600 border-sky-200 bg-sky-50",
    [arbitrum.id]: "text-sky-700 border-sky-300 bg-sky-100",
    [avalancheFuji.id]: "text-amber-600 border-amber-200 bg-amber-50",
    [avalanche.id]: "text-red-600 border-red-200 bg-red-50",
    [mainnet.id]: "text-blue-600 border-blue-200 bg-blue-50",
    [sepolia.id]: "text-purple-600 border-purple-200 bg-purple-50",
    [polygon.id]: "text-indigo-600 border-indigo-200 bg-indigo-50",
  };
  return chainColors[chainId] || "text-muted-foreground border-border bg-secondary";
}

export function isTestnet(chainId: number): boolean {
  return chainId === arbitrumSepolia.id || chainId === avalancheFuji.id || chainId === sepolia.id;
}

/** Chain where CacaoFlow contracts are deployed — Avalanche Fuji for hackathon MVP */
export const PRIMARY_CHAIN = avalancheFuji;
export const PRIMARY_CHAIN_MAINNET = avalanche;

export { arbitrumSepolia, arbitrum, avalancheFuji, avalanche, mainnet, sepolia, polygon };
