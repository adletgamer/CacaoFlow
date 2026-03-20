import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "registered", label: "Registro" },
  { key: "scored", label: "Scoring" },
  { key: "vpc_issued", label: "VPC" },
  { key: "funded", label: "Financiamiento" },
  { key: "settled", label: "Repago" },
];

const statusOrder = ["registered", "scored", "vpc_issued", "funded", "settled"];

interface StatusTimelineProps {
  currentStatus: string;
  vertical?: boolean;
}

export function StatusTimeline({ currentStatus, vertical = false }: StatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={cn("flex", vertical ? "flex-col gap-0" : "items-center gap-0 w-full")}>
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center",
              vertical ? "gap-3" : "flex-1 gap-0",
              !vertical && i < steps.length - 1 && "flex-row"
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
              </div>
            </div>
            {vertical && (
              <div className="pb-6">
                <p className={cn("text-sm font-medium", isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
              </div>
            )}
            {!vertical && i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-1", i < currentIndex ? "bg-primary" : "bg-border")} />
            )}
          </div>
        );
      })}
      {!vertical && (
        <div className="flex justify-between mt-2 w-full absolute left-0 px-0" style={{ display: "none" }} />
      )}
    </div>
  );
}

export function StatusTimelineLabeled({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center w-full">
        {steps.map((step, i) => {
          const isCompleted = i <= currentIndex;
          return (
            <div key={step.key} className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "")}>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">{i + 1}</span>}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", i < currentIndex ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((step, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <span
              key={step.key}
              className={cn(
                "text-[10px] font-medium text-center",
                isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
              )}
              style={{ width: `${100 / steps.length}%` }}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
