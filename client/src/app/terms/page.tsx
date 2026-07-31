import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <FileText className="h-3.5 w-3.5" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Last Updated: July 31, 2026
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="py-6 space-y-6 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the CredChain application, smart contracts, or public verification interfaces, you agree to comply with and be bound by these Terms of Use. If you do not agree, please discontinue using the application.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">2. Description of Service</h3>
            <p>
              CredChain provides a decentralized interface that connects users to the Stellar Soroban smart contract network. CredChain does not issue credentials directly; credential issuance and revocation are executed independently by registered institutions via their own private cryptographic wallet signatures.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">3. Web3 &amp; Blockchain Risk Disclosure</h3>
            <p>
              You acknowledge that interacting with blockchain smart contracts involves inherent risks, including network latency, RPC node downtime, private key management responsibility, and testnet resets. You are solely responsible for securing your wallet seed phrases and private keys.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">4. Permitted Use &amp; Prohibited Conduct</h3>
            <p>
              You agree not to use CredChain to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Issue fraudulent, deceptive, or misleading academic/professional credentials.</li>
              <li>Impersonate unauthorized universities, companies, or certification bodies.</li>
              <li>Attempt SQL injection, payload flooding, or Denial of Service (DoS) attacks against our database or RPC gateways.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5. Disclaimer of Warranties &amp; Limitation of Liability</h3>
            <p>
              CREDCHAIN IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR STELLAR SOROBAN NETWORK.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">6. Open Source Licensing</h3>
            <p>
              The CredChain smart contract source code and Next.js frontend code are open-source software distributed under the Apache 2.0 / MIT License.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
