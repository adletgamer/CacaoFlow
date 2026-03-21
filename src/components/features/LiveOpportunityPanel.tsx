"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockOpportunities } from "@/lib/mockData";
import { MapPin, Sprout, TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { useT } from "@/hooks/useT";

const RISK_BAND_COLORS: Record<string, string> = {
  A: "text-emerald-600 bg-emerald-50 border-emerald-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-amber-600 bg-amber-50 border-amber-200",
  D: "text-red-600 bg-red-50 border-red-200",
};

export function LiveOpportunityPanel() {
  const { t } = useT();
  
  // Get the first published opportunity
  const opp = mockOpportunities.find((o) => o.status === "published") || mockOpportunities[0];
  
  const fundedPercent = Math.round((opp.raised_amount_usd / opp.target_raise_usd) * 100);
  const returnPercent = (opp.expected_return_bps / 100).toFixed(2);

  return (
    <Card className="shadow-elevated border-2 border-primary/20 hover:border-primary/40 transition-all">
      <div className="h-1.5 bg-gradient-to-r from-primary to-accent rounded-t-lg" />
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="text-[10px] font-bold px-2">
                LIVE OPPORTUNITY
              </Badge>
            </div>
            <h3 className="font-bold text-base leading-tight mb-1.5">{opp.lot_name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Sprout className="h-3 w-3" />
                <span>{opp.crop_type}</span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{opp.region}, {opp.country}</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs font-bold px-2.5 py-1 border-2 ${RISK_BAND_COLORS[opp.risk_band] || ""}`}
          >
            {t("opportunities.card.riskBand")}: {opp.risk_band}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/60 p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                {t("opportunities.card.return")}
              </p>
            </div>
            <p className="text-lg font-bold text-emerald-600">{returnPercent}%</p>
            <p className="text-[10px] text-muted-foreground">{opp.expected_return_bps} bps</p>
          </div>
          
          <div className="rounded-lg bg-secondary/60 p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                {t("opportunities.card.tenor")}
              </p>
            </div>
            <p className="text-lg font-bold text-foreground">{opp.tenor_days} days</p>
            <p className="text-[10px] text-muted-foreground">Min: ${opp.min_ticket_usd}</p>
          </div>
        </div>

        {/* Funding Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t("opportunities.card.funded")}
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">{fundedPercent}%</p>
          </div>
          <Progress value={fundedPercent} className="h-2 mb-1.5" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>${opp.raised_amount_usd.toLocaleString()} raised</span>
            <span>${opp.target_raise_usd.toLocaleString()} target</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{opp.evidence_count} docs verified</span>
          </div>
          <Link href={`/app/opportunities/${opp.id}`}>
            <Button variant="accent" size="sm" className="font-semibold">
              View Opportunity
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
