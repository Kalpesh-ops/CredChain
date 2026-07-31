import Link from "next/link";
import { Cpu, ArrowLeft, ShieldCheck, Database, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          System Architecture & Soroban Smart Contracts
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          CredChain is engineered as a hybrid Web3 system consisting of a Rust-compiled Soroban smart contract on Stellar, a Next.js App Router client, an automated JSON-RPC ledger poller, and a 4-tier redundant database persistence layer.
        </p>
      </div>

      {/* Architecture Diagram Overview */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">Component Flow Architecture</CardTitle>
          <CardDescription className="text-xs">How data flows between the user interface, Stellar network, and backend persistence.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-zinc-950 p-6 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed border border-zinc-800">
            {`┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  Client UI (Next.js)   │ ────► │  Stellar Soroban RPC   │ ────► │ Smart Contract (WASM)  │
│  Freighter / WalletKit │ ◄──── │ (jsonrpc: getEvents)   │ ◄──── │ (extend_ttl / storage) │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
            │                                                               │
            │ Submits Feedback & Telemetry                                  │ Emits Contract Events
            ▼                                                               ▼
┌────────────────────────┐                                      ┌────────────────────────┐
│  Next.js Server API    │ ───────────────────────────────────► │ PostgreSQL / Supabase  │
│ (/api/feedback Route)  │                                      │ (RLS Secured Database) │
└────────────────────────┘                                      └────────────────────────┘`}
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
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Storage TTL Extension</strong>: Soroban ledger entries require state TTL management. Every read/write operation automatically invokes <code>env.storage().persistent().extend_ttl()</code> to ensure certificates do not get archived over time.</li>
              <li><strong>Checks-Effects-Interactions Pattern</strong>: Contract methods perform input validation and signature authentication before mutating storage or emitting events.</li>
              <li><strong>Checked Arithmetic</strong>: Protects against integer overflows and underflows during sequence or total count updates.</li>
              <li><strong>Admin Authority Transfer</strong>: Includes <code>transfer_admin</code> to allow smooth governance handovers without locking out institutions.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2: 4-Tier Database Redundancy */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-500" />
              <span>2. 4-Tier Database Redundancy Layer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              To guarantee zero data loss during serverless restarts or code deployments, CredChain implements a 4-tier fallback storage hierarchy:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li><strong>Tier 1 — Supabase PostgreSQL</strong>: Persistent cloud database connected via <code>DATABASE_URL</code> with Row Level Security (RLS) policies.</li>
              <li><strong>Tier 2 — Codebase File System</strong>: Local backup persisted to <code>client/src/data/feedbacks.json</code>.</li>
              <li><strong>Tier 3 — In-Memory Cache</strong>: Serverless process memory buffer protecting against filesystem read-only locks.</li>
              <li><strong>Tier 4 — Client LocalStorage Mirror</strong>: Browser local storage sync ensuring user reviews are preserved even during network outages.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Section 3: Universal Error Diagnostics */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              <span>3. Web3 Error Decoder & Transaction Validity Windows</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Web3 transactions often fail with cryptic XDR codes. CredChain integrates a centralized error decoder (<code>error-decoder.ts</code>):
            </p>
            <ul className="list-disc pl-5 space-y-1">
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
