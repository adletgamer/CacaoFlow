import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="hover:shadow-elevated transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trend && (
                <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
                  {trend.positive ? "+" : ""}{trend.value}%
                </p>
              )}
            </div>
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
