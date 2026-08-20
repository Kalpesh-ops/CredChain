"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ShieldCheck, ShieldX, Printer, ExternalLink, Search } from "lucide-react";
import {
  useGetCertificate,
  useVerifyCertificate,
  useGetInstitution,
} from "@/hooks/contract";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { decodeCredential } from "@/lib/credential";
import { truncateAddress, formatTimestamp, getExplorerUrl } from "@/lib/utils";

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const certId = /^\d+$/.test(id) ? Number(id) : null;

  const { data: certificate, isLoading } = useGetCertificate(certId);
  const { data: isValid } = useVerifyCertificate(certId);
  const { data: institution, isLoading: institutionLoading } = useGetInstitution(
    certificate?.issuer ?? null
  );
  const credential = certificate ? decodeCredential(certificate.metadata_uri) : null;

  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/verify/${id}`, {
      width: 320,
      margin: 1,
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6">
        <ShieldX className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">No such certificate</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Nothing is recorded on chain for certificate{" "}
          <span className="font-mono">#{id}</span>.
        </p>
        <Link href="/verify">
          <Button variant="outline" className="mt-6">
            <Search className="mr-2 h-4 w-4" />
            Look up another certificate
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Card className="overflow-hidden">
        <div
          className={`px-6 py-3 text-sm font-semibold text-white ${
            isValid ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <span className="flex items-center gap-2">
            {isValid ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldX className="h-4 w-4" />
            )}
            {isValid
              ? "Verified on the Stellar ledger"
              : "This credential has been revoked"}
          </span>
        </div>

        <CardContent className="p-8 sm:p-12">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Certificate of Achievement
            </p>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              This certifies that
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {credential ? credential.holder : truncateAddress(certificate.recipient)}
            </h1>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              has been awarded
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {credential ? credential.title : "Credential"}
            </h2>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              issued by
            </p>
            <p className="mt-1 text-lg font-medium">
              {institutionLoading
                ? "…"
                : (institution?.name ?? truncateAddress(certificate.issuer))}
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6 border-t border-zinc-200 pt-8 sm:flex-row sm:items-start sm:justify-between dark:border-zinc-800">
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Certificate</dt>
                <dd className="font-mono">#{certificate.id}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Issued</dt>
                <dd>{formatTimestamp(certificate.issued_at)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Issuer</dt>
                <dd className="font-mono">{truncateAddress(certificate.issuer)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Recipient</dt>
                <dd className="font-mono">
                  {truncateAddress(certificate.recipient)}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd>
                  <Badge variant={isValid ? "success" : "destructive"}>
                    {isValid ? "Valid" : "Revoked"}
                  </Badge>
                </dd>
              </div>
              {!credential && (
                <div className="flex gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Metadata</dt>
                  <dd className="font-mono break-all">
                    {certificate.metadata_uri}
                  </dd>
                </div>
              )}
            </dl>

            {qr && (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr}
                  alt={`QR code linking to the verification page for certificate #${certificate.id}`}
                  className="h-32 w-32"
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Scan to verify
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Save as PDF
        </Button>
        <a
          href={getExplorerUrl("account", certificate.issuer)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Issuer on explorer
          </Button>
        </a>
        <Link href="/verify">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Verify another
          </Button>
        </Link>
      </div>
    </div>
  );
}
