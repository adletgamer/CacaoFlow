"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/features/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/appStore";
import { Leaf, TrendingUp, FileText, BarChart3, ArrowRight, Plus, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { PlotStatus } from "@/lib/types";

const STATUS_VARIANT: Record<PlotStatus, "default" | "success" | "warning" | "accent" | "destructive" | "outline"> = {
  draft: "outline",
  registered: "accent",
  ready_for_scoring: "warning",
  scored: "default",
  vpc_issued: "default",
  under_review: "warning",
  pre_approved: "success",
  rejected: "destructive",
};

export default function OverviewPage() {
  const { plots, documents, originators } = useAppStore();

  const totalYield = plots.reduce((sum, p) => sum + p.expected_yield_tons, 0);
  const totalArea = plots.reduce((sum, p) => sum + p.area_hectares, 0);
  const readyCount = plots.filter((p) => p.status === "ready_for_scoring").length;
  const recentPlots = [...plots].slice(0, 5);

  function getOriginatorName(id: string) {
    return originators.find((o) => o.id === id)?.name ?? "Unknown";
  }

  function getDocCount(plotId: string) {
    return documents.filter((d) => d.plot_id === plotId).length;
  }

  return (
    <>
      <PageHeader title="Overview" description="Dashboard summary for Aleph Cacao">
        <Link href="/app/register">
          <Button variant="accent" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Register Plot
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Leaf} title="Active Plots" value={plots.length} subtitle="registered" delay={0} />
        <StatCard icon={TrendingUp} title="Total Est. Yield" value={`${totalYield.toFixed(1)} Ton`} subtitle={`${totalArea.toFixed(1)} ha total`} delay={0.05} />
        <StatCard icon={BarChart3} title="Ready for Scoring" value={readyCount} subtitle="plots with evidence" delay={0.1} />
        <StatCard icon={FileText} title="Documents" value={documents.length} subtitle="uploaded evidence" delay={0.15} />
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        {[
          { to: "/app/register", label: "Register Plot", desc: "Create a new plot with originator and evidence", icon: Plus },
          { to: "/app/lots", label: "My Plots", desc: "View all plots and their operational status", icon: Leaf },
          { to: "/app/financing", label: "Financing Review", desc: "Review pre-approved candidates for financing", icon: DollarSign },
        ].map((action) => (
          <Link key={action.to} href={action.to}>
            <Card className="hover:shadow-elevated transition-all cursor-pointer group h-full">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Recent plots */}
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Plots</CardTitle>
            <Link href="/app/lots">
              <Button variant="ghost" size="sm" className="text-xs">View all →</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentPlots.length === 0 ? (
            <div className="py-12 text-center">
              <Leaf className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No plots yet. Register your first one to get started.</p>
              <Link href="/app/register">
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Register Plot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wider">Plot</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wider">Originator</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wider">Crop</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wider">Region</th>
                    <th className="text-right py-3 px-5 text-xs font-medium uppercase tracking-wider">Yield</th>
                    <th className="text-center py-3 px-5 text-xs font-medium uppercase tracking-wider">Docs</th>
                    <th className="text-left py-3 px-5 text-xs font-medium uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlots.map((plot) => (
                    <tr key={plot.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-5">
                        <p className="font-medium">{plot.plot_name}</p>
                        <p className="text-[10px] text-muted-foreground tabular-nums">{plot.id}</p>
                      </td>
                      <td className="py-3 px-5 text-muted-foreground">{getOriginatorName(plot.originator_id)}</td>
                      <td className="py-3 px-5">{plot.crop_type}</td>
                      <td className="py-3 px-5 text-muted-foreground">{plot.region}, {plot.country}</td>
                      <td className="py-3 px-5 text-right tabular-nums">{plot.expected_yield_tons} Ton</td>
                      <td className="py-3 px-5 text-center">
                        <Badge variant={getDocCount(plot.id) > 0 ? "outline" : "destructive"} className="text-[10px]">
                          {getDocCount(plot.id)}
                        </Badge>
                      </td>
                      <td className="py-3 px-5">
                        <Badge variant={STATUS_VARIANT[plot.status]}>
                          {plot.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
