"use client";

import Link from "next/link";
import { ShieldCheck, Award, Ban, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Built on Stellar Soroban
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Blockchain-Verified
            <span className="text-blue-600 dark:text-blue-400">
              {" "}Credentials
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            CredChain is a decentralized certificate issuance platform.
            Institutions issue tamper-proof credentials as NFTs, verify them
            instantly with QR codes, and maintain a transparent revocation
            list — all on the Stellar network.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <Award className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold">Issue Certificates</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Registered institutions can mint tamper-proof credential NFTs
                for recipients.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <QrCode className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold">QR Verification</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Any certificate can be instantly verified by scanning a QR code
                linked to its on-chain data.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
              <Ban className="mb-3 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold">Revocation List</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Institutions can revoke certificates when needed, with full
                transparency on-chain.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/app">
              <Button size="lg" className="gap-2">
                Launch App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-6 py-8 dark:border-zinc-700">
        <div className="mx-auto max-w-3xl text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            CredChain — Built on{" "}
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Stellar
            </a>{" "}
            Soroban smart contracts
          </p>
        </div>
      </footer>
    </div>
  );
}
