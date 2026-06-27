"use client";

import { useState } from "react";
import {
  Building2,
  Award,
  Ban,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useWalletStore } from "@/stores/wallet";
import {
  useRegisterInstitution,
  useIssueCertificate,
  useRevokeCertificate,
  useIsInstitution,
} from "@/hooks/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AppPage() {
  const { isConnected, address } = useWalletStore();
  const { data: isInst } = useIsInstitution(address);

  const [instName, setInstName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [revokeCertId, setRevokeCertId] = useState("");

  const registerMutation = useRegisterInstitution();
  const issueMutation = useIssueCertificate();
  const revokeMutation = useRevokeCertificate();

  if (!isConnected) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
          <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Connect your Stellar wallet to issue and manage certificates
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          CredChain App
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Issue, verify, and manage blockchain-verified credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Register Institution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              Register Institution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isInst ? (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <CheckCircle className="h-4 w-4" />
                  Already Registered
                </div>
                <p>Your address is registered as an institution.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Institution name (e.g., MIT)"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => {
                    if (address && instName) {
                      registerMutation.mutate({
                        address,
                        name: instName,
                      });
                    }
                  }}
                  disabled={
                    registerMutation.isPending || !instName || !address
                  }
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Institution"
                  )}
                </Button>
                {registerMutation.isError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    <XCircle className="h-4 w-4" />
                    {registerMutation.error.message}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-green-600" />
              Issue Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isInst ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Register as an institution first to issue certificates.
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Recipient Stellar address (G...)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <Input
                  placeholder="Metadata URI (e.g., ipfs://Qm...)"
                  value={metadataUri}
                  onChange={(e) => setMetadataUri(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => {
                    if (address && recipient && metadataUri) {
                      issueMutation.mutate({
                        issuer: address,
                        recipient,
                        metadataUri,
                      });
                    }
                  }}
                  disabled={
                    issueMutation.isPending || !recipient || !metadataUri
                  }
                >
                  {issueMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    "Issue Certificate"
                  )}
                </Button>
                {issueMutation.isError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    <XCircle className="h-4 w-4" />
                    {issueMutation.error.message}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revoke Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="h-5 w-5 text-red-600" />
              Revoke Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isInst ? (
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Only registered institutions can revoke certificates.
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Certificate ID to revoke"
                  value={revokeCertId}
                  onChange={(e) => setRevokeCertId(e.target.value)}
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (address && revokeCertId) {
                      revokeMutation.mutate({
                        caller: address,
                        certId: parseInt(revokeCertId),
                      });
                    }
                  }}
                  disabled={
                    revokeMutation.isPending || !revokeCertId
                  }
                >
                  {revokeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    "Revoke Certificate"
                  )}
                </Button>
                {revokeMutation.isError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    <XCircle className="h-4 w-4" />
                    {revokeMutation.error.message}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Use the tools on this page to manage your credentials on-chain.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  1
                </div>
                <span>Register as an institution</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  2
                </div>
                <span>Issue certificates to recipients</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                  3
                </div>
                <span>Revoke certificates if needed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
