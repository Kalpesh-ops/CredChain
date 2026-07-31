import Link from "next/link";
import { Cpu, ArrowLeft, ShieldCheck, Activity, CheckCircle2, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArchitectureDocsPage() {
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
          <Cpu className="h-3.5 w-3.5" />
          <span>Technical Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          System Architecture &amp; Soroban Smart Contracts
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          CredChain is built natively on the <strong>Stellar Soroban</strong> WASM execution environment. Below is the visual component flow illustrating how client applications, wallet providers, Soroban RPC nodes, and smart contract ledgers interact seamlessly.
        </p>
      </div>

      {/* Modern Visual Component Flow Diagram */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            <span>Component Flow Architecture</span>
          </CardTitle>
          <CardDescription className="text-xs">
            End-to-end data pipeline from user interface to Stellar ledger settlement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <Badge variant="outline" className="text-[10px]">Client Layer</Badge>
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Next.js UI &amp; WalletKit</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connects user wallets (Freighter, Albedo, xBull) to construct XDR transaction payloads and handle user signatures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <Badge variant="outline" className="text-[10px]">Gateway Layer</Badge>
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Stellar Soroban RPC Node</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Dispatches JSON-RPC requests (<code>sendTransaction</code>, <code>getLatestLedger</code>) and polls on-chain events.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-500/30 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="h-7 w-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px]">Settlement Layer</Badge>
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Rust Soroban WASM Contract</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Executes state checks, updates persistent storage with <code>extend_ttl</code>, and emits immutable ledger event logs.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              <strong>Frictionless Execution:</strong> Verification queries run directly against the Soroban RPC gateway without requiring gas fees or wallet signatures.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Deep-Dive Sections */}
      <div className="space-y-6">
        {/* Section 1: Smart Contract Architecture */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>1. Rust Soroban Smart Contract Design</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              The smart contract is written in Rust using the official <code>soroban-sdk</code>. It implements explicit state isolation and persistent storage extensions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Storage TTL Extension</strong>: Soroban ledger entries require state TTL management. Every read/write operation automatically invokes <code>env.storage().persistent().extend_ttl()</code> to ensure certificates do not get archived over time.</li>
              <li><strong>Checks-Effects-Interactions Pattern</strong>: Contract methods perform input validation and signature authentication before mutating storage or emitting events.</li>
              <li><strong>Checked Arithmetic</strong>: Protects against integer overflows and underflows during sequence or total count updates.</li>
              <li><strong>Admin Authority Transfer</strong>: Includes <code>transfer_admin</code> to allow smooth governance handovers without locking out institutions.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: Universal Error Diagnostics */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              <span>2. Web3 Error Decoder &amp; Transaction Validity Windows</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Web3 transactions often fail with cryptic XDR codes. CredChain integrates a centralized error decoder (<code>error-decoder.ts</code>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Translates Soroban revert codes (U32 100–106) and Stellar Horizon errors into human-readable titles, codes, and remedies.</li>
              <li>Expands transaction validity windows to 300 seconds to prevent <code>tx_too_late</code> expirations when users sign via hardware or extension wallets.</li>
              <li>Provides global React Error Boundaries (<code>error.tsx</code>) and component-level diagnostic alerts (<code>Web3ErrorAlert.tsx</code>).</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
