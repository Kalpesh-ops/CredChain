import Link from "next/link";
import { ShieldCheck, ExternalLink, FileText, Lock, Cpu, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                CredChain
              </span>
            </Link>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Decentralized academic and professional credential verification platform built on Stellar Soroban. Instant, tamper-proof, on-chain credential settlement.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/Kalpesh-ops/CredChain"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Source</span>
              </a>
            </div>
          </div>

          {/* Column 2: Documentation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <span>Documentation</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/docs"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Getting Started & Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/architecture"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  System Architecture & Soroban
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/guide"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  User & Issuer Walkthrough
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/security"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Security Audit & Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-500" />
              <span>Platform & Tools</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/app"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Public Verification Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Issuer Administration
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Telemetry & Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/activity"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                >
                  Ledger Transaction Feed
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Legal & Security</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span>Terms of Use</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://stellar.expert/explorer/testnet/account/GBVK6QU2HJZCM3FTUEECXV2TTQWTQYX44IJUPQVRIQ4YPV662YMOUYRU"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Stellar Testnet Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div>
            © {new Date().getFullYear()} CredChain Platform. Open source under Apache 2.0 / MIT License.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Stellar Testnet Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
