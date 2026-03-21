"use client";

import { useParams, useRouter } from "next/navigation";
import { mockOpportunities, mockScoring, type MockInvestmentOpportunity } from "@/lib/mockData";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScoreBadge } from "@/components/features/ScoreBadge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { useT } from "@/hooks/useT";
import { useAccount } from "wagmi";
import { useInvest } from "@/hooks/useInvest";
import { WalletButton } from "@/components/features/WalletButton";
import { isContractsDeployed } from "@/lib/contracts";
import {
  Shield, MapPin, Sprout, FileText, Users, DollarSign,
  TrendingUp, Link2, ArrowLeft, CheckCircle2, AlertCircle,
  Leaf, BarChart3, Clock, ChevronRight, Loader2, ExternalLink,
} from "lucide-react";

function bpsToPercent(bps: number) { return (bps / 100).toFixed(2); }
function fundedPct(opp: MockInvestmentOpportunity) {
  return Math.round((opp.raised_amount_usd / opp.target_raise_usd) * 100);
}

const BAND_CLS: Record<string, string> = {
  A: "text-emerald-600 bg-emerald-50 border-emerald-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-amber-600 bg-amber-50 border-amber-200",
  D: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "outline"> = {
  published: "success", funded: "default", closed: "warning", repaid: "outline",
};

function Section({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}>
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />{title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}/{max}</span>
      </div>
      <Progress value={Math.round((value / max) * 100)} className="h-1.5" />
    </div>
  );
}

const OPP_ONCHAIN_ID: Record<string, bigint> = {
  "OPP-2026-001": 0n,
  "OPP-2026-002": 1n,
  "OPP-2026-003": 2n,
  "OPP-2026-004": 3n,
};

function InvestPanel({ opp }: { opp: MockInvestmentOpportunity }) {
  const { t } = useT();
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const funded = fundedPct(opp);
  const isOpen = opp.status === "published";

  const onchainId = OPP_ONCHAIN_ID[opp.id] ?? 0n;
  const { invest, reset, step, errorMsg, investTxHash, isLoading, isSuccess } = useInvest({
    onchainOpportunityId: onchainId,
    amountUsd: parseFloat(amount) || 0,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast.error(t("opportunityDetail.invest.validation.amount")); return; }
    if (n < opp.min_ticket_usd) {
      toast.error(`${t("opportunityDetail.invest.validation.minTicket")} $${opp.min_ticket_usd}`);
      return;
    }
    invest();
  }

  const STEP_LABEL: Record<string, string> = {
    approving: t("opportunityDetail.invest.stepApproving"),
    approve_pending: t("opportunityDetail.invest.stepApprovePending"),
    investing: t("opportunityDetail.invest.stepInvesting"),
    invest_pending: t("opportunityDetail.invest.stepInvestPending"),
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3 border-b border-border/50 bg-primary/5 rounded-t-lg">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          {t("opportunityDetail.sections.invest")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-secondary p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("opportunities.card.return")}</p>
            <p className="text-lg font-bold text-emerald-600">{bpsToPercent(opp.expected_return_bps)}%</p>
            <p className="text-[10px] text-muted-foreground">{opp.expected_return_bps} bps</p>
          </div>
          <div className="rounded-md bg-secondary p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("opportunities.card.tenor")}</p>
            <p className="text-lg font-bold">{opp.tenor_days}d</p>
            <p className="text-[10px] text-muted-foreground">{opp.currency}</p>
          </div>
        </div>

        {/* Funding progress */}
        <div className="space-y-1.5 rounded-md bg-secondary p-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t("opportunities.card.funded")}</span>
            <span className="font-semibold tabular-nums">{funded}%</span>
          </div>
          <Progress value={funded} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>${opp.raised_amount_usd.toLocaleString()} raised</span>
            <span>${opp.target_raise_usd.toLocaleString()} target</span>
          </div>
        </div>

        {/* Contracts not deployed yet */}
        {!isContractsDeployed && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Contracts pending deploy to Fuji. On-chain investment will be active after deployment.</span>
          </div>
        )}

        {!isOpen ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-md bg-secondary">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {t("opportunityDetail.invest.alreadyFunded")}
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="font-semibold text-sm">{t("opportunityDetail.invest.successTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("opportunityDetail.invest.successDesc")}</p>
            <Badge variant="success" className="mt-1">${parseFloat(amount).toLocaleString()} · {opp.currency}</Badge>
            {investTxHash && (
              <a
                href={`https://testnet.snowtrace.io/tx/${investTxHash}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View on Snowtrace
              </a>
            )}
            <Button variant="outline" size="sm" onClick={reset} className="mt-1">
              {t("opportunityDetail.invest.investAgain")}
            </Button>
          </div>
        ) : (
          <>
            {/* Wallet connection gate */}
            {!isConnected && (
              <div className="p-3 rounded-md border border-border bg-secondary/50 flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground text-center">{t("opportunityDetail.invest.connectPrompt")}</p>
                <WalletButton />
              </div>
            )}

            {/* In-progress indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                <span>{STEP_LABEL[step] ?? t("opportunityDetail.invest.submitting")}</span>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-muted-foreground">{t("opportunityDetail.invest.subtitle")}</p>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("opportunityDetail.invest.amountLabel")}</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="number" min={opp.min_ticket_usd} step={50}
                    placeholder={t("opportunityDetail.invest.amountPlaceholder")}
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t("opportunityDetail.invest.minNote")} <strong>${opp.min_ticket_usd} {opp.currency}</strong>
                </p>
              </div>
              <Button
                type="submit" variant="accent" className="w-full"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />{STEP_LABEL[step]}</>
                ) : (
                  t("opportunityDetail.invest.submitBtn")
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function OpportunityDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useT();

  const opp = mockOpportunities.find((o) => o.id === id);
  const scoring = opp ? mockScoring[opp.lot_id] : undefined;
  const funded = opp ? fundedPct(opp) : 0;

  if (!opp) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Opportunity not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push("/app/opportunities")}>
          {t("opportunityDetail.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => router.push("/app/opportunities")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ArrowLeft className="h-3.5 w-3.5" />{t("opportunityDetail.backToList")}
      </button>

      <PageHeader title={opp.lot_name} description={`${opp.crop_type} · ${opp.region}, ${opp.country}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={STATUS_VARIANT[opp.status] ?? "outline"}>
            {t(`opportunityDetail.badge.${opp.status}`)}
          </Badge>
          <Badge variant="outline" className={`font-bold border ${BAND_CLS[opp.risk_band] ?? ""}`}>
            {t("opportunities.card.riskBand")} {opp.risk_band}
          </Badge>
        </div>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Section title={t("opportunityDetail.sections.originator")} icon={Shield} delay={0}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">{opp.originator_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {t(`register.originator.types.${opp.originator_type}`)}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6">
              <Row label={t("opportunityDetail.originator.country")} value={opp.country} />
              <Row label={t("opportunityDetail.originator.region")} value={opp.region} />
            </div>
          </Section>

          <Section title={t("opportunityDetail.sections.lot")} icon={Leaf} delay={0.05}>
            <div className="grid grid-cols-2 gap-x-6">
              <Row label={t("opportunityDetail.lot.crop")}
                value={<span className="flex items-center gap-1"><Sprout className="h-3 w-3 text-primary" />{opp.crop_type}</span>} />
              <Row label={t("opportunityDetail.lot.region")}
                value={<span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{opp.region}, {opp.country}</span>} />
            </div>
          </Section>

          {scoring && (
            <Section title={t("opportunityDetail.sections.production")} icon={TrendingUp} delay={0.1}>
              <div className="grid grid-cols-2 gap-x-6">
                <Row label={t("opportunityDetail.production.expectedYield")} value={`${scoring.yieldEstimated} ${t("common.ton")}`} />
                <Row label={t("opportunityDetail.production.historicalAvg")} value={`${scoring.historicalYield} ${t("common.ton")}`} />
                <Row label={t("opportunityDetail.production.financingNeeded")} value={`$${opp.target_raise_usd.toLocaleString()}`} />
              </div>
            </Section>
          )}

          {scoring && (
            <Section title={t("opportunityDetail.sections.scorecard")} icon={BarChart3} delay={0.15}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-primary tabular-nums">{scoring.scoreNumeric}</p>
                  <p className="text-xs text-muted-foreground">{t("opportunityDetail.scorecard.overall")}</p>
                </div>
                <ScoreBadge score={scoring.score} size="lg" />
              </div>
              <div className="space-y-3 mb-4">
                {scoring.breakdown.map((item) => (
                  <ScoreBar key={item.label} label={item.label} value={item.value} max={item.max} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-6">
                <Row label={t("opportunityDetail.scorecard.riskBand")}
                  value={<span className={`font-bold px-1.5 py-0.5 rounded text-[11px] border ${BAND_CLS[opp.risk_band]}`}>{opp.risk_band}</span>} />
                <Row label={t("opportunityDetail.scorecard.recommendedTenor")}
                  value={`${opp.tenor_days} ${t("opportunityDetail.scorecard.days")}`} />
              </div>
            </Section>
          )}

          <Section title={t("opportunityDetail.sections.evidence")} icon={FileText} delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{opp.evidence_count}</p>
                <p className="text-xs text-muted-foreground">{t("opportunityDetail.evidence.docs")}</p>
              </div>
              <Badge variant="success" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t("opportunityDetail.evidence.verificationStatus.verified")}
              </Badge>
            </div>
          </Section>

          <Section title={t("opportunityDetail.sections.financing")} icon={DollarSign} delay={0.25}>
            <div className="grid grid-cols-2 gap-x-6">
              <Row label={t("opportunityDetail.financing.targetRaise")} value={`$${opp.target_raise_usd.toLocaleString()} ${opp.currency}`} />
              <Row label={t("opportunityDetail.financing.minTicket")} value={`$${opp.min_ticket_usd.toLocaleString()} ${opp.currency}`} />
              <Row label={t("opportunityDetail.financing.tenor")} value={`${opp.tenor_days} ${t("opportunityDetail.scorecard.days")}`} />
              <Row label={t("opportunityDetail.financing.deadline")}
                value={<span className="flex items-center gap-1"><Clock className="h-3 w-3" />{opp.funding_deadline}</span>} />
              <Row label={t("opportunityDetail.financing.raised")} value={`$${opp.raised_amount_usd.toLocaleString()} (${funded}%)`} />
              <Row label={t("opportunityDetail.financing.investors")}
                value={<span className="flex items-center gap-1"><Users className="h-3 w-3" />{opp.investor_count}</span>} />
            </div>
          </Section>

          <Section title={t("opportunityDetail.sections.repayment")} icon={TrendingUp} delay={0.3}>
            <div className="grid grid-cols-2 gap-x-6">
              <Row label={t("opportunityDetail.repayment.returnLabel")}
                value={<span className="text-emerald-600 font-bold">{bpsToPercent(opp.expected_return_bps)}% ({opp.expected_return_bps} {t("opportunityDetail.repayment.bpsLabel")})</span>} />
              <Row label={t("opportunityDetail.repayment.structure")} value={t("opportunityDetail.repayment.structureValue")} />
            </div>
            <div className="mt-3 p-3 rounded-md bg-secondary text-xs text-muted-foreground flex gap-2">
              <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />
              {t("opportunityDetail.repayment.note")}
            </div>
          </Section>

          <Section title={t("opportunityDetail.sections.onchain")} icon={Link2} delay={0.35}>
            <div className="grid grid-cols-1 gap-x-6">
              <Row label={t("opportunityDetail.onchain.vpcId")}
                value={<code className="font-mono text-[11px] text-primary">{opp.vpc_id}</code>} />
              <Row label={t("opportunityDetail.onchain.reference")}
                value={<code className="font-mono text-[11px]">stellar:{opp.vpc_id}</code>} />
            </div>
            <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-secondary text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
              {t("opportunityDetail.onchain.note")}
            </div>
          </Section>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }} className="lg:sticky lg:top-6">
            <InvestPanel opp={opp} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
