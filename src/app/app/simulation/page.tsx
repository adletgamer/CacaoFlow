"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockOutcome, mockScoring } from "@/lib/mockData";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function OutcomeSimulationPage() {
  const [simulated, setSimulated] = useState(false);
  const { t } = useT();
  const s = mockOutcome;
  const scoring = mockScoring[s.lotId];

  const handleSimulate = () => {
    setSimulated(true);
    toast.success(t("simulation.completeBtn"), {
      description: t("simulation.disclaimer").replace("⚠️ ", ""),
    });
  };

  return (
    <>
      <PageHeader title={t("simulation.title")} description={t("simulation.description")} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Scenario */}
        <Card>
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif">{t("simulation.scenario.title")}</CardTitle>
              <Badge variant="success">{t("simulation.scenario.badge")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-md bg-secondary">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("simulation.fields.projectedYield")}</p>
                <p className="text-lg font-semibold tabular-nums mt-1">{s.projectedYield} {t("common.ton")}</p>
              </div>
              <div className="text-center p-3 rounded-md bg-secondary">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("simulation.fields.actualYield")}</p>
                <p className="text-lg font-semibold tabular-nums mt-1">{s.actualYield} {t("common.ton")}</p>
                <Badge variant="success" className="mt-1 text-[10px]">+{((s.performanceRatio - 1) * 100).toFixed(1)}%</Badge>
              </div>
              <div className="text-center p-3 rounded-md bg-secondary">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("simulation.fields.pricePerKg")}</p>
                <p className="text-lg font-semibold tabular-nums mt-1">${s.pricePerKg.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-md bg-secondary">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("simulation.fields.totalRevenue")}</p>
                <p className="text-lg font-semibold tabular-nums mt-1">${s.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-serif">{t("simulation.distribution.title")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("simulation.distribution.financier")}</p>
                    <p className="text-xl font-bold tabular-nums">${s.financierRepayment.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.distribution.financierNote")} {scoring ? `$${scoring.maxFunding.toLocaleString()}` : t("common.na")}
                </p>
              </div>

              <div className="rounded-md border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("simulation.distribution.producer")}</p>
                    <p className="text-xl font-bold tabular-nums">${s.producerNet.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.distribution.producerNote")}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-secondary p-3 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-foreground">{t("simulation.distribution.ratioLabel")}: <span className="tabular-nums">{(s.performanceRatio * 100).toFixed(1)}%</span></p>
                <p className="text-muted-foreground">{t("simulation.distribution.ratioNote")}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant={simulated ? "outline" : "accent"}
                disabled={simulated}
                onClick={handleSimulate}
                className="min-w-[200px]"
              >
                {simulated ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("simulation.completeBtn")}
                  </span>
                ) : (
                  t("simulation.runBtn")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md bg-secondary/50 border border-border/50 p-3 text-xs text-muted-foreground text-center">
          {t("simulation.disclaimer")}
        </div>
      </motion.div>
    </>
  );
}
