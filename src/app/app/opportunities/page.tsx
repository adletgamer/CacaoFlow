"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/features/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockOpportunities, type MockInvestmentOpportunity } from "@/lib/mockData";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  MapPin,
  Sprout,
  Clock,
  Users,
  FileText,
  Shield,
  ArrowRight,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useT } from "@/hooks/useT";

// ─── Helpers ─────────────────────────────────────────────────

function bpsToPercent(bps: number) {
  return (bps / 100).toFixed(2);
}

function fundedPercent(opp: MockInvestmentOpportunity) {
  return Math.round((opp.raised_amount_usd / opp.target_raise_usd) * 100);
}

const RISK_BAND_COLORS: Record<string, string> = {
  A: "text-emerald-600 bg-emerald-50 border-emerald-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-amber-600 bg-amber-50 border-amber-200",
  D: "text-red-600 bg-red-50 border-red-200",
};

// ─── Opportunity Card ────────────────────────────────────────

function OpportunityCard({ opp, delay }: { opp: MockInvestmentOpportunity; delay: number }) {
  const { t } = useT();
  const funded = fundedPercent(opp);
  const isOpen = opp.status === "published";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="hover:shadow-elevated transition-all group h-full flex flex-col">
        {/* Header stripe */}
        <div className={`h-1 rounded-t-lg ${isOpen ? "bg-primary" : "bg-muted-foreground/30"}`} />

        <CardContent className="p-5 flex flex-col gap-4 flex-1">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-tight truncate">{opp.lot_name}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Sprout className="h-3 w-3 shrink-0" />
                <span>{opp.crop_type}</span>
                <span className="text-border">·</span>
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{opp.region}, {opp.country}</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 text-[11px] font-bold px-2 border ${RISK_BAND_COLORS[opp.risk_band] ?? ""}`}
            >
              {opp.risk_band}
            </Badge>
          </div>

          {/* Originator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-primary shrink-0" />
            <span className="font-medium text-foreground">{opp.originator_name}</span>
            <span className="text-border">·</span>
            <span className="capitalize">{t(`register.originator.types.${opp.originator_type}`)}</span>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-secondary/60 p-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("opportunities.card.score")}</p>
              <p className="text-sm font-bold text-primary">{opp.score}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">{opp.score_numeric}/100</p>
            </div>
            <div className="rounded-md bg-secondary/60 p-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("opportunities.card.return")}</p>
              <p className="text-sm font-bold text-emerald-600">{bpsToPercent(opp.expected_return_bps)}%</p>
              <p className="text-[10px] text-muted-foreground">{opp.expected_return_bps} bps</p>
            </div>
            <div className="rounded-md bg-secondary/60 p-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("opportunities.card.tenor")}</p>
              <p className="text-sm font-bold">{opp.tenor_days}d</p>
              <p className="text-[10px] text-muted-foreground">{t("opportunities.card.minTicket")}: ${opp.min_ticket_usd}</p>
            </div>
          </div>

          {/* Funding progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("opportunities.card.funded")}</span>
              <span className="tabular-nums font-medium text-foreground">{funded}%</span>
            </div>
            <Progress value={funded} className="h-1.5" />
            <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>${opp.raised_amount_usd.toLocaleString("en-US")} raised</span>
              <span>${opp.target_raise_usd.toLocaleString("en-US")} {t("opportunities.card.targetRaise")}</span>
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {opp.evidence_count} {t("opportunities.card.evidenceDocs")}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {opp.investor_count} {t("opportunities.card.investors")}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("opportunities.card.deadline")}: {opp.funding_deadline}
            </span>
          </div>

          {/* CTA */}
          <Link href={`/app/opportunities/${opp.id}`} className="mt-auto">
            <Button
              variant={isOpen ? "accent" : "outline"}
              size="sm"
              className="w-full group-hover:shadow-sm transition-shadow"
            >
              {isOpen ? t("opportunities.card.fundNow") : t("opportunities.card.viewDetail")}
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────

type StatusFilter = "all" | "published" | "funded" | "repaid";
type SortKey = "return" | "score" | "deadline";

export default function OpportunitiesPage() {
  const { t } = useT();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("return");

  const openCount = mockOpportunities.filter((o) => o.status === "published").length;
  const totalCapital = mockOpportunities.reduce((s, o) => s + o.target_raise_usd, 0);
  const avgReturn = mockOpportunities.length
    ? mockOpportunities.reduce((s, o) => s + o.expected_return_bps, 0) / mockOpportunities.length
    : 0;

  const filtered = useMemo(() => {
    let result = [...mockOpportunities];
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    result.sort((a, b) => {
      if (sortKey === "return") return b.expected_return_bps - a.expected_return_bps;
      if (sortKey === "score") return b.score_numeric - a.score_numeric;
      return a.funding_deadline.localeCompare(b.funding_deadline);
    });
    return result;
  }, [statusFilter, sortKey]);

  const filterOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("opportunities.filterAll") },
    { key: "published", label: t("opportunities.filterPublished") },
    { key: "funded", label: t("opportunities.filterFunded") },
    { key: "repaid", label: t("opportunities.filterRepaid") },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "return", label: t("opportunities.sortReturn") },
    { key: "score", label: t("opportunities.sortScore") },
    { key: "deadline", label: t("opportunities.sortFunding") },
  ];

  return (
    <>
      <PageHeader title={t("opportunities.title")} description={t("opportunities.description")} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BarChart3} title={t("opportunities.stats.open")} value={openCount} subtitle={t("opportunities.stats.openSub")} delay={0} />
        <StatCard icon={DollarSign} title={t("opportunities.stats.totalCapital")} value={`$${totalCapital.toLocaleString("en-US")}`} subtitle={t("opportunities.stats.totalCapitalSub")} delay={0.05} />
        <StatCard icon={Percent} title={t("opportunities.stats.avgReturn")} value={`${bpsToPercent(avgReturn)}%`} subtitle={t("opportunities.stats.avgReturnSub")} delay={0.1} />
      </div>

      {/* Filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((f) => (
            <Button
              key={f.key}
              variant={statusFilter === f.key ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              {f.key === "all" && (
                <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded px-1">
                  {mockOpportunities.length}
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{t("opportunities.sortLabel")}:</span>
          <div className="flex gap-1">
            {sortOptions.map((s) => (
              <button
                key={s.key}
                onClick={() => setSortKey(s.key)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  sortKey === s.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t("opportunities.empty")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((opp, i) => (
            <OpportunityCard key={opp.id} opp={opp} delay={i * 0.05} />
          ))}
        </div>
      )}
    </>
  );
}
