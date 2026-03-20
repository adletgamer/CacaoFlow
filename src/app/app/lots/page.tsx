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

// ─── Status config ───────────────────────────────────────────

const STATUS_CONFIG: Record<PlotStatus, { label: string; variant: "default" | "success" | "warning" | "accent" | "destructive" | "outline"; order: number }> = {
  draft:             { label: "Draft",             variant: "outline",     order: 0 },
  registered:        { label: "Registered",        variant: "accent",      order: 1 },
  ready_for_scoring: { label: "Ready for Scoring", variant: "warning",     order: 2 },
  scored:            { label: "Scored",             variant: "default",     order: 3 },
  vpc_issued:        { label: "VPC Issued",         variant: "default",     order: 4 },
  under_review:      { label: "Under Review",       variant: "warning",     order: 5 },
  pre_approved:      { label: "Pre-Approved",       variant: "success",     order: 6 },
  rejected:          { label: "Rejected",           variant: "destructive", order: 7 },
};

const NEXT_ACTION: Record<PlotStatus, { label: string; icon: React.ElementType; href?: string } | null> = {
  draft:             { label: "Continue registration", icon: ArrowRight, href: "/app/register" },
  registered:        { label: "Add evidence",          icon: FileText },
  ready_for_scoring: { label: "Generate score",        icon: BarChart3 },
  scored:            { label: "Issue VPC",             icon: Shield },
  vpc_issued:        { label: "Send to review",        icon: Send },
  under_review:      { label: "View review",           icon: Eye,       href: "/app/financing" },
  pre_approved:      { label: "View simulation",       icon: Eye,       href: "/app/simulation" },
  rejected:          null,
};

// ─── Component ───────────────────────────────────────────────

export default function MyLotsPage() {
  const { plots, originators, documents } = useAppStore();

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
      const orderA = STATUS_CONFIG[a.status]?.order ?? 99;
      const orderB = STATUS_CONFIG[b.status]?.order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [plots, searchQuery, statusFilter, cropFilter, originatorFilter]);

  function getOriginatorName(id: string) {
    return originators.find((o) => o.id === id)?.name ?? "Unknown";
  }

  function getDocCount(plotId: string) {
    return documents.filter((d) => d.plot_id === plotId).length;
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <>
      <PageHeader title="My Plots" description="All registered plots and their current operational status">
        <Link href="/app/register">
          <Button variant="accent" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Register Plot
          </Button>
        </Link>
      </PageHeader>

      {/* ─── Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
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
                <SelectValue placeholder="Crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All crops</SelectItem>
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
                <SelectValue placeholder="Originator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All originators</SelectItem>
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
          <Card className="mt-2">
            <CardContent className="py-16 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No plots registered yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Register your first productive plot to start the scoring and financing process.
              </p>
              <Link href="/app/register">
                <Button variant="accent">
                  <Plus className="h-4 w-4 mr-1" />
                  Register First Plot
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : filteredPlots.length === 0 ? (
        /* Empty state: no results for filters */
        <Card className="mt-2">
          <CardContent className="py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No plots match current filters</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCropFilter("all"); setOriginatorFilter("all"); }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-3 px-4 font-medium">Plot</th>
                      <th className="text-left py-3 px-4 font-medium">Originator</th>
                      <th className="text-left py-3 px-4 font-medium">Crop · Region</th>
                      <th className="text-right py-3 px-4 font-medium">Area</th>
                      <th className="text-right py-3 px-4 font-medium">Yield</th>
                      <th className="text-center py-3 px-4 font-medium">Docs</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Action</th>
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
                          <td className="py-3 px-4 text-right tabular-nums">{plot.area_hectares} ha</td>
                          <td className="py-3 px-4 text-right tabular-nums">{plot.expected_yield_tons} Ton</td>
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
                                <Link href={action.href}>
                                  <Button variant="outline" size="sm" className="text-xs h-7">
                                    <action.icon className="h-3 w-3 mr-1" />
                                    {action.label}
                                  </Button>
                                </Link>
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
                  <Card className="hover:shadow-elevated transition-shadow">
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
                        <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{plot.area_hectares} ha</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{plot.expected_yield_tons} Ton</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{docCount} docs</span>
                      </div>

                      {/* Row 3: originator */}
                      <p className="text-xs text-muted-foreground">
                        Originator: <span className="text-foreground font-medium">{getOriginatorName(plot.originator_id)}</span>
                        {" · "}Season: <span className="text-foreground font-medium">{plot.season_label}</span>
                      </p>

                      {/* Row 4: action */}
                      {action && (
                        <div className="pt-2 border-t border-border/50">
                          {action.href ? (
                            <Link href={action.href} className="block">
                              <Button variant="outline" size="sm" className="w-full text-xs">
                                <action.icon className="h-3.5 w-3.5 mr-1.5" />
                                {action.label}
                              </Button>
                            </Link>
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
            Showing {filteredPlots.length} of {plots.length} plot{plots.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </>
  );
}
