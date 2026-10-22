import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { api } from "../services/api";
import { Dispute, Bounty, PlatformStats } from "../types";
import { 
  Scale, 
  History, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X,
  Loader2,
  FolderCheck,
  ShieldCheck
} from "lucide-react";

export const ArbitratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { address, sendPayment } = useWallet();

  const [activeTab, setActiveTab] = useState<"open" | "history" | "stats">("open");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [bountiesMap, setBountiesMap] = useState<Record<number, Bounty>>({});
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Irreversible confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    dispute: Dispute;
    decision: "worker" | "poster";
    bounty: Bounty;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  // Notice
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmModal && !resolving) {
        setConfirmModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmModal, resolving]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allDisputes, allBounties, platformStats] = await Promise.all([
        api.getDisputes(),
        api.getBounties(),
        api.getStats(),
      ]);

      setDisputes(allDisputes);
      setStats(platformStats);

      const bMap: Record<number, Bounty> = {};
      allBounties.forEach((b) => {
        bMap[b.id] = b;
      });
      setBountiesMap(bMap);
    } catch (err: any) {
      showNotice(err.message || "Failed to load dispute data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDisputes = disputes.filter((d) => d.status === "open");
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved");

  const executeResolution = async () => {
    if (!confirmModal || !user) return;
    setResolving(true);

    try {
      const { dispute, decision, bounty } = confirmModal;
      const recipient = decision === "worker"
        ? (bounty.worker_address || "ALGO-TESTNET-WORKER")
        : "ALGO-TESTNET-POSTER-REFUND";

      // Execute confirmed settlement payment on Algorand
      const txnId = await sendPayment(recipient, bounty.reward);

      await api.resolveDispute(dispute.bounty_id, {
        decision,
        txn_id: txnId,
        resolved_by: user.email,
        resolver_wallet: address || undefined,
      });

      showNotice(`Dispute resolved in favor of ${decision.toUpperCase()}. Settlement TxID: ${txnId}`);
      setConfirmModal(null);
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to resolve dispute", "error");
    } finally {
      setResolving(false);
    }
  };

  const totalDisputesCount = disputes.length;
  const resolutionPercentage =
    totalDisputesCount > 0 ? Math.round((resolvedDisputes.length / totalDisputesCount) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Toast Alert */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg text-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border ${
            notice.type === "success" 
              ? "bg-[#141715] border-[#10B981] text-[#10B981]" 
              : "bg-[#141715] border-[#EF4444] text-[#EF4444]"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
          )}
          <span className="font-medium text-[#F5F5F0]">{notice.text}</span>
          <button 
            onClick={() => setNotice(null)} 
            className="text-[#9A9E98] hover:text-[#F5F5F0] ml-2 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-[#2B302B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#C6FF4D] mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF4D]"></span>
            <span>ESCROW JUDICIARY COMMAND CENTER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F0] tracking-tight">
            Dispute Arbitration Admin
          </h1>
          <p className="text-xs text-[#9A9E98] mt-0.5 truncate max-w-sm sm:max-w-md font-mono">
            Admin Arbiter: <span className="text-[#F5F5F0]">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs text-[#F5F5F0] transition-colors self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C6FF4D]" : ""}`} />
          <span>{loading ? "Syncing..." : "Refresh Cases"}</span>
        </button>
      </div>

      {/* Responsive Segmented Tabs */}
      <div className="overflow-x-auto pb-1 -mb-1">
        <div className="inline-flex min-w-full sm:min-w-0 sm:flex gap-1 p-1 rounded-lg bg-[#141715] border border-[#2B302B] text-xs font-semibold sm:max-w-md">
          <button
            onClick={() => setActiveTab("open")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "open" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>Open Disputes ({openDisputes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "history" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>Resolved ({resolvedDisputes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "stats" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Platform Stats</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Open Disputes */}
      {activeTab === "open" && (
        <div className="space-y-4">
          {openDisputes.length === 0 ? (
            <div className="p-12 text-center rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-center mx-auto text-[#10B981]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-[#F5F5F0] text-sm font-semibold">Zero Pending Disputes</p>
              <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
                All escrow contracts are currently in healthy progression. When a client or contributor triggers arbitration, disputes appear here for review.
              </p>
            </div>
          ) : (
            openDisputes.map((dispute) => {
              const bounty = bountiesMap[dispute.bounty_id];
              return (
                <div
                  key={dispute.id}
                  className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-rose-800/50 hover:border-rose-700/70 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-[#9A9E98]">
                        <span className="text-[#EF4444] font-mono font-semibold uppercase">
                          Disputed Escrow #{dispute.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">Raised on {dispute.created_at}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#F5F5F0] tracking-tight">
                        {bounty ? bounty.title : `Bounty #${dispute.bounty_id}`}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="inline-flex items-baseline gap-1 text-sm font-mono font-bold text-[#C6FF4D] tabular-nums bg-[#191D19] px-3 py-1.5 rounded-md border border-[#2B302B]">
                        <span>{bounty ? bounty.reward.toLocaleString() : "—"}</span>
                        <span className="text-xs text-[#F5F5F0]">ALGO</span>
                      </div>
                    </div>
                  </div>

                  {/* Disputant & Contract Context */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 sm:p-3.5 rounded-md bg-[#191D19] border border-[#2B302B]">
                      <span className="text-[#6B7068] block text-[10px] uppercase font-mono mb-0.5">Poster:</span>
                      <span className="font-semibold text-[#F5F5F0] break-all">
                        {bounty?.poster_name} ({bounty?.poster_email})
                      </span>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-md bg-[#191D19] border border-[#2B302B]">
                      <span className="text-[#6B7068] block text-[10px] uppercase font-mono mb-0.5">Assigned Contributor:</span>
                      <span className="font-semibold text-[#F5F5F0] break-all">
                        {bounty?.worker_name || bounty?.assigned_worker} ({bounty?.worker_email || "N/A"})
                      </span>
                    </div>
                  </div>

                  {/* Grievance & Evidence */}
                  <div className="p-4 rounded-md bg-[#191D19] border border-[#2B302B] space-y-2 text-xs">
                    <div>
                      <span className="text-[#9A9E98] font-medium">Dispute Raised By:</span>{" "}
                      <span className="text-[#F5F5F0] font-mono break-all">{dispute.raised_by}</span>
                    </div>
                    <div>
                      <span className="text-[#9A9E98] font-medium">Grievance / Claim:</span>
                      <p className="text-[#F5F5F0] mt-1 whitespace-pre-wrap leading-relaxed">{dispute.reason}</p>
                    </div>
                    {dispute.evidence && (
                      <div>
                        <span className="text-[#9A9E98] font-medium">Evidence Submitted:</span>
                        <p className="text-[#C6FF4D] font-mono mt-1 break-all select-all">{dispute.evidence}</p>
                      </div>
                    )}
                  </div>

                  {/* Judicial Action Buttons */}
                  <div className="pt-3 border-t border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-[#6B7068] text-[11px] font-mono">
                      Execute binding on-chain settlement to finalize the escrow.
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          if (bounty) {
                            setConfirmModal({ dispute, decision: "poster", bounty });
                          }
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/60 text-[#EF4444] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                      >
                        Rule for Poster (Refund)
                      </button>

                      <button
                        onClick={() => {
                          if (bounty) {
                            setConfirmModal({ dispute, decision: "worker", bounty });
                          }
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-white font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                      >
                        Rule for Worker (Release Escrow)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Resolved History */}
      {activeTab === "history" && (
        <div className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-[#2B302B] space-y-4">
          <h2 className="text-xl font-bold text-[#F5F5F0]">Arbitration Settlement Archive</h2>
          <p className="text-xs text-[#9A9E98]">
            Immutable record of all judicial rulings, decisions, and transaction hashes.
          </p>

          {resolvedDisputes.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-[#191D19]/40 border border-[#2B302B] space-y-2">
              <FolderCheck className="w-8 h-8 text-[#6B7068] mx-auto" />
              <p className="text-[#F5F5F0] text-xs font-semibold">No disputes have been settled yet</p>
              <p className="text-[11px] text-[#9A9E98]">Resolved cases will appear in this ledger once adjudicated.</p>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {resolvedDisputes.map((dispute) => {
                const bounty = bountiesMap[dispute.bounty_id];
                const ruledForWorker = dispute.decision === "worker";

                return (
                  <div
                    key={dispute.id}
                    className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-mono font-semibold uppercase text-[11px] ${
                            ruledForWorker ? "text-[#10B981]" : "text-[#EF4444]"
                          }`}
                        >
                          Ruled for: {dispute.decision}
                        </span>
                        <span aria-hidden="true" className="text-[#6B7068]">·</span>
                        <span className="font-bold text-[#F5F5F0]">
                          {bounty ? bounty.title : `Bounty #${dispute.bounty_id}`}
                        </span>
                      </div>

                      <div className="text-[#9A9E98] text-[11px]">
                        Resolved by: {dispute.resolved_by} · Claim: "{dispute.reason}"
                      </div>

                      {dispute.resolve_txn_id && (
                        <div className="text-[11px] font-mono text-[#C6FF4D] break-all">
                          TxID: {dispute.resolve_txn_id}
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="font-bold text-[#F5F5F0] font-mono tabular-nums">
                        {bounty ? `${bounty.reward.toLocaleString()} ALGO` : "Escrow"}
                      </div>
                      <div className="text-[10px] text-[#6B7068]">{dispute.created_at}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Platform Stats */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          {/* Resolution Rate Progress */}
          <div className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#F5F5F0] uppercase">Dispute Resolution Rate</span>
              <span className="font-bold text-[#C6FF4D]">{resolutionPercentage}%</span>
            </div>
            <div className="w-full bg-[#191D19] rounded-full h-2 overflow-hidden border border-[#2B302B]">
              <div
                className="bg-[#C6FF4D] h-full rounded-full transition-all duration-500"
                style={{ width: `${resolutionPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#9A9E98]">
              Resolved {resolvedDisputes.length} out of {totalDisputesCount} recorded disputes.
            </p>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Registered Accounts</div>
              <div className="text-2xl font-bold text-[#F5F5F0] font-mono tabular-nums">{stats.users}</div>
            </div>

            <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Total Bounties</div>
              <div className="text-2xl font-bold text-[#F5F5F0] font-mono tabular-nums">{stats.bounties.total}</div>
            </div>

            <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Escrow Volume</div>
              <div className="text-2xl font-bold text-[#C6FF4D] font-mono tabular-nums">
                {stats.transactions.volume.toLocaleString()} ALGO
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-[#10B981] font-mono tabular-nums">{stats.transactions.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* Irreversible Confirmation Modal */}
      {confirmModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!resolving) setConfirmModal(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-rose-800/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-[#F5F5F0]">Irreversible Judicial Ruling</h3>
            </div>

            <div className="text-xs text-[#9A9E98] space-y-2 leading-relaxed">
              <p>
                You are about to execute a binding on-chain settlement for{" "}
                <strong className="text-[#F5F5F0]">"{confirmModal.bounty.title}"</strong>.
              </p>
              <div className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] space-y-1 font-mono text-[11px]">
                <div>Decision: <strong className="text-[#F5F5F0] uppercase">{confirmModal.decision}</strong></div>
                <div>Escrow Amount: <strong className="text-[#C6FF4D]">{confirmModal.bounty.reward.toLocaleString()} ALGO</strong></div>
                <div>
                  Action: {confirmModal.decision === "worker" ? "Release full reward to contributor" : "Refund full reward to client"}
                </div>
              </div>
              <p className="text-[#6B7068] text-[11px]">
                This action commits directly to the Algorand ledger and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B302B] text-xs">
              <button
                type="button"
                disabled={resolving}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={executeResolution}
                className="px-4 py-2 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting Settlement...</span>
                  </>
                ) : (
                  <span>Confirm & Execute Ruling</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
