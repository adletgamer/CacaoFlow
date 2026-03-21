"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { avalancheFuji } from "@/lib/wagmi";
import {
  CONTRACT_ADDRESSES,
  CACAO_FLOW_ABI,
  MOCK_USDC_ABI,
  toUsdcUnits,
  isContractsDeployed,
} from "@/lib/contracts";

export type InvestStep =
  | "idle"
  | "wrong_network"
  | "not_deployed"
  | "approving"
  | "approve_pending"
  | "investing"
  | "invest_pending"
  | "success"
  | "error";

interface UseInvestOptions {
  onchainOpportunityId: bigint;
  amountUsd: number;
}

export function useInvest({ onchainOpportunityId, amountUsd }: UseInvestOptions) {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [step, setStep] = useState<InvestStep>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const amountUnits = toUsdcUnits(amountUsd);

  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESSES.CacaoFlowOpportunities],
    query: { enabled: !!address },
  });

  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [investTxHash, setInvestTxHash] = useState<`0x${string}` | undefined>();

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash });
  const { isSuccess: investConfirmed } = useWaitForTransactionReceipt({ hash: investTxHash });

  function reset() {
    setStep("idle");
    setErrorMsg(null);
    setApproveTxHash(undefined);
    setInvestTxHash(undefined);
  }

  async function invest() {
    setErrorMsg(null);

    if (!isConnected || !address) {
      setErrorMsg("Connect your wallet first.");
      return;
    }

    if (chain?.id !== avalancheFuji.id) {
      setStep("wrong_network");
      switchChain({ chainId: avalancheFuji.id });
      return;
    }

    if (!isContractsDeployed) {
      setStep("not_deployed");
      setErrorMsg("Contracts are not deployed yet. Run the deploy script first.");
      return;
    }

    if (usdcBalance !== undefined && usdcBalance < amountUnits) {
      setErrorMsg(`Insufficient mUSDC balance. Use the faucet() to get test tokens.`);
      return;
    }

    try {
      // Step 1: Approve if needed
      const currentAllowance = allowance ?? 0n;
      if (currentAllowance < amountUnits) {
        setStep("approving");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.MockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.CacaoFlowOpportunities, amountUnits],
        });
        setApproveTxHash(hash);
        setStep("approve_pending");

        // Wait for approve confirmation
        await waitForTx(hash);
      }

      // Step 2: Invest
      setStep("investing");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.CacaoFlowOpportunities,
        abi: CACAO_FLOW_ABI,
        functionName: "invest",
        args: [onchainOpportunityId, amountUnits],
      });
      setInvestTxHash(hash);
      setStep("invest_pending");

      await waitForTx(hash);
      setStep("success");
    } catch (e: unknown) {
      setStep("error");
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErrorMsg(msg.includes("user rejected") ? "Transaction rejected." : msg.slice(0, 120));
    }
  }

  return {
    invest,
    reset,
    step,
    errorMsg,
    approveTxHash,
    investTxHash,
    isLoading: step === "approving" || step === "approve_pending" || step === "investing" || step === "invest_pending",
    isSuccess: step === "success",
    isError: step === "error",
    usdcBalance,
    approveConfirmed,
    investConfirmed,
  };
}

async function waitForTx(hash: `0x${string}`) {
  const { createPublicClient, http } = await import("viem");
  const { avalancheFuji: fuji } = await import("wagmi/chains");
  const client = createPublicClient({ chain: fuji, transport: http() });
  await client.waitForTransactionReceipt({ hash });
}
