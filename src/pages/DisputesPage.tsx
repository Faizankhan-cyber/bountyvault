import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Dispute, Bounty } from "../types";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  User,
  X
} from "lucide-react";

interface DisputesPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DisputesPage: React.FC<DisputesPageProps> = ({ onNavigate }) => {
  const { user, role, isAuthenticated } = useAuth();
  const { address, sendPayment } = useWallet();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [bountiesMap, setBountiesMap] = useState<Record<number, Bounty>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  // Resolution confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    dispute: Dispute;
    decision: "worker" | "poster";
    bounty?: Bounty;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allDisputes, allBounties] = await Promise.all([
        api.getDisputes().catch(() => []),
        api.getBounties().catch(() => []),
      ]);
      setDisputes(allDisputes);

      const bMap: Record<number, Bounty> = {};
      allBounties.forEach((b) => {
        bMap[b.id] = b;
      });
      setBountiesMap(bMap);
    } catch (err: any) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleExecuteResolution = async () => {
    if (!confirmModal || !user) return;
    setActionLoading(true);

    try {
      const { dispute, decision, bounty } = confirmModal;
      const recipient = decision === "worker"
        ? (bounty?.worker_address || "ALGO-TESTNET-WORKER")
        : "ALGO-TESTNET-POSTER-REFUND";
      const reward = bounty?.reward || 10;

      const txnId = await sendPayment(recipient, reward);

      await api.resolveDispute(dispute.bounty_id, {
        decision,
        txn_id: txnId,
        resolved_by: user.email,
        resolver_wallet: address || undefined,
      });

      showNotice(`Dispute resolved in favor of ${decision}. Escrow payout executed.`);
      setConfirmModal(null);
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to resolve dispute.", true);
    } finally {
      setActionLoading(false);
    }
  };

  const openDisputes = disputes.filter((d) => d.status === "open");
  const resolvedDisputes = disputes.filter((d) => d.status === "resolved");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notice */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-lg ${
            notice.isError
              ? "bg-rose-950/40 border border-rose-800/50 text-rose-300"
              : "bg-emerald-950/40 border border-emerald-800/50 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="font-semibold text-xs ml-3">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#2B302B] pb-6">
        <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5" />
          <span>Decentralized Arbitration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
          Dispute Management & Transparency
        </h1>
        <p className="text-xs sm:text-sm text-[#9A9E98] mt-1 max-w-xl">
          When work deliverables are contested, escrow funds are frozen until an impartial arbitrator examines verified repository evidence and executes an on-chain settlement.
        </p>
      </div>

      {/* Arbitrator Authority Alert */}
      {role === "arbitrator" ? (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>You are authenticated with Arbitrator authority to resolve contested escrow milestones.</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/50">
            Admin Console
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#141715] border border-[#2B302B] text-xs text-[#9A9E98] flex items-center justify-between">
          <span>
            Viewing transparent public dispute audit records. Only designated arbitrator accounts can issue verdicts.
          </span>
          {!isAuthenticated && (
            <button onClick={() => onNavigate("login")} className="text-[#C6FF4D] font-semibold hover:underline">
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Active Disputes & History */}
      <div className="space-y-8">
        
        {/* Open Disputes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <span>Active Contested Bounties ({openDisputes.length})</span>
          </h2>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#9A9E98]">
              <Loader2 className="w-6 h-6 animate-spin text-[#C6FF4D] mx-auto mb-2" />
              Loading open disputes...
            </div>
          ) : openDisputes.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
              <h3 className="text-base font-bold text-[#F5F5F0]">Zero Open Disputes</h3>
              <p className="text-xs text-[#9A9E98]">
                All active smart escrow agreements are in good standing without unresolved disputes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {openDisputes.map((d) => {
                const b = bountiesMap[d.bounty_id];
                return (
                  <div
                    key={d.id}
                    className="bg-[#141715] border border-rose-900/40 rounded-xl p-5 space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/40 text-[#EF4444] border border-rose-800/40">
                            FROZEN IN DISPUTE
                          </span>
                          <span className="text-xs text-[#6B7068] font-mono">Bounty #{d.bounty_id}</span>
                        </div>
                        <h3 className="font-bold text-base text-[#F5F5F0]">
                          {b?.title || `Contested Bounty #${d.bounty_id}`}
                        </h3>
                      </div>
                      <div className="font-mono font-bold text-[#C6FF4D] text-lg">
                        {b?.reward || "0"} ALGO
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs">
                      <div>
                        <span className="text-[#6B7068]">Raised By:</span>{" "}
                        <strong className="text-[#F5F5F0] font-mono">{d.raised_by}</strong>
                      </div>
                      <div>
                        <span className="text-[#6B7068]">Contested Reason:</span>{" "}
                        <span className="text-[#9A9E98]">{d.reason}</span>
                      </div>
                      {d.evidence && (
                        <div>
                          <span className="text-[#6B7068]">Submitted Evidence:</span>{" "}
                          <span className="text-[#C6FF4D] font-mono break-all">{d.evidence}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => onNavigate("bounty-detail", String(d.bounty_id))}
                        className="text-xs text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1 font-medium"
                      >
                        <span>Inspect Bounty Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {role === "arbitrator" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmModal({ dispute: d, decision: "worker", bounty: b })}
                            className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs transition-colors"
                          >
                            Award to Contributor
                          </button>
                          <button
                            onClick={() => setConfirmModal({ dispute: d, decision: "poster", bounty: b })}
                            className="px-4 py-2 rounded-lg bg-[#191D19] hover:bg-amber-950/30 border border-amber-600 text-amber-400 font-semibold text-xs transition-colors"
                          >
                            Refund to Poster
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historical Resolved Disputes */}
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C6FF4D]" />
            <span>Arbitration Resolution History ({resolvedDisputes.length})</span>
          </h2>

          {resolvedDisputes.length === 0 ? (
            <p className="text-xs text-[#6B7068]">No historical dispute rulings recorded.</p>
          ) : (
            <div className="space-y-3">
              {resolvedDisputes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-[#141715] border border-[#2B302B] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#C6FF4D]">Dispute #{d.id}</span>
                      <span className="text-[#6B7068]">·</span>
                      <span className="text-[#F5F5F0] font-semibold">Bounty #{d.bounty_id}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/30 text-[#10B981] border border-emerald-800/40 text-[10px] font-mono font-bold">
                      RESOLVED IN FAVOR OF {d.decision?.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[#9A9E98] leading-relaxed">{d.reason}</p>

                  <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-[#6B7068] font-mono">
                    <span>Arbitrated by: {d.resolved_by || "System Arbitrator"}</span>
                    {d.resolve_txn_id && (
                      <span className="truncate max-w-[200px]">Txn: {d.resolve_txn_id}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#C6FF4D]">
              <Scale className="w-5 h-5" />
              <h3 className="font-bold text-base text-[#F5F5F0]">Execute Arbitrator Verdict</h3>
            </div>

            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Confirm resolution in favor of <strong className="text-[#F5F5F0] uppercase">{confirmModal.decision}</strong>. 
              This will trigger smart contract payment release of {confirmModal.bounty?.reward || "escrow"} ALGO. This action cannot be revoked.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-[#9A9E98] hover:text-[#F5F5F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteResolution}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs"
              >
                {actionLoading ? "Executing Verdict..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
