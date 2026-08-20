"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyLookupPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");

  const submit = () => {
    if (/^\d+$/.test(certId)) router.push(`/verify/${certId}`);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h1 className="text-2xl font-bold tracking-tight">Verify a credential</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Enter a certificate ID, or scan the QR code on the credential. No wallet
          needed — the record is read straight from the Stellar ledger.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-6">
          <Input
            type="number"
            placeholder="Certificate ID (e.g., 2)"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button className="w-full" onClick={submit} disabled={!/^\d+$/.test(certId)}>
            Verify
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
