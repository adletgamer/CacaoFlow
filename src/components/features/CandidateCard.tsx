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

interface CandidateCardProps {
  candidate: FinancingCandidate;
  delay?: number;
}

export function CandidateCard({ candidate, delay = 0 }: CandidateCardProps) {
  const [approved, setApproved] = useState(false);
  const progress = (candidate.approvedAmount / candidate.eligibleAmount) * 100;

  const handleApprove = () => {
    setApproved(true);
    toast.success("Financing approved", {
      description: `Plot ${candidate.lotId} has been approved. The VPC auditable claim is now active.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="hover:shadow-elevated transition-shadow">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{candidate.lotId}</CardTitle>
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
              <span>{candidate.daysRemaining}d remaining</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated yield</span>
              <span className="font-medium tabular-nums">{candidate.yieldEstimated} Ton</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Eligible amount</span>
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
            {approved ? "Financing Approved ✓" : "Approve Financing"}
          </Button>

          {approved && (
            <Badge variant="success" className="w-full justify-center py-1">
              VPC claim financed successfully
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
