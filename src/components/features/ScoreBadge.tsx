import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: string;
  numeric?: number;
  size?: "sm" | "md" | "lg";
}

function getScoreColor(score: string) {
  if (score.startsWith("A")) return "bg-success/10 text-success border-success/20";
  if (score.startsWith("B")) return "bg-warning/10 text-warning border-warning/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

export function ScoreBadge({ score, numeric, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "rounded-full border flex items-center justify-center font-bold tabular-nums",
          getScoreColor(score),
          sizeClasses[size]
        )}
      >
        {score}
      </div>
      {numeric !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">{numeric}/100</span>
      )}
    </div>
  );
}
