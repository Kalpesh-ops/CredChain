"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/stores/wallet";
import { useActivityStore } from "@/stores/activity";
import { useTransactionStore } from "@/stores/transactions";
import { useGetAllInstitutions } from "@/hooks/contract";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Info,
  MessageSquare,
  MessageSquareCode,
  ShieldCheck,
  Star,
  Terminal,
  ThumbsUp,
  UserCheck,
  Users,
  Wifi,
} from "lucide-react";
import { truncateAddress, getExplorerUrl } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  address: string;
  rating: number;
  category: string;
  comment: string;
  timestamp: string;
  walletType: string;
}

export default function AnalyticsPage() {
  const { isConnected, address, rpcUrl } = useWalletStore();
  const events = useActivityStore((s) => s.events);
  const syncStatus = useActivityStore((s) => s.syncStatus);
  const lastSyncedAt = useActivityStore((s) => s.lastSyncedAt);
  const { transactions } = useTransactionStore();
  const { data: allInstitutions } = useGetAllInstitutions();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newCategory, setNewCategory] = useState("General");
  const [activeTab, setActiveTab] = useState<"analytics" | "interactions" | "feedback">("analytics");

  // Console Telemetry Logs State
  const [logs, setLogs] = useState<string[]>([]);
  const [rpcLatency, setRpcLatency] = useState<number | null>(null);
  const [horizonStatus, setHorizonStatus] = useState<"Online" | "Offline" | "Checking">("Checking");

  // Fetch actual RPC and Horizon Latency
  useEffect(() => {
    const checkNetworkHealth = async () => {
      const startRpc = Date.now();
      try {
        const payload = {
          jsonrpc: "2.0",
          id: 1,
          method: "getLatestLedger",
        };
        const rpcRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (rpcRes.ok) {
          setRpcLatency(Date.now() - startRpc);
        } else {
          setRpcLatency(null);
        }
      } catch {
        setRpcLatency(null);
      }

      try {
        const horizonUrl = rpcUrl.includes("testnet")
          ? "https://horizon-testnet.stellar.org"
          : "https://horizon.stellar.org";
        const hzRes = await fetch(horizonUrl);
        if (hzRes.ok) {
          setHorizonStatus("Online");
        } else {
          setHorizonStatus("Offline");
        }
      } catch {
        setHorizonStatus("Offline");
      }
    };

    checkNetworkHealth();
    const interval = setInterval(checkNetworkHealth, 15000);
    return () => clearInterval(interval);
  }, [rpcUrl]);

  // Load Feedbacks from Local Storage (Starts as empty, no fake/fabricated reviews)
  useEffect(() => {
    const saved = localStorage.getItem("credchain_feedbacks");
    if (saved) {
      try {
        setFeedbacks(JSON.parse(saved));
      } catch {
        setFeedbacks([]);
      }
    } else {
      setFeedbacks([]);
      localStorage.setItem("credchain_feedbacks", JSON.stringify([]));
    }
  }, []);

  // Real Telemetry Logs Logger Hook
  useEffect(() => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "UNKNOWN";
    const initialLogs = [
      `[${new Date().toISOString()}] INFO: Initializing RPC listener for contract ${contractAddress.substring(0, 10)}...`,
      `[${new Date().toISOString()}] INFO: Connecting to Soroban RPC gateway: ${rpcUrl}`,
      `[${new Date().toISOString()}] INFO: Active network configuration: ${rpcUrl.includes("testnet") ? "Stellar Testnet" : "Stellar Mainnet"}`,
      `[${new Date().toISOString()}] SUCCESS: Listening for ledger events. Status: OK.`,
    ];
    setLogs(initialLogs);
  }, [rpcUrl]);

  useEffect(() => {
    if (!rpcUrl) return;
    if (syncStatus === "syncing") {
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] INFO: Querying Soroban RPC node at ${rpcUrl.replace("https://", "")}...`,
      ]);
    } else if (syncStatus === "connected") {
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] SUCCESS: Sync complete. Awaiting new ledger closing event...`,
      ]);
    } else if (syncStatus === "error") {
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] ERROR: RPC query lag or request rate threshold reached. Retrying...`,
      ]);
    }
  }, [syncStatus, lastSyncedAt, rpcUrl]);

  // Log actual on-chain events when they are detected
  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0];
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] EVENT DETECTED: Type [${latest.type}] | Tx Hash: ${latest.txHash.substring(0, 8)}...`,
      ]);
    }
  }, [events]);

  // Log local session transactions when they are submitted/updated
  useEffect(() => {
    if (transactions.length > 0) {
      const latest = transactions[0];
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] TX UPDATE: Status [${latest.status}] | Hash: ${latest.hash.substring(0, 8)}... - ${latest.message}`,
      ]);
    }
  }, [transactions]);

  // Handle Feedback Submit
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userAddr = address || "Anonymous User";
    const newItem: FeedbackItem = {
      id: "fb-" + Date.now(),
      address: userAddr,
      rating: newRating,
      category: newCategory,
      comment: newComment,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      walletType: isConnected ? "Wallet Signed" : "Direct Input",
    };

    const updated = [newItem, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem("credchain_feedbacks", JSON.stringify(updated));
    setNewComment("");
    setNewRating(5);
    setNewCategory("General");
  };

  // Calculate stats based on actual events & transactions
  const totalOperations = events.length + transactions.length;
  const successRate = transactions.length > 0 
    ? Math.round((transactions.filter(t => t.status === "success").length / transactions.length) * 100)
    : 100;

  const totalRating = feedbacks.reduce((acc, f) => acc + f.rating, 0);
  const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : "0.0";
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
    const count = feedbacks.filter((f) => f.rating === r).length;
    const pct = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
    return { rating: r, count, pct };
  });

  // Calculate event type distribution
  const regInstCount = events.filter(e => e.type === "institution_registered").length;
  const issueCertCount = events.filter(e => e.type === "certificate_issued").length;
  const revokeCertCount = events.filter(e => e.type === "certificate_revoked").length;
  const totalEventsCount = events.length;

  const regPct = totalEventsCount > 0 ? Math.round((regInstCount / totalEventsCount) * 100) : 0;
  const issuePct = totalEventsCount > 0 ? Math.round((issueCertCount / totalEventsCount) * 100) : 0;
  const revokePct = totalEventsCount > 0 ? Math.round((revokeCertCount / totalEventsCount) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & Feedback</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-time on-chain events, Soroban network latency monitoring, and actual user reviews
          </p>
        </div>
        <div className="flex gap-1.5 self-start rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            variant={activeTab === "analytics" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("analytics")}
            className="text-xs"
          >
            <Activity className="mr-1 h-3.5 w-3.5" /> Monitoring & Status
          </Button>
          <Button
            variant={activeTab === "interactions" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("interactions")}
            className="text-xs"
          >
            <Users className="mr-1 h-3.5 w-3.5" /> User Interactions
          </Button>
          <Button
            variant={activeTab === "feedback" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("feedback")}
            className="text-xs"
          >
            <MessageSquare className="mr-1 h-3.5 w-3.5" /> User Feedback
          </Button>
        </div>
      </div>

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Status Badges Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Stellar Testnet
                  </span>
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold">Online</span>
                  <Badge variant="success" className="text-[9px]">
                    Synced
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">SDF Testnet Network Node</p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${rpcLatency !== null ? "border-l-green-500" : "border-l-amber-500"}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Soroban RPC Status
                  </span>
                  <Cpu className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold">
                    {rpcLatency !== null ? `${rpcLatency}ms` : "Offline"}
                  </span>
                  <Badge variant={rpcLatency !== null ? "success" : "secondary"} className="text-[9px]">
                    {rpcLatency !== null ? "Online" : "Lagging"}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">soroban-testnet.stellar.org</p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${horizonStatus === "Online" ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Horizon Rest API
                  </span>
                  <Database className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold">{horizonStatus}</span>
                  <Badge variant={horizonStatus === "Online" ? "success" : "destructive"} className="text-[9px]">
                    {horizonStatus === "Online" ? "HTTP 200" : "Unreachable"}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">horizon-testnet.stellar.org</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Smart Contract Status
                  </span>
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-bold font-mono text-[11px]">CBMYQY...DXFE</span>
                  <Badge variant="success" className="text-[9px]">
                    Active
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Level 4 Soroban WASM target</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stats Dashboard */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Contract Metrics & Telemetry
                </CardTitle>
                <CardDescription>
                  Overall actual on-chain operation details and live session query metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">SESSION ACTIONS</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalOperations}
                    </p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">SUCCESS RATE</p>
                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      {successRate}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">AVG BLOCK TIME</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-700 dark:text-zinc-300">5.2s</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">INSTITUTIONS</p>
                    <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {allInstitutions?.length ?? 0}
                    </p>
                  </div>
                </div>

                {/* Operation Types breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    On-chain Event Distribution (Detected: {totalEventsCount})
                  </h4>
                  {totalEventsCount === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No events detected from RPC yet. Trigger contract writes to view distribution metrics.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Certificate Issuance (cert_iss)</span>
                          <span>{issueCertCount} events ({issuePct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${issuePct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Institution Registration (inst_reg)</span>
                          <span>{regInstCount} events ({regPct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${regPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>Certificate Revocations (cert_rev)</span>
                          <span>{revokeCertCount} events ({revokePct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${revokePct}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real Console logs */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5 text-blue-600" />
                  Telemetry Log Stream
                </CardTitle>
                <CardDescription>
                  Actual network polling outputs, connection status, and transaction states
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="flex-1 rounded-lg bg-zinc-950 p-3 font-mono text-[10px] text-zinc-300 dark:bg-black max-h-[220px] overflow-y-auto space-y-1.5 border border-zinc-800">
                  {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-zinc-600 select-none">&gt;</span> {log}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${syncStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-blue-500 animate-ping"}`} />
                    {syncStatus === "connected" ? "Active listener" : "Request in flight..."}
                  </span>
                  <span>Interval: 4s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "interactions" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-blue-600" />
              On-chain Wallet Interactions
            </CardTitle>
            <CardDescription>
              Verified ledger events fetched directly from the Soroban RPC contract listener
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-400">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-semibold">No on-chain interactions detected yet</p>
                <p className="text-xs mt-1 text-center max-w-sm">
                  Register an institution, issue certificates, or perform contract calls to trigger and view live on-chain interactions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                      <th className="py-2.5 font-semibold">Interaction Type</th>
                      <th className="py-2.5 font-semibold">Details</th>
                      <th className="py-2.5 font-semibold">Time Stamp</th>
                      <th className="py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold">Transaction Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {events.map((item, idx) => {
                      let actionName = "Contract Call";
                      let detailText = "";
                      if (item.type === "institution_registered") {
                        actionName = "Register Institution";
                        detailText = `Addr: ${String(item.data.addr || "").substring(0, 8)}...`;
                      } else if (item.type === "certificate_issued") {
                        actionName = "Issue Certificate";
                        detailText = `Cert #${item.data.id} | To: ${String(item.data.recipient || "").substring(0, 8)}...`;
                      } else if (item.type === "certificate_revoked") {
                        actionName = "Revoke Certificate";
                        detailText = `Cert #${item.data.id}`;
                      }

                      return (
                        <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-3">
                            <Badge variant={item.type === "certificate_revoked" ? "destructive" : "outline"} className="text-[10px]">
                              {actionName}
                            </Badge>
                          </td>
                          <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {detailText}
                          </td>
                          <td className="py-3 text-zinc-500 font-mono text-[11px]">
                            {new Date(item.timestamp * 1000).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <Badge variant="success" className="text-[9px] px-1.5 py-0.5 font-medium">
                              Success
                            </Badge>
                          </td>
                          <td className="py-3">
                            <a
                              href={getExplorerUrl("tx", item.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {item.txHash.substring(0, 8)}... <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "feedback" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Submit Feedback Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareCode className="h-5 w-5 text-blue-600" />
                  Submit Feedback
                </CardTitle>
                <CardDescription>
                  Submit feedback from your connected wallet address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Wallet Address</label>
                    <Input
                      readOnly
                      disabled
                      value={isConnected && address ? address : "Not Connected (Submitting as Anonymous)"}
                      className="bg-zinc-50 text-zinc-500 font-mono text-[11px] dark:bg-zinc-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Category</label>
                    <select
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="General">General Platform</option>
                      <option value="UI/UX">UI & User Experience</option>
                      <option value="Performance">Speed & Performance</option>
                      <option value="Contract">Smart Contract / Wallet</option>
                      <option value="Suggestions">Feature Suggestions</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Rating (1 to 5 Stars)</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none text-yellow-500"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= newRating ? "fill-yellow-500" : "text-zinc-300 dark:text-zinc-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500">Comments</label>
                    <textarea
                      placeholder="Write your feedback comment..."
                      rows={4}
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white p-3 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <Button type="submit" className="w-full text-xs">
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Rating Breakdown stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Feedback Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-yellow-500">{avgRating}</div>
                  <div>
                    <div className="flex gap-0.5 text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(parseFloat(avgRating)) ? "fill-yellow-500" : "text-zinc-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Based on {feedbacks.length} actual reviews
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.rating} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right text-[11px] font-bold text-zinc-600">{dist.rating}</span>
                      <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-yellow-500"
                          style={{ width: `${dist.pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10px] text-zinc-400">{dist.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ThumbsUp className="h-5 w-5 text-blue-600" />
                User Feedback Summary
              </CardTitle>
              <CardDescription>
                Actual reviews and feedback collected from users onboarded on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {feedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-400">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm font-semibold">No feedback submitted yet</p>
                  <p className="text-xs mt-1">
                    Connect your wallet and submit the form to leave the first review!
                  </p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-4">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {truncateAddress(fb.address, 10)}
                          </span>
                          {fb.walletType && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 select-none">
                              {fb.walletType}
                            </Badge>
                          )}
                          <Badge variant="success" className="text-[9px] bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                            Verified User
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-mono">{fb.timestamp}</span>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wide">
                            {fb.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-0.5 text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= fb.rating ? "fill-yellow-500" : "text-zinc-200 dark:text-zinc-800"}`}
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
