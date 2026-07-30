import React from "react";
import { decodeError } from "@/lib/error-decoder";
import { AlertCircle } from "lucide-react";

interface Web3ErrorAlertProps {
  error: unknown;
  className?: string;
}

export function Web3ErrorAlert({ error, className }: Web3ErrorAlertProps) {
  if (!error) return null;
  const decoded = decodeError(error);

  const severityColors = {
    low: "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-200",
    medium: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-200",
    high: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-200",
    critical: "bg-red-100 border-red-300 text-red-950 dark:bg-red-950/40 dark:border-red-900 dark:text-red-100",
  };

  const colors = severityColors[decoded.severity] || severityColors.medium;

  return (
    <div className={`rounded-lg border p-4 text-xs space-y-2 ${colors} ${className}`}>
      <div className="flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="font-bold flex items-center justify-between">
            <span>{decoded.title}</span>
            <span className="text-[9px] uppercase tracking-wider font-mono opacity-60">
              {decoded.code}
            </span>
          </div>
          <p className="opacity-90 leading-relaxed">{decoded.description}</p>
          <div className="pt-1.5 flex items-start gap-1 text-[11px] font-medium border-t border-current/10 mt-1.5">
            <span className="opacity-75">Remedy:</span>
            <span className="italic">{decoded.remedy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
