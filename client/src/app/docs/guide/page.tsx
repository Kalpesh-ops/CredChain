import Link from "next/link";
import { UserCheck, ArrowLeft, Wallet, ShieldCheck, Search, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserGuideDocsPage() {
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
          <UserCheck className="h-3.5 w-3.5" />
          <span>User &amp; Issuer Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Complete User &amp; Institution Operations Guide
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Whether you are a recruiter verifying a diploma or a university issuing thousands of credentials, this guide covers wallet setup, testnet funding, credential issuance, and verification workflows.
        </p>
      </div>

      {/* Workflow Sections */}
      <div className="space-y-6">
        {/* Step 1: Wallet Setup */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <span>Step 1: Connecting a Stellar Testnet Wallet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>To perform issuer operations (registering an institution or issuing certificates), you need a Stellar wallet connected to the Testnet:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Install a supported browser extension wallet: <strong>Freighter</strong>, <strong>Albedo</strong>, <strong>xBull</strong>, or <strong>LOBSTR</strong>.</li>
              <li>Switch your wallet network setting from <em>Mainnet</em> to <em>Testnet</em>.</li>
              <li>Click the <strong>Connect Wallet</strong> button in the top navigation bar of CredChain.</li>
              <li>If your wallet has 0 XLM, use the <strong>Friendbot Faucet</strong> button in the navigation modal to automatically receive 10,000 testnet XLM for transaction gas fees.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 2: Registering an Institution */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Step 2: Registering an Institution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Universities, certification bodies, and companies must register their wallet address on-chain before issuing credentials:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Navigate to the <Link href="/dashboard" className="text-emerald-600 hover:underline">Issuer Dashboard</Link>.</li>
              <li>Under the <strong>Register Institution</strong> tab, enter your official institution name (e.g. <em>&quot;Stanford University&quot;</em>) and website domain.</li>
              <li>Click <strong>Register Institution</strong> and sign the transaction in your wallet.</li>
              <li>Once confirmed on-chain, your wallet address is officially authorized as a credential issuer.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 3: Issuing & Revoking Credentials */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Step 3: Issuing &amp; Revoking Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Issuing a Certificate:</h4>
              <p>In the Issuer Dashboard, provide the student&apos;s Stellar wallet address, credential name (e.g., <em>&quot;B.S. Computer Science&quot;</em>), metadata URI, and issue date. Click <strong>Issue Certificate</strong> to record it permanently on-chain.</p>
            </div>
            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Revoking a Certificate:</h4>
              <p>If a credential was issued in error or compromised, the issuing institution can invoke <strong>Revoke Certificate</strong> with the unique Certificate ID. The on-chain status will immediately update to <em>Revoked</em> across all public verification checks.</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Public Verification */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-500" />
              <span>Step 4: Public Verification (No Wallet Required)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Anyone (recruiters, HR departments, or individuals) can verify credentials for free without connecting a wallet:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Go to the <Link href="/app" className="text-emerald-600 hover:underline">Public Verification Portal</Link>.</li>
              <li>Paste any Certificate ID or Recipient Public Wallet Address.</li>
              <li>Click <strong>Verify Credential</strong>. CredChain queries the Soroban smart contract and displays the issuing institution name, validity status, and metadata.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
