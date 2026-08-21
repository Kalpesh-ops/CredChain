import Link from "next/link";
import { UserCheck, ArrowLeft, Wallet, ShieldCheck, Search, CheckCircle2, QrCode } from "lucide-react";
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
          Whether you are verifying someone else&apos;s credential or issuing your own, this
          guide covers the whole path: wallet setup, testnet funding, issuance, and
          verification.
        </p>
      </div>

      {/* Fast path */}
      <Card className="border-emerald-500/40 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>The short version</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-2">
          <p>
            The{" "}
            <Link href="/start" className="font-semibold text-emerald-600 hover:underline">
              guided walkthrough at /start
            </Link>{" "}
            does everything below in five steps, unlocking each one as the previous
            completes. It takes about three minutes. The sections here explain what each
            step is actually doing.
          </p>
          <p>
            Verifying someone else&apos;s credential needs none of this — skip to step 4.
          </p>
        </CardContent>
      </Card>

      {/* Workflow Sections */}
      <div className="space-y-6">
        {/* Step 1: Wallet Setup */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <span>Step 1: Connecting a Stellar Testnet wallet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Issuing requires a wallet. Verifying does not.</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Install a supported browser extension: <strong>Freighter</strong>, <strong>xBull</strong>, or <strong>Albedo</strong>.</li>
              <li>Switch the wallet&apos;s network from <em>Mainnet</em> to <em>Testnet</em>. If you forget, CredChain detects the mismatch and shows a banner rather than failing when you try to sign.</li>
              <li>Press <strong>Connect my wallet</strong> on <Link href="/start" className="text-emerald-600 hover:underline">/start</Link>, or <strong>Connect Wallet</strong> in the top bar.</li>
              <li>Choose how long to stay signed in when prompted — this browser session, 1, 7, or 30 days. Only your public address is stored; signing always goes back through the extension.</li>
            </ol>
            <p className="pt-1 text-zinc-500 dark:text-zinc-400">
              Just installed the extension? Reload the page so the browser can detect it.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: Funding */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Step 2: Funding your testnet account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              A brand-new Stellar account holds nothing and cannot pay transaction fees.
              Step 2 of <Link href="/start" className="text-emerald-600 hover:underline">/start</Link> has a
              <strong> Fund my testnet account</strong> button that calls Stellar&apos;s public
              Friendbot faucet and credits 10,000 test XLM.
            </p>
            <p>
              This is test currency on a test network. No real money is involved at any
              point, and testnet XLM cannot be exchanged for anything.
            </p>
          </CardContent>
        </Card>

        {/* Step 3: Registering an Institution */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Step 3: Registering as an issuer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Credentials are issued by registered organizations, so your address has to be registered before it can issue anything:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>On <Link href="/start" className="text-emerald-600 hover:underline">/start</Link> or the <Link href="/app" className="text-emerald-600 hover:underline">issuer app</Link>, enter your organization name.</li>
              <li>Press <strong>Register</strong> and sign in your wallet. This is your first on-chain transaction.</li>
              <li>Once the ledger confirms, your address can issue credentials and appears in the public issuer list.</li>
            </ol>
            <p className="pt-1 text-zinc-500 dark:text-zinc-400">
              Registration is permissionless. The contract records which address registered
              a name; it does not verify that you are the organization you claim to be.
              Treat the issuer address, not the name, as the identity that matters.
            </p>
          </CardContent>
        </Card>

        {/* Step 4: Issuing & Revoking */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Step 4: Issuing &amp; revoking credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Issuing</h4>
              <p>
                Provide three things: the recipient&apos;s Stellar address, the recipient&apos;s
                name, and the credential title (for example <em>&quot;BSc Computer
                Science&quot;</em>). The name and title are encoded into the credential
                itself and written to the ledger, so verification never depends on an
                external server staying online.
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                The issue date is recorded by the contract from ledger time — you do not
                supply it, and it cannot be backdated.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Revoking</h4>
              <p>
                If a credential was issued in error, the issuing address can call
                <strong> Revoke Certificate</strong> with the certificate id. Status updates
                immediately everywhere it is displayed. Only the original issuer can revoke,
                and revocation cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Public Verification */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-500" />
              <span>Step 5: Public verification (no wallet required)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>Anyone — a recruiter, an HR department, a registrar — can check a credential for free, with no wallet and no account:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Open <Link href="/verify" className="text-emerald-600 hover:underline">/verify</Link> and enter the certificate id, or go straight to <code>/verify/&lt;id&gt;</code>.</li>
              <li>The page renders the credential with the holder&apos;s name, the title, the issuing organization read from the contract, the issue date, and a <strong>Valid</strong> or <strong>Revoked</strong> banner.</li>
              <li>Use <strong>Print / Save as PDF</strong> for a clean copy without site chrome.</li>
            </ol>
            <p className="pt-1">
              To see everything ever issued, the{" "}
              <Link href="/credentials" className="text-emerald-600 hover:underline">
                public registry
              </Link>{" "}
              lists every credential with totals, live status, and a filter across ids,
              holders, titles, and issuers.
            </p>
          </CardContent>
        </Card>

        {/* QR */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-500" />
              <span>Verifying by QR code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <p>
              Every credential page carries a QR code pointing back at itself. Print the
              credential, or put the QR on a physical certificate, and any phone camera
              becomes a verification tool — it opens the live page, which reads the current
              status from the ledger rather than trusting the paper.
            </p>
            <p>
              That is the practical difference from a printed diploma: a revoked credential
              shows as revoked the moment someone scans it, no matter how convincing the
              printed copy looks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
