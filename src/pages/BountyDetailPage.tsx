import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Bounty, Applicant, Transaction, Dispute } from "../types";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { StatusBadge } from "../components/StatusBadge";
import { ApplyModal } from "../components/ApplyModal";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Mail, 
  Wallet, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Copy,
  ChevronRight,
  Scale,
  Send,
  X
} from "lucide-react";

interface BountyDetailPageProps {
  bountyId: string | number;
  onNavigate: (view: string, param?: string) => void;
}

export const BountyDetailPage: React.FC<BountyDetailPageProps> = ({ bountyId, onNavigate }) => {
  const { user, isAuthenticated, role } = useAuth();
  const { address, sendPayment } = useWallet();

  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & form states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ reason: "", evidence: "" });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Resolution modal for arbitrator
  const [resolvingModal, setResolvingModal] = useState<"worker" | "poster" | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);

  const idNum = Number(bountyId);

  const loadBountyData = async () => {
    if (!idNum || Number.isNaN(idNum)) {
      setError("Invalid bounty identifier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch bounty details
      const b = await api.getBounty(idNum).catch(async () => {
        // Fallback: search in getBounties list
        const list = await api.getBounties();
        const found = list.find((item) => item.id === idNum);
        if (!found) throw new Error("Bounty not found.");
        return found;
      });
      setBounty(b);

      // Fetch applicants and transactions in parallel
      const [apps, allTx] = await Promise.all([
        api.getApplicants(idNum).catch(() => []),
        api.getTransactions().catch(() => []),
      ]);
      setApplicants(apps);
      setTransactions(allTx.filter((t) => t.bounty_id === idNum));
    } catch (err: any) {
      setError(err.message || "Failed to load bounty data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBountyData();
  }, [bountyId]);

  const showNotification = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 5000);
  };

  // Actions
  const handleSelectApplicant = async (applicant: Applicant) => {
    if (!bounty) return;
    setActionSubmitting(true);
    try {
      await api.selectApplicant(bounty.id, applicant.worker_email);
      showNotification(`Worker ${applicant.worker_name} selected for bounty! Escrow locked in progress.`);
      loadBountyData();
    } catch (err: any) {
      showNotification(err.message || "Failed to select applicant.", true);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCompleteBounty = async () => {
    if (!bounty) return;
    setActionSubmitting(true);
    try {
      // Execute payment via Algorand wallet if connected or fallback hash
      const recipient = bounty.worker_address || "ALGO-TESTNET-WORKER";
      const txnId = await sendPayment(recipient, bounty.reward);
      await api.completeBounty(bounty.id, txnId);
      showNotification(`Bounty completed and ${bounty.reward} ALGO escrow released!`);
      loadBountyData();
    } catch (err: any) {
      showNotification(err.message || "Failed to complete bounty.", true);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleCancelBounty = async () => {
    if (!bounty) return;
    if (!confirm("Are you sure you want to cancel this bounty and refund the escrow to poster?")) return;
    setActionSubmitting(true);
    try {
      await api.cancelBounty(bounty.id);
      showNotification("Bounty cancelled and escrow funds refunded.");
      loadBountyData();
    } catch (err: any) {
      showNotification(err.message || "Failed to cancel bounty.", true);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bounty || !user) return;
    if (!disputeForm.reason.trim()) {
      showNotification("Please provide a dispute justification.", true);
      return;
    }

    setDisputeSubmitting(true);
    try {
      await api.raiseDispute(bounty.id, {
        raised_by: user.email,
        reason: disputeForm.reason.trim(),
        evidence: disputeForm.evidence.trim() || undefined,
      });
      showNotification("Dispute officially filed. Smart contract escrow frozen pending arbitration.");
      setDisputeModalOpen(false);
      loadBountyData();
    } catch (err: any) {
      showNotification(err.message || "Failed to raise dispute.", true);
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleArbitratorResolve = async (decision: "worker" | "poster") => {
    if (!bounty || !user) return;
    setActionSubmitting(true);
    try {
      const recipient = decision === "worker"
        ? (bounty.worker_address || "ALGO-TESTNET-WORKER")
        : "ALGO-TESTNET-POSTER-REFUND";
      const txnId = await sendPayment(recipient, bounty.reward);

      await api.resolveDispute(bounty.id, {
        decision,
        txn_id: txnId,
        resolved_by: user.email,
        resolver_wallet: address || undefined,
      });

      showNotification(`Dispute resolved in favor of ${decision}. Escrow settlement executed.`);
      setResolvingModal(null);
      loadBountyData();
    } catch (err: any) {
      showNotification(err.message || "Failed to resolve dispute.", true);
    } finally {
      setActionSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6FF4D] mx-auto" />
        <p className="text-xs text-[#9A9E98]">Retrieving bounty contract state and escrow ledger...</p>
      </div>
    );
  }

  if (error || !bounty) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        <button
          onClick={() => onNavigate("marketplace")}
          className="text-xs text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <div className="p-8 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#EF4444] mx-auto" />
          <h2 className="text-lg font-bold text-[#F5F5F0]">Bounty Not Found</h2>
          <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">{error || "Requested bounty does not exist or was removed."}</p>
          <button
            onClick={() => onNavigate("marketplace")}
            className="px-4 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
          >
            Explore Available Bounties
          </button>
        </div>
      </div>
    );
  }

  const isPoster = user?.email.toLowerCase() === bounty.poster_email.toLowerCase();
  const isAssignedWorker = bounty.assigned_worker && user?.email.toLowerCase() === bounty.assigned_worker.toLowerCase();
  const isArbitrator = role === "arbitrator";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
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
            {notice.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="font-semibold text-xs ml-3">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#9A9E98]">
        <button onClick={() => onNavigate("home")} className="hover:text-[#F5F5F0]">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7068]" />
        <button onClick={() => onNavigate("marketplace")} className="hover:text-[#F5F5F0]">Marketplace</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7068]" />
        <span className="text-[#F5F5F0] font-mono">Bounty #{bounty.id}</span>
      </div>

      {/* Main Bounty Header Banner */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#C6FF4D]">
                {bounty.category || "General"}
              </span>
              <StatusBadge status={bounty.status} />
              <span className="text-[11px] font-mono text-[#6B7068]">
                Created {new Date(bounty.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight leading-snug">
              {bounty.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#9A9E98]">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6B7068]" />
                <span>Posted by <strong className="text-[#F5F5F0]">{bounty.poster_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#6B7068]" />
                <span className="font-mono">{bounty.poster_email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6B7068]" />
                <span>Deadline: <strong className="text-[#F5F5F0]">{bounty.deadline || "Open"}</strong></span>
              </div>
            </div>
          </div>

          {/* Escrow Reward Display Card */}
          <div className="bg-[#0B0D0C] border border-[#2B302B] rounded-xl p-5 min-w-[220px] text-center md:text-right space-y-1 shrink-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6B7068]">
              Locked Escrow
            </div>
            <div className="text-3xl font-bold font-mono text-[#C6FF4D]">
              {bounty.reward} <span className="text-base text-[#9A9E98]">ALGO</span>
            </div>
            <div className="text-[10px] font-mono text-[#10B981] flex items-center justify-center md:justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span>100% Cryptographically Secured</span>
            </div>
          </div>
        </div>

        {/* Action Bar for Current User */}
        <div className="pt-6 border-t border-[#2B302B] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#9A9E98]">
            {isPoster && <span className="text-[#C6FF4D] font-medium">You are the creator of this bounty escrow.</span>}
            {isAssignedWorker && <span className="text-[#10B981] font-medium">You are the designated contributor assigned to this bounty.</span>}
            {!isPoster && !isAssignedWorker && !isArbitrator && (
              <span>Review requirements and submit a proposal below.</span>
            )}
            {isArbitrator && <span className="text-amber-400 font-medium">You are viewing this bounty with Arbitrator Administrative authority.</span>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Open Bounty Actions */}
            {bounty.status === "open" && (
              <>
                {!isPoster && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onNavigate("login");
                      } else {
                        setApplyModalOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors"
                  >
                    Submit Proposal
                  </button>
                )}
                {isPoster && (
                  <button
                    onClick={handleCancelBounty}
                    disabled={actionSubmitting}
                    className="px-4 py-2.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#EF4444] transition-colors"
                  >
                    Cancel Bounty & Refund
                  </button>
                )}
              </>
            )}

            {/* Acquired Bounty Actions */}
            {bounty.status === "acquired" && (
              <>
                {isPoster && (
                  <button
                    onClick={handleCompleteBounty}
                    disabled={actionSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Release Payment</span>
                  </button>
                )}

                {(isPoster || isAssignedWorker) && (
                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="px-4 py-2.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-800/40 text-xs font-semibold text-[#EF4444] transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Raise Escrow Dispute</span>
                  </button>
                )}
              </>
            )}

            {/* Disputed Bounty Actions */}
            {bounty.status === "disputed" && isArbitrator && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResolvingModal("worker")}
                  disabled={actionSubmitting}
                  className="px-4 py-2.5 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs"
                >
                  Arbitrate: Award to Worker
                </button>
                <button
                  onClick={() => setResolvingModal("poster")}
                  disabled={actionSubmitting}
                  className="px-4 py-2.5 rounded-lg bg-[#191D19] border border-amber-600 text-amber-400 font-semibold text-xs"
                >
                  Arbitrate: Refund to Poster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Description, Verification & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Detailed Specification & Applicants */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description Section */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#F5F5F0] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C6FF4D]" />
              <span>Bounty Scope & Deliverable Requirements</span>
            </h2>
            <div className="text-sm text-[#9A9E98] leading-relaxed whitespace-pre-wrap font-normal">
              {bounty.description}
            </div>
          </div>

          {/* Assigned Worker Card if Acquired or Completed */}
          {bounty.assigned_worker && (
            <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-6 space-y-4">
              <h2 className="text-base font-bold text-[#F5F5F0] flex items-center gap-2">
                <User className="w-4 h-4 text-[#10B981]" />
                <span>Assigned Contributor</span>
              </h2>
              <div className="p-4 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#F5F5F0]">{bounty.worker_name || bounty.assigned_worker}</div>
                    <div className="text-xs text-[#6B7068] font-mono">{bounty.worker_email || bounty.assigned_worker}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/30 text-[#10B981] border border-emerald-800/40">
                    VERIFIED CONTRIBUTOR
                  </span>
                </div>
                {bounty.worker_skills && (
                  <div className="text-xs text-[#9A9E98]">
                    <strong className="text-[#F5F5F0]">Skills:</strong> {bounty.worker_skills}
                  </div>
                )}
                {bounty.worker_reason && (
                  <div className="text-xs text-[#9A9E98] bg-[#141715] p-2.5 rounded border border-[#2B302B]">
                    <strong className="text-[#F5F5F0]">Proposal:</strong> {bounty.worker_reason}
                  </div>
                )}
                {bounty.worker_address && (
                  <div className="text-xs text-[#9A9E98] font-mono">
                    <strong className="text-[#F5F5F0]">Payout Address:</strong> {bounty.worker_address}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applicants List (Visible to Poster or open transparency) */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#F5F5F0] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C6FF4D]" />
                <span>Submitted Proposals ({applicants.length})</span>
              </h2>
              {bounty.status === "open" && isPoster && (
                <span className="text-[11px] text-[#C6FF4D] font-mono">Select a worker to lock escrow</span>
              )}
            </div>

            {applicants.length === 0 ? (
              <div className="p-8 rounded-lg bg-[#0B0D0C] border border-[#2B302B] text-center text-xs text-[#6B7068]">
                No applications submitted yet. Be the first contributor to apply!
              </div>
            ) : (
              <div className="space-y-3">
                {applicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-xs text-[#F5F5F0]">{app.worker_name}</div>
                        <div className="text-[11px] text-[#6B7068] font-mono">{app.worker_email}</div>
                      </div>
                      <StatusBadge status={app.status} size="sm" />
                    </div>

                    <div className="text-xs text-[#9A9E98]">
                      <span className="text-[#6B7068] font-mono">Skills:</span> {app.worker_skills}
                    </div>

                    <div className="text-xs text-[#9A9E98] bg-[#141715] p-2.5 rounded border border-[#2B302B] leading-relaxed">
                      {app.worker_reason}
                    </div>

                    {app.wallet_address && (
                      <div className="text-[10px] font-mono text-[#6B7068] truncate">
                        Wallet: {app.wallet_address}
                      </div>
                    )}

                    {isPoster && bounty.status === "open" && app.status === "pending" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleSelectApplicant(app)}
                          disabled={actionSubmitting}
                          className="px-4 py-1.5 rounded bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors"
                        >
                          Select This Contributor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Escrow Smart Contract & Blockchain Verification */}
        <div className="space-y-6">
          
          {/* Smart Contract Specifications */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C6FF4D]" />
              <span>Smart Contract Invariants</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                <span className="text-[10px] text-[#6B7068]">PROTOCOL LEDGER ID</span>
                <div className="text-[#F5F5F0] font-semibold">BOUNTY-ESCROW-#{bounty.id}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                <span className="text-[10px] text-[#6B7068]">NETWORK & COMPILATION</span>
                <div className="text-[#10B981]">Algorand Testnet · TEAL v8</div>
              </div>

              {bounty.txn_id && (
                <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                  <span className="text-[10px] text-[#6B7068]">SETTLEMENT TRANSACTION</span>
                  <div className="text-[#C6FF4D] text-[11px] truncate">{bounty.txn_id}</div>
                  <a
                    href={`https://testnet.explorer.perawallet.app/tx/${bounty.txn_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1 pt-1"
                  >
                    <span>View on Testnet Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#9A9E98] leading-relaxed">
              Algorand provides sub-4-second block finality. Funds held in this escrow can only transition states through authorized actor signatures.
            </div>
          </div>

          {/* Audit & Transaction History */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C6FF4D]" />
              <span>Escrow Event Audit Trail</span>
            </h3>

            {transactions.length === 0 ? (
              <p className="text-xs text-[#6B7068]">No events recorded yet.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase font-bold text-[10px] text-[#C6FF4D]">
                        {tx.event_type}
                      </span>
                      <span className="text-[10px] text-[#6B7068] font-mono">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9A9E98]">{tx.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <ApplyModal
          bounty={bounty}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            showNotification("Your proposal has been submitted!");
            loadBountyData();
          }}
        />
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setDisputeModalOpen(false)}
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#F5F5F0]">Raise Escrow Dispute</h3>
              </div>
              <button onClick={() => setDisputeModalOpen(false)} className="text-[#9A9E98] hover:text-[#F5F5F0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Filing a dispute freezes the {bounty.reward} ALGO escrow. An impartial arbitrator will review submitted work evidence and deliver an on-chain verdict.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F5F5F0] mb-1">Reason for Dispute *</label>
                <textarea
                  required
                  rows={3}
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  placeholder="Explain why the milestone could not be satisfied..."
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] focus:border-[#EF4444] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F5F5F0] mb-1">Evidence / Git Pull Request URL (Optional)</label>
                <input
                  type="text"
                  value={disputeForm.evidence}
                  onChange={(e) => setDisputeForm({ ...disputeForm, evidence: e.target.value })}
                  placeholder="https://github.com/... or commit hash"
                  className="w-full px-3 py-2 bg-[#0B0D0C] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] focus:border-[#EF4444] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[#9A9E98] hover:text-[#F5F5F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#EF4444] hover:bg-rose-600 text-white font-semibold text-xs transition-colors"
                >
                  {disputeSubmitting ? "Filing..." : "Freeze & File Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Arbitrator Confirmation Modal */}
      {resolvingModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setResolvingModal(null)}
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#C6FF4D]">
              <Scale className="w-5 h-5" />
              <h3 className="font-bold text-base text-[#F5F5F0]">Confirm Dispute Arbitration</h3>
            </div>

            <p className="text-xs text-[#9A9E98] leading-relaxed">
              You are about to legally resolve this dispute in favor of{" "}
              <strong className="text-[#F5F5F0] uppercase">{resolvingModal}</strong>. 
              This will execute a {bounty.reward} ALGO settlement payment. This action is irreversible on the Algorand blockchain.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResolvingModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-[#9A9E98] hover:text-[#F5F5F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleArbitratorResolve(resolvingModal)}
                disabled={actionSubmitting}
                className="px-5 py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs"
              >
                {actionSubmitting ? "Executing On-Chain..." : "Confirm & Execute Verdict"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
