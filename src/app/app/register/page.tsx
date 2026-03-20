"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Upload,
  FileText,
  X,
  Plus,
  Building2,
  MapPin,
  Sprout,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { DocumentType } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────

type Section = "originator" | "plot" | "production" | "evidence" | "review";

const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "originator", label: "Originator", icon: Building2 },
  { key: "plot", label: "Plot Basics", icon: MapPin },
  { key: "production", label: "Production", icon: Sprout },
  { key: "evidence", label: "Evidence", icon: Upload },
  { key: "review", label: "Review", icon: ClipboardList },
];

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  land_record: "Land Record",
  yield_history: "Yield History",
  crop_plan: "Crop Plan",
  photo_evidence: "Photo Evidence",
  other: "Other",
};

interface PendingDoc {
  id: string;
  document_type: DocumentType;
  file_name: string;
}

// ─── Component ───────────────────────────────────────────────

export default function RegisterPlotPage() {
  const router = useRouter();
  const { originators, addOriginator, addPlot } = useAppStore();

  const [section, setSection] = useState<Section>("originator");
  const [loading, setLoading] = useState(false);

  // Originator state
  const [originatorMode, setOriginatorMode] = useState<"select" | "create">(
    originators.length > 0 ? "select" : "create"
  );
  const [selectedOriginatorId, setSelectedOriginatorId] = useState("");
  const [newOriginator, setNewOriginator] = useState({
    name: "",
    type: "producer" as "producer" | "cooperative",
    region: "",
    contact_name: "",
    contact_email: "",
  });

  // Plot state
  const [plotData, setPlotData] = useState({
    plot_name: "",
    crop_type: "" as "" | "CCN-51" | "Fino de Aroma" | "Trinitario",
    country: "",
    region: "",
    area_hectares: "",
    season_label: "",
  });

  // Production state
  const [productionData, setProductionData] = useState({
    expected_yield_tons: "",
    estimated_harvest_date: "",
  });

  // Evidence state
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [newDocType, setNewDocType] = useState<DocumentType>("photo_evidence");
  const [newDocName, setNewDocName] = useState("");

  // ─── Derived ─────────────────────────────────────────────

  const currentSectionIdx = SECTIONS.findIndex((s) => s.key === section);

  const resolvedOriginatorId = useMemo(() => {
    if (originatorMode === "select") return selectedOriginatorId;
    return "";
  }, [originatorMode, selectedOriginatorId]);

  const resolvedOriginator = useMemo(() => {
    if (originatorMode === "select") {
      return originators.find((o) => o.id === selectedOriginatorId);
    }
    if (newOriginator.name && newOriginator.region) return newOriginator;
    return null;
  }, [originatorMode, selectedOriginatorId, originators, newOriginator]);

  // ─── Validation ──────────────────────────────────────────

  function validateSection(s: Section): string | null {
    switch (s) {
      case "originator":
        if (originatorMode === "select" && !selectedOriginatorId) return "Select an originator";
        if (originatorMode === "create") {
          if (!newOriginator.name) return "Originator name is required";
          if (!newOriginator.region) return "Region is required";
        }
        return null;
      case "plot":
        if (!plotData.plot_name) return "Plot name is required";
        if (!plotData.crop_type) return "Crop type is required";
        if (!plotData.country) return "Country is required";
        if (!plotData.region) return "Region is required";
        if (!plotData.area_hectares || parseFloat(plotData.area_hectares) <= 0) return "Area must be greater than 0";
        if (!plotData.season_label) return "Season is required";
        return null;
      case "production":
        if (!productionData.expected_yield_tons || parseFloat(productionData.expected_yield_tons) <= 0) return "Expected yield must be greater than 0";
        return null;
      default:
        return null;
    }
  }

  function canAdvance(): boolean {
    return validateSection(section) === null;
  }

  // ─── Navigation ──────────────────────────────────────────

  function goNext() {
    const error = validateSection(section);
    if (error) {
      toast.error(error);
      return;
    }
    const idx = currentSectionIdx;
    if (idx < SECTIONS.length - 1) setSection(SECTIONS[idx + 1].key);
  }

  function goBack() {
    const idx = currentSectionIdx;
    if (idx > 0) setSection(SECTIONS[idx - 1].key);
  }

  // ─── Add document ────────────────────────────────────────

  function addDoc() {
    if (!newDocName.trim()) {
      toast.error("Enter a file name");
      return;
    }
    setPendingDocs((prev) => [
      ...prev,
      { id: crypto.randomUUID().slice(0, 8), document_type: newDocType, file_name: newDocName.trim() },
    ]);
    setNewDocName("");
  }

  function removeDoc(id: string) {
    setPendingDocs((prev) => prev.filter((d) => d.id !== id));
  }

  // ─── Submit ──────────────────────────────────────────────

  async function handleSubmit() {
    // Final validation pass
    for (const s of SECTIONS.slice(0, -1)) {
      const err = validateSection(s.key);
      if (err) {
        toast.error(`${s.label}: ${err}`);
        setSection(s.key);
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    try {
      // 1. Resolve originator
      let originatorId = resolvedOriginatorId;
      if (originatorMode === "create") {
        const created = addOriginator(newOriginator);
        originatorId = created.id;
      }

      // 2. Insert plot + docs
      const plot = addPlot(
        {
          originator_id: originatorId,
          plot_name: plotData.plot_name,
          crop_type: plotData.crop_type as "CCN-51" | "Fino de Aroma" | "Trinitario",
          country: plotData.country,
          region: plotData.region,
          area_hectares: parseFloat(plotData.area_hectares),
          season_label: plotData.season_label,
          expected_yield_tons: parseFloat(productionData.expected_yield_tons),
          estimated_harvest_date: productionData.estimated_harvest_date,
        },
        pendingDocs.map((d) => ({ document_type: d.document_type, file_name: d.file_name }))
      );

      const hasEvidence = pendingDocs.length > 0;

      toast.success("Plot registered successfully", {
        description: `${plot.id} · Status: ${hasEvidence ? "ready_for_scoring" : "registered"}`,
      });

      // 3. Redirect
      router.push("/app/lots");
    } catch (e) {
      toast.error("Failed to register plot");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <>
      <PageHeader title="Register New Plot" description="Create a new plot record with originator, production data, and evidence." />

      {/* Step indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
        {SECTIONS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            {i > 0 && <span className="text-border mx-0.5">→</span>}
            <button
              onClick={() => {
                if (i <= currentSectionIdx) setSection(s.key);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium transition-colors",
                section === s.key
                  ? "bg-primary/10 text-primary"
                  : i < currentSectionIdx
                  ? "bg-success/10 text-success cursor-pointer"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {i < currentSectionIdx ? <CheckCircle2 className="h-3 w-3 inline mr-1" /> : null}
              {s.label}
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* ─── Section 1: Originator ─────────────────────── */}
          {section === "originator" && (
            <Card>
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Originator
                </CardTitle>
                <p className="text-xs text-muted-foreground">Select an existing originator or create a new one</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {originators.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={originatorMode === "select" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOriginatorMode("select")}
                    >
                      Select existing
                    </Button>
                    <Button
                      type="button"
                      variant={originatorMode === "create" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOriginatorMode("create")}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create new
                    </Button>
                  </div>
                )}

                {originatorMode === "select" && originators.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label>Originator *</Label>
                    <Select value={selectedOriginatorId} onValueChange={setSelectedOriginatorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select originator..." />
                      </SelectTrigger>
                      <SelectContent>
                        {originators.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name} · {o.type} · {o.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Name *</Label>
                        <Input
                          placeholder="Cooperativa San Martín"
                          value={newOriginator.name}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Type *</Label>
                        <Select value={newOriginator.type} onValueChange={(v) => setNewOriginator((p) => ({ ...p, type: v as "producer" | "cooperative" }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="producer">Producer</SelectItem>
                            <SelectItem value="cooperative">Cooperative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Region *</Label>
                      <Input
                        placeholder="Huila, Colombia"
                        value={newOriginator.region}
                        onChange={(e) => setNewOriginator((p) => ({ ...p, region: e.target.value }))}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Contact Name</Label>
                        <Input
                          placeholder="Juan Pérez"
                          value={newOriginator.contact_name}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, contact_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Contact Email</Label>
                        <Input
                          type="email"
                          placeholder="juan@coop.co"
                          value={newOriginator.contact_email}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, contact_email: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ─── Section 2: Plot Basics ────────────────────── */}
          {section === "plot" && (
            <Card>
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Plot Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>Plot Name *</Label>
                  <Input
                    placeholder="Finca El Progreso – Lote Norte"
                    value={plotData.plot_name}
                    onChange={(e) => setPlotData((p) => ({ ...p, plot_name: e.target.value }))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Crop Type *</Label>
                    <Select value={plotData.crop_type} onValueChange={(v) => setPlotData((p) => ({ ...p, crop_type: v as any }))}>
                      <SelectTrigger><SelectValue placeholder="Select crop..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fino de Aroma">Fino de Aroma</SelectItem>
                        <SelectItem value="CCN-51">CCN-51</SelectItem>
                        <SelectItem value="Trinitario">Trinitario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Season *</Label>
                    <Input
                      placeholder="2026-A"
                      value={plotData.season_label}
                      onChange={(e) => setPlotData((p) => ({ ...p, season_label: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Country *</Label>
                    <Input
                      placeholder="Colombia"
                      value={plotData.country}
                      onChange={(e) => setPlotData((p) => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Region *</Label>
                    <Input
                      placeholder="Huila"
                      value={plotData.region}
                      onChange={(e) => setPlotData((p) => ({ ...p, region: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Area (hectares) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="4.5"
                    value={plotData.area_hectares}
                    onChange={(e) => setPlotData((p) => ({ ...p, area_hectares: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Section 3: Production ─────────────────────── */}
          {section === "production" && (
            <Card>
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  Production Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>Expected Yield (tons) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.8"
                    value={productionData.expected_yield_tons}
                    onChange={(e) => setProductionData((p) => ({ ...p, expected_yield_tons: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">Estimated production for this season in metric tons.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Harvest Date</Label>
                  <Input
                    type="date"
                    value={productionData.estimated_harvest_date}
                    onChange={(e) => setProductionData((p) => ({ ...p, estimated_harvest_date: e.target.value }))}
                  />
                </div>

                <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground mt-2">
                  <p className="font-medium text-foreground mb-1">About yield estimation</p>
                  <p>This figure will be used as the base for the scoring engine. Provide your best realistic estimate for this season.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Section 4: Evidence ───────────────────────── */}
          {section === "evidence" && (
            <Card>
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Evidence Documents
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  At least 1 document is required for the plot to be marked as <Badge variant="default" className="text-[10px] ml-1">ready_for_scoring</Badge>
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Add new doc */}
                <div className="flex gap-2 items-end">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label>File Name</Label>
                    <Input
                      placeholder="land_certificate_2026.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDoc(); } }}
                    />
                  </div>
                  <div className="space-y-1.5 w-44">
                    <Label>Type</Label>
                    <Select value={newDocType} onValueChange={(v) => setNewDocType(v as DocumentType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(DOC_TYPE_LABELS) as DocumentType[]).map((dt) => (
                          <SelectItem key={dt} value={dt}>{DOC_TYPE_LABELS[dt]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="accent" size="sm" onClick={addDoc} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Doc list */}
                {pendingDocs.length > 0 ? (
                  <div className="space-y-2">
                    {pendingDocs.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 rounded-md border border-border/50 p-3 bg-secondary/30">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{d.file_name}</p>
                          <p className="text-[10px] text-muted-foreground">{DOC_TYPE_LABELS[d.document_type]}</p>
                        </div>
                        <button onClick={() => removeDoc(d.id)} className="shrink-0 h-6 w-6 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Without evidence, the plot will be saved as <span className="font-medium">registered</span> (not ready for scoring).</p>
                  </div>
                )}

                <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">MVP Note</p>
                  <p>In this demo, documents are registered by name only. In production, file uploads would go to cloud storage.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Section 5: Review + Submit ────────────────── */}
          {section === "review" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Review Before Submitting
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  {/* Originator summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Originator</p>
                    {resolvedOriginator ? (
                      <div className="rounded-md bg-secondary/50 p-3 text-sm">
                        <p className="font-medium">{"name" in resolvedOriginator ? resolvedOriginator.name : ""}</p>
                        <p className="text-xs text-muted-foreground">
                          {"type" in resolvedOriginator ? resolvedOriginator.type : ""} · {"region" in resolvedOriginator ? resolvedOriginator.region : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">No originator selected</p>
                    )}
                  </div>

                  {/* Plot summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Plot</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: "Name", value: plotData.plot_name },
                        { label: "Crop", value: plotData.crop_type },
                        { label: "Location", value: `${plotData.region}, ${plotData.country}` },
                        { label: "Area", value: plotData.area_hectares ? `${plotData.area_hectares} ha` : "" },
                        { label: "Season", value: plotData.season_label },
                      ].map((item) => (
                        <div key={item.label} className="rounded-md bg-secondary/50 p-2.5">
                          <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                          <p className="text-sm font-medium">{item.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Production summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Production</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-md bg-secondary/50 p-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase">Expected Yield</p>
                        <p className="text-sm font-medium">{productionData.expected_yield_tons ? `${productionData.expected_yield_tons} Ton` : "—"}</p>
                      </div>
                      <div className="rounded-md bg-secondary/50 p-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase">Harvest Date</p>
                        <p className="text-sm font-medium">{productionData.estimated_harvest_date || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Evidence summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Evidence</p>
                    {pendingDocs.length > 0 ? (
                      <div className="space-y-1.5">
                        {pendingDocs.map((d) => (
                          <div key={d.id} className="flex items-center gap-2 text-sm">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{d.file_name}</span>
                            <Badge variant="outline" className="text-[10px]">{DOC_TYPE_LABELS[d.document_type]}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-warning">No documents — plot will be saved as <span className="font-medium">registered</span></p>
                    )}
                  </div>

                  {/* Status preview */}
                  <div className="rounded-md border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">After submission, this plot will be:</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={pendingDocs.length > 0 ? "success" : "accent"}>
                        {pendingDocs.length > 0 ? "ready_for_scoring" : "registered"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Badge variant="outline">
                        {pendingDocs.length > 0 ? "sufficient" : "insufficient"} documentation
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Navigation Footer ──────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentSectionIdx === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {section === "review" ? (
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Register Plot
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button variant="accent" onClick={goNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </>
  );
}
