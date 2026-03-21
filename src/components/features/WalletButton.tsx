"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import {
  supportedChains,
  getChainName,
  getChainColor,
  isTestnet,
} from "@/lib/wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Loader2,
  Copy,
  CheckCircle2,
  Network,
  ChevronRight,
} from "lucide-react";
import { formatUnits } from "viem";
import { useState } from "react";
import { useT } from "@/hooks/useT";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Iconos para cada wallet
const WALLET_ICONS: Record<string, string> = {
  MetaMask: "🦊",
  "Browser Wallet": "🌐",
  Injected: "�",
};

export function WalletButton() {
  const { t } = useT();
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const { data: balance } = useBalance({ address });

  const isUnsupportedChain = isConnected && !supportedChains.find((c) => c.id === chain?.id);
  const isTestnetChain = chain ? isTestnet(chain.id) : false;

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Modal de selección de wallet
  if (!isConnected) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-medium"
          onClick={() => setShowWalletModal(true)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wallet className="h-3.5 w-3.5" />
          )}
          {isPending ? t("wallet.connecting") : t("wallet.connect")}
        </Button>

        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-center">{t("wallet.selectWallet")}</DialogTitle>
              <DialogDescription className="text-center text-xs">
                {t("wallet.newToWallets")}{" "}
                <a href="https://ethereum.org/en/wallets/find-wallet/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t("wallet.learnMore")}</a>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  variant="outline"
                  className="w-full justify-start gap-3 h-14"
                  onClick={() => {
                    connect({ connector });
                    setShowWalletModal(false);
                  }}
                  disabled={isPending}
                >
                  <span className="text-xl">{WALLET_ICONS[connector.name] || "💳"}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{connector.name}</span>
                  </div>
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Chain no soportada
  if (isUnsupportedChain) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-1.5 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("wallet.unsupportedNetwork")}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2 text-xs text-destructive-foreground bg-destructive/10 rounded-sm mb-2">
            {t("wallet.switchToSupported")}
          </div>
          <DropdownMenuSeparator />
          {supportedChains.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => switchChain({ chainId: c.id })}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isTestnet(c.id) ? "bg-amber-500" : "bg-emerald-500"}`} />
              {getChainName(c.id)}
              {isTestnet(c.id) && (
                <Badge variant="outline" className="ml-auto text-[9px] py-0 h-4">
                  Testnet
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 font-medium">
          <div className={`h-2 w-2 rounded-full shrink-0 ${isTestnetChain ? "bg-amber-500" : "bg-emerald-500"}`} />
          {shortAddress(address!)}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Address y Balance */}
        <div className="px-2 py-2 space-y-1">
          <p className="font-medium text-foreground text-sm">{shortAddress(address!)}</p>
          {balance && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
            </p>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Chain Selector Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-xs cursor-pointer">
            <Network className="h-3.5 w-3.5 mr-2" />
            {t("wallet.network")}: {chain ? getChainName(chain.id) : "Unknown"}
            <ChevronRight className="h-3 w-3 ml-auto" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {supportedChains.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => switchChain({ chainId: c.id })}
                className={chain?.id === c.id ? "bg-secondary" : ""}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${isTestnet(c.id) ? "bg-amber-500" : "bg-emerald-500"}`} />
                <span className="text-xs">{getChainName(c.id)}</span>
                {chain?.id === c.id && <CheckCircle2 className="h-3 w-3 ml-auto text-emerald-500" />}
                {isTestnet(c.id) && (
                  <Badge variant="outline" className="ml-auto text-[9px] py-0 h-4">
                    Test
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Current Chain Badge */}
        {chain && (
          <div className="px-2 py-1">
            <Badge
              variant="outline"
              className={`text-[10px] ${getChainColor(chain.id)}`}
            >
              {getChainName(chain.id)}
              {isTestnetChain && " (Testnet)"}
            </Badge>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Copy Address */}
        <DropdownMenuItem onClick={copyAddress} className="text-xs gap-2 cursor-pointer">
          {copied ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? t("wallet.copied") : t("wallet.copyAddress")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Disconnect */}
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("wallet.disconnect")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
