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
import { useT } from "@/hooks/useT";

// ─── Types ───────────────────────────────────────────────────

type Section = "originator" | "plot" | "production" | "evidence" | "review";

const SECTION_ICONS: Record<Section, React.ElementType> = {
  originator: Building2,
  plot: MapPin,
  production: Sprout,
  evidence: Upload,
  review: ClipboardList,
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
  const { t } = useT();

  const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: "originator", label: t("register.sections.originator"), icon: SECTION_ICONS.originator },
    { key: "plot", label: t("register.sections.plot"), icon: SECTION_ICONS.plot },
    { key: "production", label: t("register.sections.production"), icon: SECTION_ICONS.production },
    { key: "evidence", label: t("register.sections.evidence"), icon: SECTION_ICONS.evidence },
    { key: "review", label: t("register.sections.review"), icon: SECTION_ICONS.review },
  ];

  const DOC_TYPE_LABELS: Record<DocumentType, string> = {
    identity_document: t("register.evidence.docTypes.identity_document"),
    land_record: t("register.evidence.docTypes.land_record"),
    yield_history: t("register.evidence.docTypes.yield_history"),
    crop_plan: t("register.evidence.docTypes.crop_plan"),
    field_photos: t("register.evidence.docTypes.field_photos"),
    offtake_agreement: t("register.evidence.docTypes.offtake_agreement"),
    bank_statement: t("register.evidence.docTypes.bank_statement"),
    other: t("register.evidence.docTypes.other"),
  };

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
    country: "",
    region: "",
    district: "",
    contact_name: "",
    contact_email: "",
  });

  // Plot state
  const [plotData, setPlotData] = useState({
    plot_name: "",
    crop_type: "" as "" | "CCN-51" | "Fino de Aroma" | "Trinitario",
    country: "",
    region: "",
    district: "",
    area_hectares: "",
    season_label: "",
    land_tenure_type: "owned" as "owned" | "leased" | "communal" | "other",
    irrigation_type: "rainfed" as "rainfed" | "irrigated" | "mixed",
    current_crop_stage: "vegetative" as "planting" | "vegetative" | "flowering" | "fruit_development" | "pre_harvest" | "harvest",
    location_note: "",
  });

  // Production state
  const [productionData, setProductionData] = useState({
    expected_yield_tons: "",
    estimated_harvest_date: "",
  });

  // Evidence state
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [newDocType, setNewDocType] = useState<DocumentType>("field_photos");
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
        if (originatorMode === "select" && !selectedOriginatorId) return t("register.validation.selectOriginator");
        if (originatorMode === "create") {
          if (!newOriginator.name) return t("register.validation.originatorName");
          if (!newOriginator.region) return t("register.validation.originatorRegion");
        }
        return null;
      case "plot":
        if (!plotData.plot_name) return t("register.validation.plotName");
        if (!plotData.crop_type) return t("register.validation.cropType");
        if (!plotData.country) return t("register.validation.country");
        if (!plotData.region) return t("register.validation.region");
        if (!plotData.area_hectares || parseFloat(plotData.area_hectares) <= 0) return t("register.validation.area");
        if (!plotData.season_label) return t("register.validation.season");
        return null;
      case "production":
        if (!productionData.expected_yield_tons || parseFloat(productionData.expected_yield_tons) <= 0) return t("register.validation.yield");
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
      toast.error(t("register.toast.enterFileName"));
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
          district: plotData.district,
          area_hectares: parseFloat(plotData.area_hectares),
          season_label: plotData.season_label,
          land_tenure_type: plotData.land_tenure_type,
          irrigation_type: plotData.irrigation_type,
          current_crop_stage: plotData.current_crop_stage,
          location_note: plotData.location_note || undefined,
          expected_yield_tons: parseFloat(productionData.expected_yield_tons),
          estimated_harvest_date: productionData.estimated_harvest_date,
        },
        pendingDocs.map((d) => ({ document_type: d.document_type, file_name: d.file_name }))
      );

      const hasEvidence = pendingDocs.length > 0;

      toast.success(t("register.toast.success"), {
        description: `${plot.id} · Status: ${hasEvidence ? "ready_for_scoring" : "registered"}`,
      });

      // 3. Redirect
      router.push("/app/lots");
    } catch (e) {
      toast.error(t("register.toast.error"));
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <>
      <PageHeader title={t("register.title")} description={t("register.description")} />

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
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {t("register.originator.title")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t("register.originator.subtitle")}</p>
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
                      {t("register.originator.selectExisting")}
                    </Button>
                    <Button
                      type="button"
                      variant={originatorMode === "create" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOriginatorMode("create")}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("register.originator.createNew")}
                    </Button>
                  </div>
                )}

                {originatorMode === "select" && originators.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label>{t("register.originator.selectLabel")} *</Label>
                    <Select value={selectedOriginatorId} onValueChange={setSelectedOriginatorId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("register.originator.selectPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {originators.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name} · {t(`register.originator.types.${o.type}`)} · {o.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.name")} *</Label>
                        <Input
                          placeholder={t("register.originator.namePlaceholder")}
                          value={newOriginator.name}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.type")} *</Label>
                        <Select value={newOriginator.type} onValueChange={(v) => setNewOriginator((p) => ({ ...p, type: v as "producer" | "cooperative" }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="producer">{t("register.originator.types.producer")}</SelectItem>
                            <SelectItem value="cooperative">{t("register.originator.types.cooperative")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("register.plot.country")} *</Label>
                        <Input
                          placeholder={t("register.plot.countryPlaceholder")}
                          value={newOriginator.country}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, country: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.region")} *</Label>
                        <Input
                          placeholder={t("register.originator.regionPlaceholder")}
                          value={newOriginator.region}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, region: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.district")}</Label>
                        <Input
                          placeholder={t("register.originator.districtPlaceholder")}
                          value={newOriginator.district}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, district: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.contactName")}</Label>
                        <Input
                          placeholder={t("register.originator.contactNamePlaceholder")}
                          value={newOriginator.contact_name}
                          onChange={(e) => setNewOriginator((p) => ({ ...p, contact_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("register.originator.contactEmail")}</Label>
                        <Input
                          type="email"
                          placeholder={t("register.originator.contactEmailPlaceholder")}
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
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {t("register.plot.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("register.plot.name")} *</Label>
                  <Input
                    placeholder={t("register.plot.namePlaceholder")}
                    value={plotData.plot_name}
                    onChange={(e) => setPlotData((p) => ({ ...p, plot_name: e.target.value }))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.cropType")} *</Label>
                    <Select value={plotData.crop_type} onValueChange={(v) => setPlotData((p) => ({ ...p, crop_type: v as "CCN-51" | "Fino de Aroma" | "Trinitario" }))}>
                      <SelectTrigger><SelectValue placeholder={t("register.plot.cropPlaceholder")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fino de Aroma">Fino de Aroma</SelectItem>
                        <SelectItem value="CCN-51">CCN-51</SelectItem>
                        <SelectItem value="Trinitario">Trinitario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.season")} *</Label>
                    <Input
                      placeholder={t("register.plot.seasonPlaceholder")}
                      value={plotData.season_label}
                      onChange={(e) => setPlotData((p) => ({ ...p, season_label: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.country")} *</Label>
                    <Input
                      placeholder={t("register.plot.countryPlaceholder")}
                      value={plotData.country}
                      onChange={(e) => setPlotData((p) => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.region")} *</Label>
                    <Input
                      placeholder={t("register.plot.regionPlaceholder")}
                      value={plotData.region}
                      onChange={(e) => setPlotData((p) => ({ ...p, region: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.district")}</Label>
                    <Input
                      placeholder={t("register.plot.districtPlaceholder")}
                      value={plotData.district}
                      onChange={(e) => setPlotData((p) => ({ ...p, district: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.landTenure")}</Label>
                    <Select value={plotData.land_tenure_type} onValueChange={(v) => setPlotData((p) => ({ ...p, land_tenure_type: v as "owned" | "leased" | "communal" | "other" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["owned","leased","communal","other"] as const).map((v) => (
                          <SelectItem key={v} value={v}>{t(`register.plot.landTenureTypes.${v}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.irrigation")}</Label>
                    <Select value={plotData.irrigation_type} onValueChange={(v) => setPlotData((p) => ({ ...p, irrigation_type: v as "rainfed" | "irrigated" | "mixed" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["rainfed","irrigated","mixed"] as const).map((v) => (
                          <SelectItem key={v} value={v}>{t(`register.plot.irrigationTypes.${v}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("register.plot.cropStage")}</Label>
                    <Select value={plotData.current_crop_stage} onValueChange={(v) => setPlotData((p) => ({ ...p, current_crop_stage: v as "planting" | "vegetative" | "flowering" | "fruit_development" | "pre_harvest" | "harvest" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["planting","vegetative","flowering","fruit_development","pre_harvest","harvest"] as const).map((v) => (
                          <SelectItem key={v} value={v}>{t(`register.plot.cropStages.${v}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("register.plot.area")} *</Label>
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
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  {t("register.production.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>{t("register.production.yield")} *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.8"
                    value={productionData.expected_yield_tons}
                    onChange={(e) => setProductionData((p) => ({ ...p, expected_yield_tons: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">{t("register.production.yieldNote")}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("register.production.harvestDate")}</Label>
                  <Input
                    type="date"
                    value={productionData.estimated_harvest_date}
                    onChange={(e) => setProductionData((p) => ({ ...p, estimated_harvest_date: e.target.value }))}
                  />
                </div>

                <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground mt-2">
                  <p className="font-medium text-foreground mb-1">{t("register.production.about.title")}</p>
                  <p>{t("register.production.about.body")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Section 4: Evidence ───────────────────────── */}
          {section === "evidence" && (
            <Card>
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  {t("register.evidence.title")}
                </CardTitle>
                <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-1">
                  {t("register.evidence.subtitle")} <Badge variant="default" className="text-[10px]">{t("register.evidence.ready")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Add new doc */}
                <div className="flex gap-2 items-end">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Label>{t("register.evidence.fileName")}</Label>
                    <Input
                      placeholder={t("register.evidence.fileNamePlaceholder")}
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDoc(); } }}
                    />
                  </div>
                  <div className="space-y-1.5 w-44">
                    <Label>{t("register.evidence.type")}</Label>
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
                    <p className="text-sm text-muted-foreground">{t("register.evidence.noDocsTitle")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("register.evidence.noDocsBody")}</p>
                  </div>
                )}

                <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">{t("register.evidence.mvpNote.title")}</p>
                  <p>{t("register.evidence.mvpNote.body")}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ─── Section 5: Review + Submit ────────────────── */}
          {section === "review" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-serif flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    {t("register.review.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  {/* Originator summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{t("register.review.originator")}</p>
                    {resolvedOriginator ? (
                      <div className="rounded-md bg-secondary/50 p-3 text-sm">
                        <p className="font-medium">{"name" in resolvedOriginator ? resolvedOriginator.name : ""}</p>
                        <p className="text-xs text-muted-foreground">
                          {"type" in resolvedOriginator ? t(`register.originator.types.${resolvedOriginator.type}`) : ""} · {"region" in resolvedOriginator ? resolvedOriginator.region : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{t("register.review.noOriginator")}</p>
                    )}
                  </div>

                  {/* Plot summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{t("register.review.plot")}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: t("register.review.labels.name"), value: plotData.plot_name },
                        { label: t("register.review.labels.crop"), value: plotData.crop_type },
                        { label: t("register.review.labels.location"), value: `${plotData.region}, ${plotData.country}` },
                        { label: t("register.review.labels.area"), value: plotData.area_hectares ? `${plotData.area_hectares} ${t("common.ha")}` : "" },
                        { label: t("register.review.labels.season"), value: plotData.season_label },
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
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{t("register.review.production")}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-md bg-secondary/50 p-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase">{t("register.review.labels.expectedYield")}</p>
                        <p className="text-sm font-medium">{productionData.expected_yield_tons ? `${productionData.expected_yield_tons} ${t("common.ton")}` : "—"}</p>
                      </div>
                      <div className="rounded-md bg-secondary/50 p-2.5">
                        <p className="text-[10px] text-muted-foreground uppercase">{t("register.review.labels.harvestDate")}</p>
                        <p className="text-sm font-medium">{productionData.estimated_harvest_date || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Evidence summary */}
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{t("register.review.evidence")}</p>
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
                      <p className="text-sm text-warning">{t("register.review.noEvidence")}</p>
                    )}
                  </div>

                  {/* Status preview */}
                  <div className="rounded-md border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("register.review.statusPreview")}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={pendingDocs.length > 0 ? "success" : "accent"}>
                        {pendingDocs.length > 0 ? t("lots.status.ready_for_scoring") : t("lots.status.registered")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Badge variant="outline">
                        {pendingDocs.length > 0 ? t("common.sufficient") : t("common.insufficient")}
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
          {t("register.nav.back")}
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
                {t("register.nav.saving")}
              </>
            ) : (
              <>
                {t("register.nav.submit")}
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button variant="accent" onClick={goNext}>
            {t("register.nav.next")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </>
  );
}
