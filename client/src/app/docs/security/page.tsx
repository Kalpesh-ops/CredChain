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
          Security Controls &amp; Row Level Protection Audit
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          CredChain adheres to international database security standards and Soroban smart contract security principles. Below is the technical breakdown of our security controls.
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
                <span><strong>Raw XDR Exception Translation</strong>: Intercepts raw ledger errors and decodes contract revert codes (U32 100–106) into actionable remedies.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-500" />
              <span>2. Database Security &amp; Row Level Security (RLS) Policies</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Our PostgreSQL database layer (Supabase) is protected with strict Row Level Security policies:</p>
            <div className="rounded-lg bg-zinc-950 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto border border-zinc-800 space-y-2">
              <div className="text-emerald-400">-- Enable Row Level Security</div>
              <div>ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;</div>
              <div className="text-emerald-400 pt-2">-- Public Read Policy</div>
              <div>CREATE POLICY &quot;Allow public read access&quot; ON feedbacks FOR SELECT USING (true);</div>
              <div className="text-emerald-400 pt-2">-- Public Insert Check Policy</div>
              <div>CREATE POLICY &quot;Allow public insert&quot; ON feedbacks FOR INSERT WITH CHECK (rating &gt;= 1 AND rating &lt;= 5 AND length(comment) &gt; 0);</div>
            </div>
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
            <p>To prevent SQL Injection (SQLi) attacks and payload bloat:</p>
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
