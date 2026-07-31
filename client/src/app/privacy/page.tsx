import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
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
          <span>Legal Document</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Last Updated: July 31, 2026
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="py-6 space-y-6 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">1. Overview &amp; Web3 Decentralization</h3>
            <p>
              CredChain (&quot;we&quot;, &quot;our&quot;, or &quot;platform&quot;) operates as a decentralized interface for interacting with the Stellar Soroban smart contract network. We prioritize user privacy and minimize data collection. By design, Web3 interactions rely on public cryptographic addresses rather than personally identifiable information (PII).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">2. On-Chain Public Records</h3>
            <p>
              When an institution registers or issues a credential on CredChain, the transaction data (including issuing wallet address, recipient wallet address, credential name, metadata URI, and timestamp) is recorded directly on the <strong>Stellar Blockchain</strong>. Blockchains are public ledger systems; once recorded, on-chain data is immutable, permanent, and publicly visible to anyone on the network.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">3. Off-Chain Data &amp; Local Storage</h3>
            <p>
              CredChain does not require account passwords, email addresses, or personal registration to verify credentials. The app utilizes local browser storage (<code>localStorage</code>) to maintain user preferences (such as dark/light mode themes) and client transaction history.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">4. Shared User Feedback Collection</h3>
            <p>
              Optional feedback submitted through the Analytics portal is processed by our serverless API and stored in an encrypted cloud PostgreSQL database (Supabase). Submitted feedback includes the public wallet address (or &quot;Anonymous User&quot;), rating, category, and comment. No personal identifiers (IP addresses, real names, or emails) are tracked or sold to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5. Third-Party RPC &amp; Node Providers</h3>
            <p>
              To interact with the Stellar ledger, the app connects to public Soroban RPC nodes (e.g. <code>https://soroban-testnet.stellar.org</code>) and Horizon gateways. These nodes operate under SDF policies and process public blockchain transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">6. Policy Updates</h3>
            <p>
              We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated timestamp.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
