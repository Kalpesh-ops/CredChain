"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Search, RefreshCw, Loader2 } from "lucide-react";
import { useAllCertificates } from "@/hooks/contract";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { decodeCredential } from "@/lib/credential";
import { truncateAddress, formatTimestamp } from "@/lib/utils";

export default function CredentialsPage() {
  const { data, isLoading, isFetching, refetch, error } = useAllCertificates();
  const [query, setQuery] = useState("");

  const certificates = useMemo(() => {
    const all = data?.certificates ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return all;
    return all.filter((cert) => {
      const credential = decodeCredential(cert.metadata_uri);
      return [
        String(cert.id),
        cert.issuer,
        cert.recipient,
        data?.issuerNames[cert.issuer] ?? "",
        credential?.holder ?? "",
        credential?.title ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [data, query]);

  const revoked = data?.certificates.filter((c) => c.revoked).length ?? 0;
  const institutionCount = Object.keys(data?.issuerNames ?? {}).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Award className="h-6 w-6 text-blue-600" />
            Credential registry
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Every credential ever issued on this contract, read live from the
            Stellar ledger. No wallet needed.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Issued", value: data?.total ?? 0 },
          { label: "Valid", value: (data?.total ?? 0) - revoked },
          { label: "Issuers", value: institutionCount },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold tabular-nums">
                {isLoading ? "—" : stat.value}
              </div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input
        placeholder="Filter by id, holder, title, issuer, or address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-700 dark:text-red-300">
            Could not read the registry from the ledger. Try refreshing.
          </CardContent>
        </Card>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {data?.total === 0 ? (
              <>
                No credentials issued yet.{" "}
                <Link href="/start" className="underline">
                  Issue the first one
                </Link>
                .
              </>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Search className="h-4 w-4" />
                Nothing matches that filter.
              </span>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => {
            const credential = decodeCredential(cert.metadata_uri);
            return (
              <Link key={cert.id} href={`/verify/${cert.id}`} className="block">
                <Card className="transition-colors hover:border-blue-400">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                          #{cert.id}
                        </span>
                        <span className="truncate font-medium">
                          {credential?.title ?? "Credential"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {credential?.holder ?? truncateAddress(cert.recipient)}
                        {" — "}
                        {data?.issuerNames[cert.issuer] ??
                          truncateAddress(cert.issuer)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatTimestamp(cert.issued_at)}
                      </span>
                      <Badge variant={cert.revoked ? "destructive" : "success"}>
                        {cert.revoked ? "Revoked" : "Valid"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
