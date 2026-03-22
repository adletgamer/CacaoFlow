"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Sprout,
  Calendar,
  Ruler,
  Search,
  Plus,
  FileText,
  BarChart3,
  Shield,
  Send,
  Eye,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { PlotStatus, Plot } from "@/lib/types";
import { useT } from "@/hooks/useT";

// ─── Status config (variants only — labels come from i18n) ──────────

const STATUS_VARIANT: Record<PlotStatus, "default" | "success" | "warning" | "accent" | "destructive" | "outline"> = {
  draft:             "outline",
  registered:        "accent",
  ready_for_scoring: "warning",
  scored:            "default",
  vpc_issued:        "default",
  under_review:      "warning",
  pre_approved:      "success",
  rejected:          "destructive",
};

const STATUS_ORDER: Record<PlotStatus, number> = {
  draft: 0, registered: 1, ready_for_scoring: 2, scored: 3,
  vpc_issued: 4, under_review: 5, pre_approved: 6, rejected: 7,
};

// ─── Component ───────────────────────────────────────────────

export default function MyLotsPage() {
  const { plots, originators, documents } = useAppStore();
  const { t } = useT();

  const STATUS_CONFIG = (Object.keys(STATUS_VARIANT) as PlotStatus[]).reduce((acc, key) => {
    acc[key] = { label: t(`lots.status.${key}`), variant: STATUS_VARIANT[key], order: STATUS_ORDER[key] };
    return acc;
  }, {} as Record<PlotStatus, { label: string; variant: typeof STATUS_VARIANT[PlotStatus]; order: number }>);

  const NEXT_ACTION: Record<PlotStatus, { label: string; icon: React.ElementType; href?: string } | null> = {
    draft:             { label: t("lots.action.continueRegistration"), icon: ArrowRight, href: "/app/register" },
    registered:        { label: t("lots.action.addEvidence"),          icon: FileText },
    ready_for_scoring: { label: t("lots.action.generateScore"),        icon: BarChart3 },
    scored:            { label: t("lots.action.issueVpc"),             icon: Shield },
    vpc_issued:        { label: t("lots.action.sendToReview"),         icon: Send },
    under_review:      { label: t("lots.action.viewReview"),           icon: Eye, href: "/app/financing" },
    pre_approved:      { label: t("lots.action.viewSimulation"),       icon: Eye, href: "/app/simulation" },
    rejected:          null,
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cropFilter, setCropFilter] = useState<string>("all");
  const [originatorFilter, setOriginatorFilter] = useState<string>("all");

  // Derived: unique values for filter dropdowns
  const uniqueCrops = useMemo(() => [...new Set(plots.map((p) => p.crop_type))], [plots]);
  const usedOriginatorIds = useMemo(() => [...new Set(plots.map((p) => p.originator_id))], [plots]);
  const usedOriginators = useMemo(() => originators.filter((o) => usedOriginatorIds.includes(o.id)), [originators, usedOriginatorIds]);

  // Filter + sort
  const filteredPlots = useMemo(() => {
    let result = [...plots];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.plot_name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Crop filter
    if (cropFilter !== "all") {
      result = result.filter((p) => p.crop_type === cropFilter);
    }

    // Originator filter
    if (originatorFilter !== "all") {
      result = result.filter((p) => p.originator_id === originatorFilter);
    }

    // Sort: actionable first (lower order number = needs action sooner), then by created_at desc
    result.sort((a, b) => {
      const orderA = STATUS_ORDER[a.status] ?? 99;
      const orderB = STATUS_ORDER[b.status] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [plots, searchQuery, statusFilter, cropFilter, originatorFilter]);

  function getOriginatorName(id: string) {
    return originators.find((o) => o.id === id)?.name ?? t("common.unknown");
  }

  function getDocCount(plotId: string) {
    return documents.filter((d) => d.plot_id === plotId).length;
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <>
      <PageHeader title={t("lots.title")} description={t("lots.description")}>
        <Button variant="accent" size="sm" asChild>
          <Link href="/app/register">
            <Plus className="h-4 w-4 mr-1" />
            {t("lots.registerPlot")}
          </Link>
        </Button>
      </PageHeader>

      {/* ─── Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("lots.filters.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder={t("lots.filters.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("lots.filters.allStatuses")}</SelectItem>
              {(Object.keys(STATUS_CONFIG) as PlotStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {uniqueCrops.length > 1 && (
          <div className="w-40">
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={t("lots.filters.allCrops")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("lots.filters.allCrops")}</SelectItem>
                {uniqueCrops.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {usedOriginators.length > 1 && (
          <div className="w-48">
            <Select value={originatorFilter} onValueChange={setOriginatorFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={t("lots.filters.allOriginators")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("lots.filters.allOriginators")}</SelectItem>
                {usedOriginators.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ─── Plot List ──────────────────────────────────────── */}
      {plots.length === 0 ? (
        /* Empty state: no plots at all */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mt-2 rounded-2xl border-border/40">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1 font-serif">{t("lots.empty.title")}</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t("lots.empty.body")}
              </p>
              <Button variant="accent" asChild>
                <Link href="/app/register">
                  <Plus className="h-4 w-4 mr-1" />
                  {t("lots.empty.cta")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : filteredPlots.length === 0 ? (
        /* Empty state: no results for filters */
        <Card className="mt-2">
          <CardContent className="py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">{t("lots.emptyFiltered.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("lots.emptyFiltered.body")}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCropFilter("all"); setOriginatorFilter("all"); }}>
              {t("lots.filters.clearFilters")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <Card className="rounded-2xl border-border/40 shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-3 px-4 font-medium">{t("lots.table.plot")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("lots.table.originator")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("lots.table.cropRegion")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("lots.table.area")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("lots.table.yield")}</th>
                      <th className="text-center py-3 px-4 font-medium">{t("lots.table.docs")}</th>
                      <th className="text-left py-3 px-4 font-medium">{t("lots.table.status")}</th>
                      <th className="text-right py-3 px-4 font-medium">{t("lots.table.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlots.map((plot, i) => {
                      const statusCfg = STATUS_CONFIG[plot.status];
                      const action = NEXT_ACTION[plot.status];
                      const docCount = getDocCount(plot.id);

                      return (
                        <motion.tr
                          key={plot.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03, duration: 0.3 }}
                          className="border-b border-border/30 hover:bg-secondary/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium">{plot.plot_name}</p>
                            <p className="text-[10px] text-muted-foreground tabular-nums">{plot.id}</p>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {getOriginatorName(plot.originator_id)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5">
                              <Sprout className="h-3 w-3 text-muted-foreground" />
                              {plot.crop_type}
                            </span>
                            <span className="text-xs text-muted-foreground">{plot.region}, {plot.country}</span>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">{plot.area_hectares} {t("common.ha")}</td>
                          <td className="py-3 px-4 text-right tabular-nums">{plot.expected_yield_tons} {t("common.ton")}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={docCount > 0 ? "outline" : "destructive"} className="text-[10px]">
                              {docCount}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {action && (
                              action.href ? (
                                <Button variant="outline" size="sm" className="text-xs h-7" asChild>
                                  <Link href={action.href}>
                                    <action.icon className="h-3 w-3 mr-1" />
                                    {action.label}
                                  </Link>
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-xs h-7" disabled>
                                  <action.icon className="h-3 w-3 mr-1" />
                                  {action.label}
                                </Button>
                              )
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden grid gap-3">
            {filteredPlots.map((plot, i) => {
              const statusCfg = STATUS_CONFIG[plot.status];
              const action = NEXT_ACTION[plot.status];
              const docCount = getDocCount(plot.id);

              return (
                <motion.div
                  key={plot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow rounded-2xl border-border/40">
                    <CardContent className="p-4 space-y-3">
                      {/* Row 1: name + status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{plot.plot_name}</p>
                          <p className="text-[10px] text-muted-foreground tabular-nums">{plot.id}</p>
                        </div>
                        <Badge variant={statusCfg.variant as any} className="shrink-0">{statusCfg.label}</Badge>
                      </div>

                      {/* Row 2: details */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Sprout className="h-3 w-3" />{plot.crop_type}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{plot.region}, {plot.country}</span>
                        <span className="flex items-center gap-1.5"><Ruler className="h-3 w-3" />{plot.area_hectares} {t("common.ha")}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{plot.expected_yield_tons} {t("common.ton")}</span>
                        <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" />{docCount} {t("lots.mobile.docs")}</span>
                      </div>

                      {/* Row 3: originator */}
                      <p className="text-xs text-muted-foreground">
                        {t("lots.mobile.originator")}: <span className="text-foreground font-medium">{getOriginatorName(plot.originator_id)}</span>
                        {" · "}
                        {t("lots.mobile.season")}: <span className="text-foreground font-medium">{plot.season_label}</span>
                      </p>

                      {/* Row 4: action */}
                      {action && (
                        <div className="pt-2 border-t border-border/50">
                          {action.href ? (
                            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                              <Link href={action.href} className="block">
                                <action.icon className="h-3.5 w-3.5 mr-1.5" />
                                {action.label}
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                              <action.icon className="h-3.5 w-3.5 mr-1.5" />
                              {action.label}
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          <p className="text-xs text-muted-foreground text-center">
            {filteredPlots.length !== plots.length
              ? t(plots.length !== 1 ? "lots.summaryPlural" : "lots.summary", { filtered: filteredPlots.length, total: plots.length })
              : t(plots.length !== 1 ? "lots.summaryPlural" : "lots.summary", { filtered: filteredPlots.length, total: plots.length })}
          </p>
        </>
      )}
    </>
  );
}
