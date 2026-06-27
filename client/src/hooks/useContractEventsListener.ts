"use client";

import { useEffect, useRef } from "react";
import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import { useWalletStore } from "@/stores/wallet";
import { useActivityStore } from "@/stores/activity";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useContractEventsListener() {
  const rpcUrl = useWalletStore((s) => s.rpcUrl);
  const isConnected = useWalletStore((s) => s.isConnected);
  const addEvent = useActivityStore((s) => s.addEvent);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const lastLedgerRef = useRef<number | null>(null);
  const activeRef = useRef<boolean>(true);

  useEffect(() => {
    activeRef.current = true;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) return;

    const server = new rpc.Server(rpcUrl);

    const parseScVal = (val: any): xdr.ScVal => {
      if (typeof val === "string") {
        return xdr.ScVal.fromXDR(val, "base64");
      }
      return val;
    };

    const fetchEvents = async () => {
      try {
        if (!lastLedgerRef.current) {
          // Initialize with latest ledger sequence
          const latest = await server.getLatestLedger();
          lastLedgerRef.current = latest.sequence - 10; // check last 10 ledgers initially to avoid missing quick actions
          return;
        }

        const latest = await server.getLatestLedger();
        const currentSequence = latest.sequence;
        
        if (currentSequence <= lastLedgerRef.current) {
          return;
        }

        const start = lastLedgerRef.current + 1;
        const response = await server.getEvents({
          startLedger: start,
          filters: [
            {
              type: "contract",
              contractIds: [contractAddress],
            },
          ],
        });

        if (response.events && response.events.length > 0) {
          for (const ev of response.events) {
            try {
              const rawTopics = ev.topic || [];
              if (rawTopics.length === 0) continue;

              const topicSymbol = scValToNative(parseScVal(rawTopics[0]));
              const val = scValToNative(parseScVal(ev.value));
              const timestamp = ev.ledgerClosedAt 
                ? Math.floor(new Date(ev.ledgerClosedAt).getTime() / 1000)
                : Math.floor(Date.now() / 1000);
              const txHash = ev.txHash || "";

              if (topicSymbol === "inst_reg") {
                const addr = typeof val === "string" ? val : (val.addr || "");
                addEvent({
                  type: "institution_registered",
                  timestamp,
                  txHash,
                  data: { addr },
                });
                queryClient.invalidateQueries({ queryKey: ["isInstitution"] });
                queryClient.invalidateQueries({ queryKey: ["institution"] });
                queryClient.invalidateQueries({ queryKey: ["allInstitutions"] });
                toast({
                  title: "Institution Registered",
                  description: `New institution registered on-chain.`,
                });
              } else if (topicSymbol === "cert_iss") {
                const id = val.id ? Number(val.id) : 0;
                const issuer = val.issuer || "";
                const recipient = val.recipient || "";
                addEvent({
                  type: "certificate_issued",
                  timestamp,
                  txHash,
                  data: { id, issuer, recipient },
                });
                queryClient.invalidateQueries({ queryKey: ["certificate"] });
                queryClient.invalidateQueries({ queryKey: ["verifyCertificate"] });
                queryClient.invalidateQueries({ queryKey: ["institution"] });
                toast({
                  title: "Certificate Issued",
                  description: `Certificate #${id} successfully issued!`,
                });
              } else if (topicSymbol === "cert_rev") {
                const id = val.id ? Number(val.id) : 0;
                const caller = val.caller || "";
                addEvent({
                  type: "certificate_revoked",
                  timestamp,
                  txHash,
                  data: { id, caller },
                });
                queryClient.invalidateQueries({ queryKey: ["certificate"] });
                queryClient.invalidateQueries({ queryKey: ["verifyCertificate"] });
                toast({
                  variant: "destructive",
                  title: "Certificate Revoked",
                  description: `Certificate #${id} has been revoked by issuer.`,
                });
              }
            } catch (err) {
              console.error("Error parsing event:", err);
            }
          }
        }

        lastLedgerRef.current = currentSequence;
      } catch (err) {
        console.error("Error fetching Soroban events:", err);
      }
    };

    // Poll every 4 seconds
    const interval = setInterval(() => {
      if (activeRef.current) {
        fetchEvents();
      }
    }, 4000);

    // Run immediately on start
    fetchEvents();

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [rpcUrl, addEvent, queryClient, toast]);
}
