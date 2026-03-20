import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./ScoreBadge";
import { Shield, Hash, MapPin, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

interface AssetCardProps {
  assetId: string;
  lotId: string;
  txHash: string;
  producer: string;
  location: string;
  yield_: number;
  score: string;
  issuedAt: string;
  status: "pending" | "minted" | "active";
  delay?: number;
}

export function AssetCard({ assetId, lotId, txHash, producer, location, yield_, score, issuedAt, status, delay = 0 }: AssetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="hover:shadow-elevated transition-shadow overflow-hidden">
        <div className="h-1 bg-primary" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {assetId}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Lote: {lotId}</p>
            </div>
            <Badge variant={status === "active" ? "success" : status === "minted" ? "default" : "warning"}>
              {status === "active" ? "Activo" : status === "minted" ? "Emitido" : "Pendiente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Productor</p>
              <p className="text-sm font-medium">{producer}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ubicación</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <p className="text-sm">{location}</p>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Yield Estimado</p>
              <p className="text-sm font-medium tabular-nums">{yield_} Ton</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
              <ScoreBadge score={score} size="sm" />
            </div>
          </div>

          <div className="rounded-md bg-secondary p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              <span>Tx Hash:</span>
              <code className="font-mono text-foreground">{txHash}</code>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>Emitido: {issuedAt}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
