"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Coins,
  Building2,
  Award,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { useWalletStore } from "@/stores/wallet";
import { useActivityStore } from "@/stores/activity";
import {
  useIsInstitution,
  useGetInstitution,
  useRegisterInstitution,
  useIssueCertificate,
} from "@/hooks/contract";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Web3ErrorAlert } from "@/components/Web3ErrorAlert";
import { encodeCredential } from "@/lib/credential";
import { truncateAddress } from "@/lib/utils";

function Step({
  index,
  icon: Icon,
  title,
  description,
  state,
  children,
}: {
  index: number;
  icon: typeof Wallet;
  title: string;
  description: string;
  state: "done" | "active" | "locked";
  children?: React.ReactNode;
}) {
  return (
    <Card className={state === "locked" ? "opacity-50" : undefined}>
      <CardContent className="flex gap-4 p-5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            state === "done"
              ? "bg-green-600 text-white"
              : state === "active"
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {state === "done" ? <Check className="h-4 w-4" /> : index}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 font-semibold">
            <Icon className="h-4 w-4 text-zinc-400" />
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
          {state === "active" && children && (
            <div className="mt-4 space-y-3">{children}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StartPage() {
  const { isConnected, address, balance, funding, networkMismatch } =
    useWalletStore();
  const fundAccount = useWalletStore((s) => s.fundAccount);
  const events = useActivityStore((s) => s.events);

  const { data: isInst } = useIsInstitution(address);
  const { data: institution } = useGetInstitution(address);
  const registerMutation = useRegisterInstitution();
  const issueMutation = useIssueCertificate();

  const [orgName, setOrgName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [holder, setHolder] = useState("");
  const [title, setTitle] = useState("");

  const funded = parseFloat(balance) > 0;
  const hasIssued = (institution?.cert_count ?? 0) > 0;

  // The events listener records cert_iss with the certificate id, so the last
  // one issued by this wallet gives us a page to link to.
  const myCertId = events.find(
    (e) => e.type === "certificate_issued" && e.data.issuer === address
  )?.data.id as number | undefined;

  const stepState = (done: boolean, unlocked: boolean) =>
    done ? "done" : unlocked ? "active" : "locked";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Issue your first credential
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Five steps on the Stellar test network. No real money is involved, and
          everything you create here is publicly verifiable.
        </p>
      </div>

      <div className="space-y-3">
        <Step
          index={1}
          icon={Wallet}
          title="Connect a Stellar wallet"
          description={
            isConnected && address
              ? `Connected as ${truncateAddress(address)}`
              : "Use the Connect Wallet button in the top bar. If you do not have one, install Freighter and switch it to Testnet."
          }
          state={stepState(isConnected, true)}
        >
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">Get Freighter</Button>
          </a>
        </Step>

        <Step
          index={2}
          icon={Coins}
          title="Fund your testnet account"
          description={
            funded
              ? `Balance: ${parseFloat(balance).toFixed(2)} XLM`
              : "New testnet accounts start empty. Friendbot hands out free test XLM to cover transaction fees."
          }
          state={stepState(funded, isConnected)}
        >
          <Button onClick={fundAccount} disabled={funding || networkMismatch}>
            {funding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting test XLM...
              </>
            ) : (
              "Fund my testnet account"
            )}
          </Button>
        </Step>

        <Step
          index={3}
          icon={Building2}
          title="Register as an issuer"
          description={
            isInst
              ? `Registered as "${institution?.name}"`
              : "Credentials are issued by registered organisations. Register yours — this is your first on-chain transaction."
          }
          state={stepState(!!isInst, isConnected && funded)}
        >
          <Input
            placeholder="Organisation name (e.g., Meridian State University)"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={() => {
              if (address && orgName) {
                registerMutation.mutate({ address, name: orgName });
              }
            }}
            disabled={registerMutation.isPending || !orgName || !address}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register organisation"
            )}
          </Button>
          <Web3ErrorAlert error={registerMutation.error} />
        </Step>

        <Step
          index={4}
          icon={Award}
          title="Issue a credential"
          description={
            hasIssued
              ? `${institution?.cert_count} issued from this wallet`
              : "Award a credential to any Stellar address. Send it to yourself if you have nobody else to hand."
          }
          state={stepState(hasIssued, !!isInst)}
        >
          <div className="flex gap-2">
            <Input
              placeholder="Recipient address (G...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => setRecipient(address ?? "")}
              disabled={!address}
            >
              Use mine
            </Button>
          </div>
          <Input
            placeholder="Recipient name (e.g., Ada Lovelace)"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />
          <Input
            placeholder="Credential title (e.g., BSc Computer Science)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={() => {
              if (address && recipient && holder && title) {
                issueMutation.mutate({
                  issuer: address,
                  recipient,
                  metadataUri: encodeCredential({ holder, title }),
                });
              }
            }}
            disabled={
              issueMutation.isPending || !recipient || !holder || !title
            }
          >
            {issueMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing...
              </>
            ) : (
              "Issue credential"
            )}
          </Button>
          <Web3ErrorAlert error={issueMutation.error} />
        </Step>

        <Step
          index={5}
          icon={ShieldCheck}
          title="Verify it"
          description="Every credential has a public page with a QR code. Anyone can check it without a wallet."
          state={stepState(false, hasIssued)}
        >
          {myCertId ? (
            <Link href={`/verify/${myCertId}`}>
              <Button>View certificate #{myCertId}</Button>
            </Link>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Waiting for the ledger to confirm your certificate — this takes a
              few seconds. You can also look it up by ID on the{" "}
              <Link href="/verify" className="underline">
                verify page
              </Link>
              .
            </p>
          )}
        </Step>
      </div>
    </div>
  );
}
