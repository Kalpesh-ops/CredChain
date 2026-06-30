"use client";

import { Wallet, ShieldCheck, Award, Building2, Loader2, Send, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useWalletStore } from "@/stores/wallet";
import { useTransactionStore } from "@/stores/transactions";
import { useIsInstitution, useGetInstitution, useGetAllInstitutions, useGetCertificate, useVerifyCertificate } from "@/hooks/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { isConnected, address, balance } = useWalletStore();
  const sendXlm = useWalletStore((s) => s.sendXlm);
  const { data: isInst, isLoading: instLoading } = useIsInstitution(address);
  const { data: institution } = useGetInstitution(address);
  const { data: allInstitutions } = useGetAllInstitutions();

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const [certIdInput, setCertIdInput] = useState("");
  const [searchCertId, setSearchCertId] = useState<number | null>(null);
  const { data: certificate, isLoading: certLoading } = useGetCertificate(searchCertId);
  const { data: isValid } = useVerifyCertificate(searchCertId);

  // Send XLM State
  const [recipientXlm, setRecipientXlm] = useState("");
  const [amountXlm, setAmountXlm] = useState("");
  const [sendingXlm, setSendingXlm] = useState(false);
  const [xlmTxStatus, setXlmTxStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [xlmTxHash, setXlmTxHash] = useState("");
  const [xlmTxError, setXlmTxError] = useState("");

  const handleSendXlm = async () => {
    if (!recipientXlm || !amountXlm) return;
    setSendingXlm(true);
    setXlmTxStatus("pending");
    setXlmTxError("");
    setXlmTxHash("");

    const internalTxId = "xlm-send-" + Date.now();
    addTransaction({
      hash: internalTxId,
      status: "pending",
      message: `Sending ${amountXlm} XLM to ${truncateAddress(recipientXlm)}`,
    });

    try {
      const hash = await sendXlm(recipientXlm, amountXlm);
      setXlmTxHash(hash);
      setXlmTxStatus("success");
      updateTransaction(internalTxId, {
        hash,
        status: "success",
        message: `Sent ${amountXlm} XLM successfully!`,
      });
      setRecipientXlm("");
      setAmountXlm("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setXlmTxError(errMsg);
      setXlmTxStatus("failed");
      updateTransaction(internalTxId, {
        hash: "failed",
        status: "failed",
        message: errMsg,
      });
    } finally {
      setSendingXlm(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your wallet and CredChain activity
        </p>
      </div>

      {/* Wallet Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Wallet className="h-4 w-4" />
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div>
                <Badge variant="success" className="mb-2">Connected</Badge>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {address ? truncateAddress(address, 10) : ""}
                </p>
                <p className="text-sm font-semibold mt-1">
                  {parseFloat(balance).toFixed(4)} XLM
                </p>
              </div>
            ) : (
              <div>
                <Badge variant="secondary">Not Connected</Badge>
                <p className="text-xs mt-2 text-zinc-500">
                  Connect your wallet to interact with CredChain
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Building2 className="h-4 w-4" />
              Institution Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <p className="text-xs text-zinc-500">Connect wallet to check</p>
            ) : instLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : isInst ? (
              <div>
                <Badge variant="success" className="mb-2">Registered</Badge>
                <p className="text-sm font-semibold">{institution?.name}</p>
                <p className="text-xs text-zinc-500">
                  {institution?.cert_count ?? 0} certificates issued
                </p>
              </div>
            ) : (
              <div>
                <Badge variant="secondary">Not Registered</Badge>
                <p className="text-xs mt-2 text-zinc-500">
                  <Link href="/app" className="underline underline-offset-2">
                    Register as an institution
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <Award className="h-4 w-4" />
              Total Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allInstitutions?.length ?? <Skeleton className="h-8 w-12 inline-block" />}
            </div>
            <p className="text-xs text-zinc-500">registered on CredChain</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Send XLM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-blue-600" />
              Send XLM (Stellar Testnet)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <p className="text-sm text-zinc-500">Connect your wallet to transfer XLM.</p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500">Recipient Address</label>
                  <Input
                    placeholder="Recipient Stellar address (G...)"
                    value={recipientXlm}
                    onChange={(e) => setRecipientXlm(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500">Amount (XLM)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Amount to send"
                    value={amountXlm}
                    onChange={(e) => setAmountXlm(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleSendXlm}
                  disabled={sendingXlm || !recipientXlm || !amountXlm || parseFloat(balance) < parseFloat(amountXlm) + 0.01}
                >
                  {sendingXlm ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Transaction...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send XLM
                    </>
                  )}
                </Button>

                {parseFloat(balance) < parseFloat(amountXlm || "0") + 0.01 && isConnected && (
                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    Insufficient balance to cover payment and transaction fee. Please fund your account using the{" "}
                    <a
                      href="https://lab.stellar.org/account/fund"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-blue-700 dark:text-blue-300"
                    >
                      Stellar Lab Friendbot
                    </a>.
                  </div>
                )}

                {/* XLM Tx Status Indicators */}
                {xlmTxStatus === "pending" && (
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                    Transaction is pending. Please sign the transaction in your wallet and wait for network validation.
                  </div>
                )}

                {xlmTxStatus === "success" && xlmTxHash && (
                  <div className="rounded-lg bg-green-50 p-3 text-xs text-green-800 dark:bg-green-950 dark:text-green-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Transaction Success!
                    </div>
                    <p className="break-all font-mono text-[10px]">Hash: {xlmTxHash}</p>
                    <a
                      href={getExplorerUrl("tx", xlmTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline font-medium text-blue-600 dark:text-blue-300"
                    >
                      View on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {xlmTxStatus === "failed" && xlmTxError && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950 dark:text-red-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Transaction Failed
                    </div>
                    <p className="text-[11px]">{xlmTxError}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Verify Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="number"
                placeholder="Enter Certificate ID"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
              />
              <Button
                onClick={() =>
                  setSearchCertId(certIdInput ? parseInt(certIdInput) : null)
                }
                disabled={!certIdInput}
              >
                Verify
              </Button>
            </div>

            {searchCertId !== null && (
              <div>
                {certLoading ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking up certificate...
                  </div>
                ) : certificate ? (
                  <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Certificate #{certificate.id}
                      </span>
                      <Badge variant={isValid ? "success" : "destructive"}>
                        {isValid ? "Valid" : "Revoked"}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500 space-y-1">
                      <p>Issuer: {truncateAddress(certificate.issuer)}</p>
                      <p>Recipient: {truncateAddress(certificate.recipient)}</p>
                      <p>Issued: {new Date(certificate.issued_at * 1000).toLocaleDateString()}</p>
                      {certificate.revoked && (
                        <p className="text-red-500 font-medium">
                          This certificate has been revoked
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Certificate #{searchCertId} not found
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered Institutions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              Registered Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!allInstitutions || allInstitutions.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No institutions registered yet
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-64 overflow-y-auto">
                {allInstitutions.map((instAddr) => (
                  <div
                    key={instAddr}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <span className="font-mono text-xs">
                      {truncateAddress(instAddr, 8)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() =>
                        window.open(
                          getExplorerUrl("account", instAddr),
                          "_blank"
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
