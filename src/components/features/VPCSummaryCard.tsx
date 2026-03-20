"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./ScoreBadge";
import { Shield, Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VPCSummaryCardProps {
  lotId: string;
  vpcId: string;
  expectedYield: number;
  confidenceScore: string;
  confidenceNumeric: number;
  eligibleFinancing: number;
  claimStatus: "issued" | "pending" | "active";
  claimHash: string;
  issuedDate?: string;
  delay?: number;
}

export function VPCSummaryCard({
  lotId,
  vpcId,
  expectedYield,
  confidenceScore,
  confidenceNumeric,
  eligibleFinancing,
  claimStatus,
  claimHash,
  issuedDate,
  delay = 0,
}: VPCSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(claimHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    issued: { label: "Emitido", variant: "success" as const },
    active: { label: "Activo", variant: "success" as const },
    pending: { label: "Pendiente", variant: "warning" as const },
  };

  const status = statusConfig[claimStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-shadow">
        {/* Top accent */}
        <div className="h-1 bg-primary" />

        <CardContent className="p-0">
          {/* Header row */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{vpcId}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Plot {lotId}</p>
              </div>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Financing amount — hero metric */}
          <div className="px-5 py-5 bg-secondary/30 border-b border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Eligible Financing Amount</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-bold tabular-nums text-foreground tracking-tight">
                ${eligibleFinancing.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-muted-foreground">USD</span>
            </div>
          </div>

          {/* Grid metrics */}
          <div className="grid grid-cols-2 divide-x divide-border/50">
            <div className="px-5 py-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Expected Yield</p>
              <p className="text-lg font-semibold tabular-nums text-foreground mt-1">{expectedYield} <span className="text-sm font-normal text-muted-foreground">Ton</span></p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Confidence Score</p>
              <ScoreBadge score={confidenceScore} numeric={confidenceNumeric} size="sm" />
            </div>
          </div>

          {/* On-chain record */}
          <div className="px-5 py-3.5 bg-secondary/20 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-5 w-5 rounded bg-foreground/5 flex items-center justify-center shrink-0">
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Auditable Claim Hash</p>
                  <code className="text-xs font-mono text-foreground truncate block">{claimHash}</code>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                  copied
                    ? "bg-success/10 text-success"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                )}
                title="Copy claim hash"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            {issuedDate && (
              <p className="text-[10px] text-muted-foreground mt-1.5">Issued: {issuedDate}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
