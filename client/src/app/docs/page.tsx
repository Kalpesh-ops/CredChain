import Link from "next/link";
import { BookOpen, Cpu, UserCheck, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsOverviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Product Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          CredChain Product Documentation & User Guide
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          CredChain is a decentralized academic and professional credential verification platform built natively on the <strong>Stellar Soroban</strong> smart contract engine. It provides instant, tamper-proof, public verification of certificates without middlemen or centralized databases.
        </p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/docs/architecture" className="group">
          <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <Cpu className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">System Architecture</CardTitle>
              <CardDescription className="text-xs">
                Deep dive into Soroban WASM smart contracts, storage TTL management, and 4-tier database redundancy.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Read Architecture</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/docs/guide" className="group">
          <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <UserCheck className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Issuer & User Guide</CardTitle>
              <CardDescription className="text-xs">
                Step-by-step instructions for wallet setup, registering institutions, issuing diplomas, and verifying credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Read User Guide</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/docs/security" className="group">
          <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm">
            <CardHeader className="pb-3">
              <Lock className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg">Security & Audit</CardTitle>
              <CardDescription className="text-xs">
                Row Level Security (RLS) policies, checks-effects-interactions contract patterns, and error diagnostics.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Read Security Audit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Core Highlights */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">Key Value Propositions</CardTitle>
          <CardDescription className="text-xs">
            Why CredChain replaces legacy centralized background checks and diploma mills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-100">Frictionless Public Verification</strong>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Recruiters and employers can verify any certificate ID instantly without needing a wallet, account registration, or subscription fee.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-100">Sub-Cent Transaction Settlement</strong>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Built on Stellar Soroban, issuing a credential costs fractions of a cent and finalizes in ~5 seconds with sub-second RPC latency.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-100">Storage TTL Persistence Guarantee</strong>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Smart contract functions automatically execute <code>extend_ttl</code> on persistent ledger entries so certificates remain permanently accessible.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-100">Decentralized Multi-Wallet Support</strong>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Supports Freighter, Albedo, xBull, LOBSTR, and Rabet wallets via Creit Tech Wallet Kit integration.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract & Network Specifications */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">Network & Contract Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Deployed Contract ID:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold select-all break-all">
              CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Stellar Network:</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">Stellar Testnet (RPC: https://soroban-testnet.stellar.org)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">Compiled WASM Build Size:</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">&lt; 64KB (Passed Soroban Deployment Bounds)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
