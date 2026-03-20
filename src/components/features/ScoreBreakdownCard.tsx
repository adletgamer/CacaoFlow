import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "./ScoreBadge";

export interface ScoreBreakdownItem {
  label: string;
  value: number;
  max: number;
  color: "green" | "yellow" | "red";
}

interface ScoreBreakdownCardProps {
  items: ScoreBreakdownItem[];
  totalScore: number;
  totalMax?: number;
  score: string;
}

const colorMap = {
  green: {
    bar: "bg-success",
    bg: "bg-success/10",
    text: "text-success",
  },
  yellow: {
    bar: "bg-warning",
    bg: "bg-warning/10",
    text: "text-warning",
  },
  red: {
    bar: "bg-destructive",
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
};

function getAutoColor(value: number, max: number): "green" | "yellow" | "red" {
  const ratio = value / max;
  if (ratio >= 0.75) return "green";
  if (ratio >= 0.5) return "yellow";
  return "red";
}

export function ScoreBreakdownCard({ items, totalScore, totalMax = 100, score }: ScoreBreakdownCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Desglose del Score</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Índice de Confiabilidad Aleph</p>
          </div>
          <ScoreBadge score={score} numeric={totalScore} size="md" />
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {items.map((item, i) => {
          const color = item.color || getAutoColor(item.value, item.max);
          const colors = colorMap[color];
          const percentage = (item.value / item.max) * 100;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className={cn("text-sm font-semibold tabular-nums", colors.text)}>
                  {item.value}/{item.max}
                </span>
              </div>
              <div className={cn("relative h-2 w-full rounded-full overflow-hidden", colors.bg)}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className={cn("absolute inset-y-0 left-0 rounded-full", colors.bar)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Peso: {item.max}/{totalMax} puntos ({Math.round((item.max / totalMax) * 100)}%)
              </p>
            </motion.div>
          );
        })}

        {/* Total bar */}
        <div className="pt-3 mt-2 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-foreground">Score Total</span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              totalScore >= 75 ? "text-success" : totalScore >= 50 ? "text-warning" : "text-destructive"
            )}>
              {totalScore}/{totalMax}
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full overflow-hidden bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalScore / totalMax) * 100}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                totalScore >= 75 ? "bg-success" : totalScore >= 50 ? "bg-warning" : "bg-destructive"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
