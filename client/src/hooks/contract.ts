"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletStore } from "@/stores/wallet";
import { useTransactionStore } from "@/stores/transactions";
import {
  toScValString,
  toScValAddress,
  toScValU64,
} from "@/lib/scval";
import type { Institution, Certificate } from "@/types";

// Read hooks

export function useIsInstitution(address: string | null) {
  const readContract = useWalletStore((s) => s.readContract);

  return useQuery({
    queryKey: ["isInstitution", address],
    queryFn: async (): Promise<boolean> => {
      if (!address) return false;
      const result = await readContract("is_institution", [
        toScValAddress(address),
      ]);
      return result as boolean;
    },
    enabled: !!address,
  });
}

export function useGetInstitution(address: string | null) {
  const readContract = useWalletStore((s) => s.readContract);

  return useQuery({
    queryKey: ["institution", address],
    queryFn: async (): Promise<Institution | null> => {
      if (!address) return null;
      const result = await readContract("get_institution", [
        toScValAddress(address),
      ]);
      if (!result) return null;
      const inst = result as Record<string, unknown>;
      return {
        name: inst.name as string,
        verified: inst.verified as boolean,
        cert_count: (inst.cert_count as number) ?? 0,
      };
    },
    enabled: !!address,
  });
}

export function useGetCertificate(certId: number | null) {
  const readContract = useWalletStore((s) => s.readContract);

  return useQuery({
    queryKey: ["certificate", certId],
    queryFn: async (): Promise<Certificate | null> => {
      if (certId === null) return null;
      const result = await readContract("get_certificate", [
        toScValU64(certId),
      ]);
      if (!result) return null;
      const cert = result as Record<string, unknown>;
      return {
        id: (cert.id as number) ?? 0,
        issuer: cert.issuer as string,
        recipient: cert.recipient as string,
        metadata_uri: cert.metadata_uri as string,
        issued_at: (cert.issued_at as number) ?? 0,
        revoked: (cert.revoked as boolean) ?? false,
      };
    },
    enabled: certId !== null,
  });
}

export function useVerifyCertificate(certId: number | null) {
  const readContract = useWalletStore((s) => s.readContract);

  return useQuery({
    queryKey: ["verifyCertificate", certId],
    queryFn: async (): Promise<boolean> => {
      if (certId === null) return false;
      const result = await readContract("verify_certificate", [
        toScValU64(certId),
      ]);
      return result as boolean;
    },
    enabled: certId !== null,
  });
}

export function useGetAllInstitutions() {
  const readContract = useWalletStore((s) => s.readContract);

  return useQuery({
    queryKey: ["allInstitutions"],
    queryFn: async (): Promise<string[]> => {
      const result = await readContract("get_all_institutions", []);
      if (!result) return [];
      const vec = result as unknown[];
      return vec.map((v) => String(v));
    },
  });
}

// Write hooks (mutations)

export function useRegisterInstitution() {
  const signAndSendTransaction = useWalletStore((s) => s.signAndSendTransaction);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      name,
    }: {
      address: string;
      name: string;
    }) => {
      addTransaction({
        hash: "pending",
        status: "pending",
        message: `Registering "${name}" as institution...`,
      });

      const hash = await signAndSendTransaction("register_institution", [
        toScValAddress(address),
        toScValString(name),
      ]);

      updateTransaction("pending", {
        hash,
        status: "success",
        message: `"${name}" registered successfully!`,
      });

      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isInstitution"] });
      queryClient.invalidateQueries({ queryKey: ["institution"] });
      queryClient.invalidateQueries({ queryKey: ["allInstitutions"] });
    },
    onError: (error: Error) => {
      addTransaction({
        hash: "failed",
        status: "failed",
        message: error.message,
      });
    },
  });
}

export function useIssueCertificate() {
  const signAndSendTransaction = useWalletStore((s) => s.signAndSendTransaction);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issuer,
      recipient,
      metadataUri,
    }: {
      issuer: string;
      recipient: string;
      metadataUri: string;
    }) => {
      addTransaction({
        hash: "pending",
        status: "pending",
        message: "Issuing certificate...",
      });

      const hash = await signAndSendTransaction("issue_certificate", [
        toScValAddress(issuer),
        toScValAddress(recipient),
        toScValString(metadataUri),
      ]);

      updateTransaction("pending", {
        hash,
        status: "success",
        message: "Certificate issued successfully!",
      });

      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate"] });
      queryClient.invalidateQueries({ queryKey: ["institution"] });
    },
    onError: (error: Error) => {
      addTransaction({
        hash: "failed",
        status: "failed",
        message: error.message,
      });
    },
  });
}

export function useRevokeCertificate() {
  const signAndSendTransaction = useWalletStore((s) => s.signAndSendTransaction);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caller,
      certId,
    }: {
      caller: string;
      certId: number;
    }) => {
      addTransaction({
        hash: "pending",
        status: "pending",
        message: `Revoking certificate #${certId}...`,
      });

      const hash = await signAndSendTransaction("revoke_certificate", [
        toScValAddress(caller),
        toScValU64(certId),
      ]);

      updateTransaction("pending", {
        hash,
        status: "success",
        message: `Certificate #${certId} revoked successfully!`,
      });

      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate"] });
      queryClient.invalidateQueries({ queryKey: ["verifyCertificate"] });
    },
    onError: (error: Error) => {
      addTransaction({
        hash: "failed",
        status: "failed",
        message: error.message,
      });
    },
  });
}
