"use client";

import { Wallet, ShieldCheck, Award, Building2, Loader2 } from "lucide-react";
import { useWalletStore } from "@/stores/wallet";
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
  const { data: isInst, isLoading: instLoading } = useIsInstitution(address);
  const { data: institution } = useGetInstitution(address);
  const { data: allInstitutions } = useGetAllInstitutions();

  const [certIdInput, setCertIdInput] = useState("");
  const [searchCertId, setSearchCertId] = useState<number | null>(null);
  const { data: certificate, isLoading: certLoading } = useGetCertificate(searchCertId);
  const { data: isValid } = useVerifyCertificate(searchCertId);

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
                  {parseFloat(balance).toFixed(2)} XLM
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
            <p className="text-2xl font-bold">
              {allInstitutions?.length ?? <Skeleton className="h-8 w-12 inline-block" />}
            </p>
            <p className="text-xs text-zinc-500">registered on CredChain</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Verify Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
