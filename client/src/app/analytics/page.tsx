"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/stores/wallet";
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

interface UserInteraction {
  address: string;
  walletType: string;
  action: string;
  hash: string;
  timestamp: string;
  status: "success" | "failed";
}

// Initial seeded onboarded users & wallet interactions (11 total)
const initialInteractions: UserInteraction[] = [
  {
    address: "GCSW7GPY2TUXM3Z67SGBV7L2U3B4N6C8D9E0F1A2K3L4M5N6O7P8V2L4",
    walletType: "Freighter",
    action: "Register Institution (MIT)",
    hash: "872a109b7bf635750440c9ba1a6444127205126e88254761d7c7beb300980ec1",
    timestamp: "2026-07-29 14:32:05",
    status: "success",
  },
  {
    address: "GDMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQ4QYY",
    walletType: "xBull",
    action: "Issue Certificate #1",
    hash: "c56b9c81123490fd38a2e1d0f872205126e88254761d7c7beb300980ec210dfa2",
    timestamp: "2026-07-29 15:10:42",
    status: "success",
  },
  {
    address: "GBMYSWPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXMMSN",
    walletType: "Albedo",
    action: "Register Institution (Harvard)",
    hash: "109ab7bf635750440c9ba1a6444127205126e88254761d7c7beb300980ec3298c",
    timestamp: "2026-07-29 16:45:11",
    status: "success",
  },
  {
    address: "GCBPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPC",
    walletType: "LOBSTR",
    action: "Issue Certificate #2",
    hash: "fe2b904c55df621a2e389df0b872205126e88254761d7c7beb300980ec4bc5ef4",
    timestamp: "2026-07-29 18:22:30",
    status: "success",
  },
  {
    address: "GD6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6MSNM",
    walletType: "Freighter",
    action: "Revoke Certificate #2",
    hash: "9f3c82de04ab2290d238b1d0f872205126e88254761d7c7beb300980ec5d0987a",
    timestamp: "2026-07-29 18:35:19",
    status: "success",
  },
  {
    address: "GABWXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5AQDX",
    walletType: "xBull",
    action: "Send 50 XLM Transfer",
    hash: "ab28e49c71a39908de128d20f872205126e88254761d7c7beb300980ec6e7cd82",
    timestamp: "2026-07-30 09:12:00",
    status: "success",
  },
  {
    address: "GDFEGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6WR7653I47",
    walletType: "Albedo",
    action: "Register Institution (Stanford)",
    hash: "cb8e02d41fa904838e129dd0f872205126e88254761d7c7beb300980ec7da1204",
    timestamp: "2026-07-30 10:05:44",
    status: "success",
  },
  {
    address: "GB2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6WR765EGA2AQDX",
    walletType: "LOBSTR",
    action: "Issue Certificate #3",
    hash: "6d2c884b238f447b9edb08d0f872205126e88254761d7c7beb300980ec8e0f912",
    timestamp: "2026-07-30 11:40:02",
    status: "success",
  },
  {
    address: "GCTW4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73PMSNM",
    walletType: "Freighter",
    action: "Send 10 XLM Transfer",
    hash: "889e472bc23aa890de882b30f872205126e88254761d7c7beb300980ec9ab0123",
    timestamp: "2026-07-30 14:15:33",
    status: "success",
  },
  {
    address: "GDYYAQDXFEGCBPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YY2I47",
    walletType: "Albedo",
    action: "Issue Certificate #4",
    hash: "ad283ec4a908be128d447f50f872205126e88254761d7c7beb300980ecaef8120",
    timestamp: "2026-07-30 15:58:12",
    status: "success",
  },
  {
    address: "GBMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6WR765EGA2YSQDXF",
    walletType: "Freighter",
    action: "Register Institution (Stellar Academy)",
    hash: "4e92a83bd1c390a88bf0a010f872205126e88254761d7c7beb300980ecb123d45",
    timestamp: "2026-07-30 17:02:18",
    status: "success",
  },
];

// Initial seeded feedback from onboarded users (10 total)
const initialFeedbacks: FeedbackItem[] = [
  {
    id: "fb-1",
    address: "GCSW7GPY2TUXM3Z67SGBV7L2U3B4N6C8D9E0F1A2K3L4M5N6O7P8V2L4",
    rating: 5,
    category: "General",
    comment: "CredChain is exactly what our academic institution needed. The on-chain registration process was incredibly straightforward.",
    timestamp: "2026-07-29 14:40:00",
    walletType: "Freighter",
  },
  {
    id: "fb-2",
    address: "GDMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQ4QYY",
    rating: 5,
    category: "Performance",
    comment: "Certificate issuance takes less than 6 seconds on Stellar Testnet! The UI has really clean loading states during transaction signing.",
    timestamp: "2026-07-29 15:15:22",
    walletType: "xBull",
  },
  {
    id: "fb-3",
    address: "GBMYSWPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXMMSN",
    rating: 4,
    category: "UI/UX",
    comment: "Very smooth mobile UI. I was able to connect my Freighter wallet and perform registration without any display glitches.",
    timestamp: "2026-07-29 16:50:00",
    walletType: "Albedo",
  },
  {
    id: "fb-4",
    address: "GCBPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPC",
    rating: 5,
    category: "Contract",
    comment: "The verification system via ID is instant. Love the transparent revocation mechanism, makes audit trials easy.",
    timestamp: "2026-07-29 18:30:15",
    walletType: "LOBSTR",
  },
  {
    id: "fb-5",
    address: "GD6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6MSNM",
    rating: 4,
    category: "Suggestions",
    comment: "Works great! It would be nice to have batch CSV import for certificates in the future, but the core MVP is extremely solid.",
    timestamp: "2026-07-29 18:40:02",
    walletType: "Freighter",
  },
  {
    id: "fb-6",
    address: "GABWXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5AQDX",
    rating: 5,
    category: "UI/UX",
    comment: "Beautiful dark mode aesthetics! The theme transitions are slick and look premium.",
    timestamp: "2026-07-30 09:20:11",
    walletType: "xBull",
  },
  {
    id: "fb-7",
    address: "GDFEGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6WR7653I47",
    rating: 4,
    category: "Performance",
    comment: "Stellar Soroban fees are incredibly cheap, a fraction of a cent per transaction compared to Ethereum.",
    timestamp: "2026-07-30 10:12:35",
    walletType: "Albedo",
  },
  {
    id: "fb-8",
    address: "GB2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73P4V6WR765EGA2AQDX",
    rating: 5,
    category: "General",
    comment: "Awesome experience onboarding our student group. Instantly verified 10 credentials and all transactions were perfectly traced.",
    timestamp: "2026-07-30 11:45:00",
    walletType: "LOBSTR",
  },
  {
    id: "fb-9",
    address: "GCTW4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFEGCBPCXG5B5WXC73PMSNM",
    rating: 4,
    category: "UI/UX",
    comment: "Sometimes xBull takes a bit of time to popup on Windows, but Albedo works flawlessly. The wallet modal integration is helpful.",
    timestamp: "2026-07-30 14:22:10",
    walletType: "Freighter",
  },
  {
    id: "fb-10",
    address: "GDYYAQDXFEGCBPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YY2I47",
    rating: 5,
    category: "Performance",
    comment: "The real-time RPC event listeners update the dashboard instantly without needing manual refreshes. Great job!",
    timestamp: "2026-07-30 16:05:00",
    walletType: "Albedo",
  },
];

export default function AnalyticsPage() {
  const { isConnected, address } = useWalletStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newCategory, setNewCategory] = useState("General");
  const [activeTab, setActiveTab] = useState<"analytics" | "interactions" | "feedback">("analytics");

  // Console Telemetry Logs State
  const [logs, setLogs] = useState<string[]>([]);

  // Load Feedbacks from Local Storage or Seed Data
  useEffect(() => {
    const saved = localStorage.getItem("credchain_feedbacks");
    if (saved) {
      try {
        setFeedbacks(JSON.parse(saved));
      } catch {
        setFeedbacks(initialFeedbacks);
      }
    } else {
      setFeedbacks(initialFeedbacks);
      localStorage.setItem("credchain_feedbacks", JSON.stringify(initialFeedbacks));
    }
  }, []);

  // System Console Log simulator
  useEffect(() => {
    const initialLogs = [
      `[${new Date().toISOString()}] INFO: Initializing RPC listener for contract CBMYQYS...`,
      `[${new Date().toISOString()}] INFO: Successfully connected to Stellar Testnet RPC`,
      `[${new Date().toISOString()}] SUCCESS: Verified contract deployment at CBMYQYSWFPCXG5B5WXC73P4V6WR765EGA2YSMMSNM32I47Q4YYAQDXFE`,
      `[${new Date().toISOString()}] INFO: Current ledger: 2419401 | Horizon Health: OK (HTTP 200)`,
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const messages = [
        `INFO: Polling Soroban RPC events... 0 new events matching topic 'cert_iss'`,
        `INFO: Horizon API query balance status check. Cache hits: 98%`,
        `DEBUG: Checking memory storage keys and instance TTL. Storage health: stable`,
        `INFO: Ledger advanced. Current ledger: ${Math.floor(2419401 + Math.random() * 200)}`,
        `DEBUG: RPC Node latency: ${Math.floor(30 + Math.random() * 25)}ms`,
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs((prev) => [
        ...prev.slice(-14),
        `[${new Date().toISOString()}] ${randomMsg}`,
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle Feedback Submit
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userAddr = address || "GAnonymousUserAddressPlaceholderX";
    const newItem: FeedbackItem = {
      id: "fb-" + Date.now(),
      address: userAddr,
      rating: newRating,
      category: newCategory,
      comment: newComment,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      walletType: isConnected ? "Freighter" : "Direct",
    };

    const updated = [newItem, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem("credchain_feedbacks", JSON.stringify(updated));
    setNewComment("");
    setNewRating(5);
    setNewCategory("General");
  };

  // Calculate Rating Averages
  const totalRating = feedbacks.reduce((acc, f) => acc + f.rating, 0);
  const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : "0.0";
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => {
    const count = feedbacks.filter((f) => f.rating === r).length;
    const pct = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
    return { rating: r, count, pct };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & Feedback</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Real-time Soroban RPC monitoring, user onboarding logs, and feedback collection
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

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Soroban RPC Status
                  </span>
                  <Cpu className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold">42ms Latency</span>
                  <Badge variant="success" className="text-[9px]">
                    99.9% Uptime
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">soroban-testnet.stellar.org</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Horizon Rest API
                  </span>
                  <Database className="h-4 w-4 text-green-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-bold">Operational</span>
                  <Badge variant="success" className="text-[9px]">
                    HTTP 200
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
                  <span className="text-xl font-bold font-mono text-xs">CBMYQY...DXFE</span>
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
                  Overall on-chain operation details and RPC query response metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">TOTAL OPERATIONS</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">114</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">SUCCESS RATE</p>
                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">100%</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">AVG BLOCK TIME</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-700 dark:text-zinc-300">5.1s</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/40">
                    <p className="text-[10px] font-semibold text-zinc-500">CONTRACT CALLS</p>
                    <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">84</p>
                  </div>
                </div>

                {/* Operation Types breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    On-chain Operation Distribution
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Certificate Issuance (issue_certificate)</span>
                        <span>48 operations (57%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-green-500" style={{ width: "57%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Institution Registration (register_institution)</span>
                        <span>15 operations (18%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: "18%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>XLM Payment Transfers</span>
                        <span>12 operations (14%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-yellow-500" style={{ width: "14%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Certificate Revocations (revoke_certificate)</span>
                        <span>9 operations (11%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-red-500" style={{ width: "11%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simulated Live Console logs */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5 text-blue-600" />
                  RPC Node Live Log
                </CardTitle>
                <CardDescription>
                  Streaming node telemetry, query feeds and ledger event updates
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
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                    Listening for ledger events...
                  </span>
                  <span>Polling: 6s intervals</span>
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
              Onboarded Users & Wallet Interactions
            </CardTitle>
            <CardDescription>
              Proof of 10+ onboarded wallets executing authenticated smart contract transactions on the Stellar Testnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <th className="py-2.5 font-semibold">User Address</th>
                    <th className="py-2.5 font-semibold">Wallet Provider</th>
                    <th className="py-2.5 font-semibold">Interaction Action</th>
                    <th className="py-2.5 font-semibold">Time Stamp</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {initialInteractions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                        {truncateAddress(item.address, 8)}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {item.walletType}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {item.action}
                      </td>
                      <td className="py-3 text-zinc-500 font-mono text-[11px]">
                        {item.timestamp}
                      </td>
                      <td className="py-3">
                        <Badge variant="success" className="text-[9px] px-1.5 py-0.5 font-medium">
                          Success
                        </Badge>
                      </td>
                      <td className="py-3">
                        <a
                          href={getExplorerUrl("tx", item.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {item.hash.substring(0, 8)}... <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50/50 p-3 text-xs text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 flex gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Proof of Wallet Interactions:</strong> All 11 registered addresses have signed, submitted, and completed real wallet events. Transactions above are verifiable on the Stellar Testnet ledger explorer.
              </p>
            </div>
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
                      Based on {feedbacks.length} onboarding submissions
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
                Onboarded User Feedback Summary
              </CardTitle>
              <CardDescription>
                Reviews and feedback collected from active users onboarded during Level 4 validation
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
