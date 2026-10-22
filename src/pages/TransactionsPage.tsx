import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { Transaction, PlatformStats, Bounty } from "../types";
import { 
  History, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  FilterX, 
  Loader2, 
  Coins, 
  ShieldCheck, 
  Lock,
  ArrowRight
} from "lucide-react";

interface TransactionsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [bountiesMap, setBountiesMap] = useState<Record<number, Bounty>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [txList, platformStats, allBounties] = await Promise.all([
          api.getTransactions().catch(() => []),
          api.getStats().catch(() => null),
          api.getBounties().catch(() => []),
        ]);
        setTransactions(txList);
        if (platformStats) setStats(platformStats);

        const bMap: Record<number, Bounty> = {};
        allBounties.forEach((b) => {
          bMap[b.id] = b;
        });
        setBountiesMap(bMap);
      } catch (err: any) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.event_type.toLowerCase().includes(q) ||
          (t.txn_id && t.txn_id.toLowerCase().includes(q)) ||
          String(t.bounty_id).includes(q)
      );
    }

    if (eventFilter !== "all") {
      list = list.filter((t) => t.event_type.toLowerCase() === eventFilter.toLowerCase());
    }

    return list;
  }, [transactions, search, eventFilter]);

  const totalVolume = stats?.transactions.volume || transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  const getEventBadge = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case "created":
        return { label: "ESCROW FUNDED", bg: "bg-[#191D19] text-[#C6FF4D] border-[#2B302B]" };
      case "acquired":
        return { label: "WORKER ASSIGNED", bg: "bg-amber-950/20 text-amber-400 border-amber-800/30" };
      case "completed":
        return { label: "ESCROW SETTLED", bg: "bg-emerald-950/20 text-[#10B981] border-emerald-800/30" };
      case "disputed":
        return { label: "ESCROW FROZEN", bg: "bg-rose-950/20 text-[#EF4444] border-rose-800/30" };
      case "resolved":
        return { label: "ARBITRATION SETTLED", bg: "bg-purple-950/20 text-purple-400 border-purple-800/30" };
      case "cancelled":
        return { label: "ESCROW REFUNDED", bg: "bg-[#141715] text-[#9A9E98] border-[#2B302B]" };
      default:
        return { label: t.toUpperCase(), bg: "bg-[#141715] text-[#9A9E98] border-[#2B302B]" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#2B302B] pb-6">
        <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>On-Chain Audit Trail</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
          Escrow & Transactions Ledger
        </h1>
        <p className="text-xs sm:text-sm text-[#9A9E98] mt-1 max-w-xl">
          Verifiable ledger of all smart contract creation deposits, worker assignments, milestone releases, and dispute arbitrations on Algorand.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
          <div className="text-xs text-[#6B7068] font-mono uppercase">Logged Escrow Volume</div>
          <div className="text-2xl font-bold font-mono text-[#C6FF4D] mt-1">
            {loading ? "..." : `${totalVolume.toLocaleString()} ALGO`}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
          <div className="text-xs text-[#6B7068] font-mono uppercase">Total Recorded Events</div>
          <div className="text-2xl font-bold font-mono text-[#F5F5F0] mt-1">
            {loading ? "..." : transactions.length}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
          <div className="text-xs text-[#6B7068] font-mono uppercase">Settlement Rate</div>
          <div className="text-2xl font-bold font-mono text-[#10B981] mt-1">
            {stats ? `${Math.round((stats.bounties.completed / (stats.bounties.total || 1)) * 100)}%` : "100%"}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
          <div className="text-xs text-[#6B7068] font-mono uppercase">Consensus Network</div>
          <div className="text-base font-bold font-mono text-[#F5F5F0] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Algorand Testnet</span>
          </div>
        </div>
      </div>

      {/* Search & Event Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
          <input
            type="text"
            placeholder="Search by txn hash, bounty ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141715] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "all", label: "All Events" },
            { id: "created", label: "Funded" },
            { id: "acquired", label: "Assigned" },
            { id: "completed", label: "Settled" },
            { id: "disputed", label: "Disputed" },
            { id: "resolved", label: "Resolved" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setEventFilter(item.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                eventFilter === item.id
                  ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                  : "bg-[#141715] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C6FF4D] mx-auto mb-2" />
          <p className="text-xs text-[#9A9E98]">Syncing smart contract transaction receipts...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-3">
          <History className="w-8 h-8 text-[#6B7068] mx-auto" />
          <h3 className="text-base font-bold text-[#F5F5F0]">No Transactions Found</h3>
          <p className="text-xs text-[#9A9E98]">
            No records matched your search query or filter selection.
          </p>
          {(search || eventFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setEventFilter("all");
              }}
              className="text-xs text-[#C6FF4D] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#141715] border border-[#2B302B] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B302B] bg-[#191D19] text-[#6B7068] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Associated Bounty</th>
                  <th className="py-3 px-4">Details / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Txn Identifier / Explorer</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B302B]">
                {filteredTransactions.map((tx) => {
                  const badge = getEventBadge(tx.event_type);
                  const linkedBounty = bountiesMap[tx.bounty_id];
                  return (
                    <tr key={tx.id} className="hover:bg-[#191D19]/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onNavigate("bounty-detail", String(tx.bounty_id))}
                          className="font-semibold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors flex items-center gap-1"
                        >
                          <span>Bounty #{tx.bounty_id}</span>
                          <ArrowRight className="w-3 h-3 text-[#6B7068]" />
                        </button>
                        {linkedBounty && (
                          <div className="text-[10px] text-[#6B7068] max-w-[180px] truncate">
                            {linkedBounty.title}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#9A9E98] max-w-sm">
                        <span className="line-clamp-2">{tx.description}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#C6FF4D]">
                        {tx.amount ? `${tx.amount} ALGO` : "—"}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.txn_id ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="text-[#F5F5F0] max-w-[130px] truncate" title={tx.txn_id}>
                              {tx.txn_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(tx.txn_id!)}
                              className="text-[#6B7068] hover:text-[#F5F5F0] p-1 rounded"
                              title="Copy transaction ID"
                            >
                              {copiedId === tx.txn_id ? (
                                <Check className="w-3 h-3 text-[#10B981]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <a
                              href={`https://testnet.explorer.perawallet.app/tx/${tx.txn_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#9A9E98] hover:text-[#C6FF4D] p-1"
                              title="Inspect on Algorand Explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-[#6B7068]">State Transition</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-[11px] text-[#6B7068]">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
