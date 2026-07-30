"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { decodeError } from "@/lib/error-decoder";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to telemetry monitoring console
    console.error("Global Application Error Caught:", error);
  }, [error]);

  const decoded = decodeError(error);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg border-red-500/20 bg-zinc-950/80 shadow-2xl backdrop-blur-md dark:bg-black/60 border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
            {decoded.title || "Application Error"}
          </CardTitle>
          <CardDescription className="text-xs text-red-400 font-mono mt-1">
            Error Code: {decoded.code || "RUNTIME_EXCEPTION"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-zinc-900/60 p-4 border border-zinc-800 text-xs text-zinc-300 space-y-3 leading-relaxed">
            <div>
              <span className="font-semibold text-zinc-400">Description: </span>
              {decoded.description || error.message || "An unexpected rendering exception occurred inside the client runtime."}
            </div>
            <div>
              <span className="font-semibold text-zinc-400">Suggested Action: </span>
              {decoded.remedy || "Please try reloading the component or navigating back to your dashboard."}
            </div>
            {error.digest && (
              <div className="text-[10px] text-zinc-500 font-mono pt-1">
                Digest: {error.digest}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1 text-xs border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-100"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Try Recovering
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="mr-1.5 h-3.5 w-3.5" /> Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
