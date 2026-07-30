"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-md dark:bg-black/60 border text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <HelpCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-1">
            HTTP Status: 404 Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
            The requested page does not exist or has been relocated to another address on the CredChain network.
          </p>

          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" /> Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
