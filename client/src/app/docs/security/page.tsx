import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck, Key, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityDocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Back Link */}
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Documentation Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Lock className="h-3.5 w-3.5" />
          <span>Security Audit &amp; Policies</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Security Controls &amp; Audit
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          CredChain&apos;s security posture rests on the contract itself, on signature-derived attribution, and on refusing to store anything that could be stolen. Below is the technical breakdown.
        </p>
      </div>

      {/* Security Principles Checklist */}
      <div className="space-y-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>1. Smart Contract &amp; Web3 Security Practices</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Checks-Effects-Interactions Pattern</strong>: Smart contract state mutations occur prior to external calls to eliminate reentrancy vulnerabilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Checked Math Operations</strong>: All integer additions and counters utilize checked Rust arithmetic preventing overflow exploits.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>300s Transaction Bounds</strong>: Expanded time-bounds window prevents wallet signature expirations and <code>tx_too_late</code> sequence errors.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Raw XDR Exception Translation</strong>: Intercepts raw ledger errors and decodes contract revert codes (<code>1</code>–<code>6</code>) into actionable remedies.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-500" />
              <span>2. Admin Authority &amp; Credential Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Admin bound at deploy</strong>: <code>__constructor(admin)</code> sets the admin as part of the deploy operation. There is no &quot;set admin if unset&quot; fallback, which would otherwise leave the admin seat claimable by any caller on a fresh contract.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Signature-derived attribution</strong>: Forum authorship comes from an Ed25519 signature verified server-side, never from the request body. An unsigned post claiming an address is published anonymously.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No key material in storage</strong>: Wallet session persistence stores only a public address and which wallet was used. Every signature still goes through the extension, so a stolen session grants nothing that is not already public on the ledger.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No credentials in source</strong>: Connection strings come from environment variables only. An earlier implementation hardcoded one; those files are gone, but the credential remains in git history and is treated as compromised.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-emerald-500" />
              <span>3. Input Sanitization &amp; SQL Injection Defense</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>The feedback API is the only server-side surface. It talks to Neon over the HTTP driver, and:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All database queries use parameterized placeholders (<code>$1, $2, $3</code>). String concatenation into SQL queries is strictly prohibited.</li>
              <li>Input payload strings are truncated and sanitized on API receipt (comments max 500 characters, addresses max 100 characters).</li>
              <li>Ratings are integer-clamped between 1 and 5 (<code>Math.max(1, Math.min(5, rating))</code>).</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
