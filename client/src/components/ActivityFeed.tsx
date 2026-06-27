"use client";

import {
  Award,
  Ban,
  Building2,
  ExternalLink,
  Activity,
} from "lucide-react";
import { useActivityStore } from "@/stores/activity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimestamp, getExplorerUrl, truncateAddress } from "@/lib/utils";

export function ActivityFeed() {
  const { events } = useActivityStore();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
        <Activity className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm font-medium">No activity yet</p>
        <p className="text-xs mt-1">
          Events from contract interactions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, idx) => {
        const iconMap: Record<string, React.ReactNode> = {
          institution_registered: (
            <Building2 className="h-4 w-4 text-blue-500" />
          ),
          certificate_issued: <Award className="h-4 w-4 text-green-500" />,
          certificate_revoked: <Ban className="h-4 w-4 text-red-500" />,
        };

        const labelMap: Record<string, string> = {
          institution_registered: "Institution Registered",
          certificate_issued: "Certificate Issued",
          certificate_revoked: "Certificate Revoked",
        };

        const variantMap: Record<string, "secondary" | "success" | "destructive"> = {
          institution_registered: "secondary",
          certificate_issued: "success",
          certificate_revoked: "destructive",
        };

        return (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mt-0.5">{iconMap[event.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={variantMap[event.type] || "secondary"} className="text-[10px] px-1.5 py-0">
                  {labelMap[event.type] || event.type}
                </Badge>
                <span className="text-[10px] text-zinc-400">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                {(event.data as Record<string, string>).addr && (
                  <p>Address: {truncateAddress((event.data as Record<string, string>).addr)}</p>
                )}
                {(event.data as Record<string, string>).issuer && (
                  <p>
                    Issuer: {truncateAddress((event.data as Record<string, string>).issuer)}
                  </p>
                )}
                {(event.data as Record<string, string>).recipient && (
                  <p>
                    Recipient:{" "}
                    {truncateAddress((event.data as Record<string, string>).recipient)}
                  </p>
                )}
                {(event.data as Record<string, number>).id !== undefined && (
                  <p>Certificate ID: #{(event.data as Record<string, number>).id}</p>
                )}
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-[10px] mt-1"
                onClick={() =>
                  window.open(getExplorerUrl("tx", event.txHash), "_blank")
                }
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Transaction
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
