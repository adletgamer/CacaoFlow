import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Calendar, TrendingUp, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const lotEvidence = "/lot-evidence-mock.jpg";

interface ProductionRecord {
  year: string;
  yield: number;
}

interface LotEvidenceCardProps {
  location: string;
  coordinates: { lat: number; lng: number };
  estimatedHarvestDate: string;
  areaSembrada: number;
  cacaoType: string;
  productionHistory?: ProductionRecord[];
  photoUrl?: string;
  delay?: number;
}

const defaultHistory: ProductionRecord[] = [
  { year: "2023", yield: 1.4 },
  { year: "2024", yield: 1.6 },
  { year: "2025", yield: 1.7 },
];

export function LotEvidenceCard({
  location,
  coordinates,
  estimatedHarvestDate,
  areaSembrada,
  cacaoType,
  productionHistory = defaultHistory,
  photoUrl,
  delay = 0,
}: LotEvidenceCardProps) {
  const maxYield = Math.max(...productionHistory.map((r) => r.yield));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-shadow">
        <div className="h-1 bg-accent" />
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">Evidencia de Ubicación</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Verificación geoespacial del lote</p>
              </div>
            </div>
          </div>

          {/* Photo + Location grid */}
          <div className="grid sm:grid-cols-2">
            {/* Photo */}
            <div className="relative aspect-[16/10] sm:aspect-auto bg-secondary overflow-hidden">
              <img
                src={photoUrl || lotEvidence}
                alt={`Vista aérea del lote en ${location}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-secondary">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Imagen no disponible</p>
                </div>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur text-[10px] font-mono">
                  {coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°
                </Badge>
              </div>
            </div>

            {/* Location details */}
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Ubicación</p>
                    <p className="text-sm font-medium text-foreground">{location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Navigation className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Coordenadas</p>
                    <p className="text-sm font-mono tabular-nums text-foreground">
                      {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Cosecha Estimada</p>
                    <p className="text-sm font-medium text-foreground">{estimatedHarvestDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{areaSembrada} ha</Badge>
                <Badge variant="outline" className="text-[10px]">{cacaoType}</Badge>
              </div>
            </div>
          </div>

          {/* Production history */}
          <div className="px-5 py-4 border-t border-border/50 bg-secondary/20">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Historial de Producción (Ton)</p>
            </div>
            <div className="flex items-end gap-2 h-16">
              {productionHistory.map((record, i) => {
                const pct = (record.yield / (maxYield * 1.2)) * 100;
                return (
                  <motion.div
                    key={record.year}
                    className="flex-1 flex flex-col items-center gap-1"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: delay + 0.2 + i * 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ transformOrigin: "bottom" }}
                  >
                    <span className="text-[10px] font-medium tabular-nums text-foreground">{record.yield}</span>
                    <div
                      className={cn(
                        "w-full rounded-sm",
                        i === productionHistory.length - 1 ? "bg-primary" : "bg-primary/30"
                      )}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground tabular-nums">{record.year}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
