"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreBadge } from "./ScoreBadge";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import type { FinancingCandidate } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

interface CandidateCardProps {
  candidate: FinancingCandidate;
  delay?: number;
}

export function CandidateCard({ candidate, delay = 0 }: CandidateCardProps) {
  const [approved, setApproved] = useState(false);
  const { t } = useT();
  const progress = (candidate.approvedAmount / candidate.eligibleAmount) * 100;

  const handleApprove = () => {
    setApproved(true);
    toast.success(t("financing.candidate.fund"), {
      description: `Plot ${candidate.lotId} — VPC claim financed.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="hover:shadow-elevated transition-shadow rounded-2xl border-border/40">
        <CardHeader className="pb-3 border-b border-border/40 p-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-serif">{candidate.lotId}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{candidate.producerName}</p>
            </div>
            <ScoreBadge score={candidate.score} size="sm" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sprout className="h-3 w-3" />
              <span>{candidate.cacaoType}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{candidate.daysRemaining} {t("financing.candidate.days")}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("financing.candidate.yield")}</span>
              <span className="font-medium tabular-nums">{candidate.yieldEstimated} {t("common.ton")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("financing.candidate.eligible")}</span>
              <span className="font-medium tabular-nums">${candidate.eligibleAmount.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Progress value={approved ? 100 : progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="tabular-nums">${(approved ? candidate.eligibleAmount : candidate.approvedAmount).toLocaleString()}</span>
              <span className="tabular-nums">{approved ? "100" : Math.round(progress)}%</span>
            </div>
          </div>

          <Button
            className="w-full"
            variant={approved ? "outline" : "accent"}
            disabled={approved}
            onClick={handleApprove}
          >
            {approved ? `${t("financing.candidate.fund")} ✓` : t("financing.candidate.fund")}
          </Button>

          {approved && (
            <Badge variant="success" className="w-full justify-center py-1">
              {t("financing.candidate.approved")}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
