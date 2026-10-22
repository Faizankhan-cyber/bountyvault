import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { api } from "../services/api";
import { Bounty, Applicant, Transaction, BountyStatus } from "../types";
import { 
  PlusCircle, 
  FolderKanban, 
  History, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  X,
  Lock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileQuestion
} from "lucide-react";

export const PosterDashboard: React.FC = () => {
  const { user } = useAuth();
  const { address, sendPayment } = useWallet();

  const [activeTab, setActiveTab] = useState<"my" | "new" | "tx">("my");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // New bounty form
  const [newBounty, setNewBounty] = useState({
    title: "",
    description: "",
    reward: "100",
    category: "Development",
    deadline: "",
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Applicants viewer per bounty
  const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
  const [applicantsMap, setApplicantsMap] = useState<Record<number, Applicant[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState<number | null>(null);

  // Dispute modal
  const [disputingBounty, setDisputingBounty] = useState<Bounty | null>(null);
  const [disputeForm, setDisputeForm] = useState({ reason: "", evidence: "" });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // In-app confirmation dialog for financial/destructive actions
  const [confirmAction, setConfirmAction] = useState<{
    type: "complete" | "cancel";
    bounty: Bounty;
  } | null>(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  // Toast / notification
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Keyboard navigation & escape listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmAction && !confirmSubmitting) setConfirmAction(null);
        if (disputingBounty && !disputeSubmitting) setDisputingBounty(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmAction, confirmSubmitting, disputingBounty, disputeSubmitting]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allBounties, allTx] = await Promise.all([
        api.getBounties(),
        api.getTransactions(),
      ]);

      const myBounties = allBounties.filter(
        (b) => b.poster_email.toLowerCase() === user.email.toLowerCase()
      );
      setBounties(myBounties);

      const myBountyIds = new Set(myBounties.map((b) => b.id));
      const myTxs = allTx.filter((t) => myBountyIds.has(t.bounty_id));
      setTransactions(myTxs);
    } catch (err: any) {
      showNotice(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const rewardNum = parseFloat(newBounty.reward);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      showNotice("Reward must be a positive number", "error");
      return;
    }

    setCreateSubmitting(true);
    try {
      await api.createBounty({
        poster_name: user.name,
        poster_email: user.email,
        title: newBounty.title,
        description: newBounty.description,
        reward: rewardNum,
        category: newBounty.category,
        deadline: newBounty.deadline,
      });

      showNotice(`Bounty "${newBounty.title}" created with ${rewardNum} ALGO escrow!`);
      setNewBounty({
        title: "",
        description: "",
        reward: "100",
        category: "Development",
        deadline: "",
      });
      setActiveTab("my");
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to create bounty", "error");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const toggleApplicants = async (bountyId: number) => {
    if (expandedBountyId === bountyId) {
      setExpandedBountyId(null);
      return;
    }

    setExpandedBountyId(bountyId);
    if (!applicantsMap[bountyId]) {
      setLoadingApplicants(bountyId);
      try {
        const list = await api.getApplicants(bountyId);
        setApplicantsMap((prev) => ({ ...prev, [bountyId]: list }));
      } catch (err: any) {
        showNotice(err.message || "Failed to fetch applicants", "error");
      } finally {
        setLoadingApplicants(null);
      }
    }
  };

  const handleSelectWorker = async (bountyId: number, workerEmail: string) => {
    try {
      await api.selectApplicant(bountyId, workerEmail);
      showNotice("Contributor selected! Escrow moved to in-progress status.");
      loadData();
      const updatedList = await api.getApplicants(bountyId);
      setApplicantsMap((prev) => ({ ...prev, [bountyId]: updatedList }));
    } catch (err: any) {
      showNotice(err.message || "Failed to select worker", "error");
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirmSubmitting(true);
    try {
      if (confirmAction.type === "complete") {
        const { bounty } = confirmAction;
        const recipient = bounty.worker_address || "ALGO-TESTNET-RECIPIENT-ADDR";
        const txnId = await sendPayment(recipient, bounty.reward);
        await api.completeBounty(bounty.id, txnId);
        showNotice(`Escrow released successfully to ${bounty.worker_name || "contributor"}. TxID: ${txnId}`);
      } else {
        await api.cancelBounty(confirmAction.bounty.id);
        showNotice(`Bounty cancelled and ${confirmAction.bounty.reward} ALGO escrow refunded.`);
      }
      setConfirmAction(null);
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Action failed to execute", "error");
    } finally {
      setConfirmSubmitting(false);
    }
  };

  const handleRaiseDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingBounty || !user) return;

    setDisputeSubmitting(true);
    try {
      await api.raiseDispute(disputingBounty.id, {
        raised_by: user.email,
        reason: disputeForm.reason,
        evidence: disputeForm.evidence,
      });

      showNotice("Dispute escalated to neutral Arbitrator Review.");
      setDisputingBounty(null);
      setDisputeForm({ reason: "", evidence: "" });
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to raise dispute", "error");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const getStatusBadge = (status: BountyStatus) => {
    switch (status) {
      case "open":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#2B302B] bg-[#191D19] text-[#C6FF4D] uppercase">Open</span>;
      case "acquired":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-sky-800/40 bg-sky-950/30 text-sky-400 uppercase">In Progress</span>;
      case "completed":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800/40 bg-emerald-950/30 text-[#10B981] uppercase">Completed</span>;
      case "disputed":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-800/40 bg-rose-950/30 text-[#EF4444] uppercase">Disputed</span>;
      case "cancelled":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#2B302B] bg-[#141715] text-[#9A9E98] uppercase">Cancelled</span>;
      default:
        return <span className="text-[10px] font-mono text-[#9A9E98] uppercase">{status}</span>;
    }
  };

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
            aria-label="Dismiss notification"
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
            <span>POSTER MANAGEMENT CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F0] tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs text-[#9A9E98] mt-0.5 truncate max-w-sm sm:max-w-md font-mono">
            Client Account: <span className="text-[#F5F5F0]">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs text-[#F5F5F0] transition-colors self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C6FF4D]" : ""}`} />
          <span>{loading ? "Syncing..." : "Refresh Console"}</span>
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="overflow-x-auto pb-1 -mb-1">
        <div className="inline-flex min-w-full sm:min-w-0 sm:flex gap-1 p-1 rounded-lg bg-[#141715] border border-[#2B302B] text-xs font-semibold sm:max-w-md">
          <button
            onClick={() => setActiveTab("my")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "my" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 shrink-0" />
            <span>My Bounties ({bounties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "new" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Post Bounty</span>
          </button>

          <button
            onClick={() => setActiveTab("tx")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "tx" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>Transactions ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: My Bounties */}
      {activeTab === "my" && (
        <div className="space-y-4">
          {bounties.length === 0 ? (
            <div className="p-12 text-center rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#C6FF4D]">
                <FolderKanban className="w-6 h-6" />
              </div>
              <p className="text-[#F5F5F0] text-sm font-semibold">No bounties created yet</p>
              <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
                Deploy your first task to smart escrow to start receiving candidate contributor proposals.
              </p>
              <div>
                <button
                  onClick={() => setActiveTab("new")}
                  className="mt-1 px-4 py-2 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Create Your First Bounty
                </button>
              </div>
            </div>
          ) : (
            bounties.map((b) => (
              <div
                key={b.id}
                className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-[#9A9E98]">
                      <span className="font-mono text-[#6B7068]">#BV-{b.id.toString().padStart(4, "0")}</span>
                      <span>·</span>
                      <span>{b.category || "General"}</span>
                      <span>·</span>
                      <span>{getStatusBadge(b.status)}</span>
                      {b.deadline && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-[#6B7068]" /> Due {b.deadline}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#F5F5F0] tracking-tight">{b.title}</h3>
                    <p className="text-xs text-[#9A9E98] mt-1 max-w-3xl leading-relaxed whitespace-pre-line">
                      {b.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="inline-flex items-baseline gap-1 text-sm font-mono font-bold text-[#C6FF4D] tabular-nums bg-[#191D19] px-3 py-1.5 rounded-md border border-[#2B302B]">
                      <span>{b.reward.toLocaleString()}</span>
                      <span className="text-xs text-[#F5F5F0]">ALGO</span>
                    </div>
                  </div>
                </div>

                {/* Worker Assignment Info */}
                {b.worker_name && (
                  <div className="p-3 sm:p-3.5 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span className="text-[#9A9E98]">Assigned Contributor:</span>
                      <span className="font-semibold text-[#F5F5F0]">{b.worker_name} ({b.worker_email})</span>
                    </div>
                    {b.worker_address && (
                      <span className="font-mono text-[#9A9E98] text-[11px] truncate max-w-xs">
                        Wallet: {b.worker_address}
                      </span>
                    )}
                  </div>
                )}

                {/* Dispute / Completion Status */}
                {b.status === "disputed" && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-[#EF4444] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Case under neutral Arbitrator Review. Binding settlement will be recorded on-chain.</span>
                  </div>
                )}

                {b.status === "completed" && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-[#10B981] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Bounty completed and funds settled to contributor.</span>
                    </div>
                    {b.txn_id && (
                      <span className="font-mono text-[11px] text-[#F5F5F0] break-all">
                        TxID: {b.txn_id}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2B302B] text-xs">
                  {b.status === "open" && (
                    <>
                      <button
                        onClick={() => toggleApplicants(b.id)}
                        className="px-3.5 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#F5F5F0] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                      >
                        {expandedBountyId === b.id ? "Hide Proposals" : "View Proposals"}
                      </button>
                      <button
                        onClick={() => setConfirmAction({ type: "cancel", bounty: b })}
                        className="px-3.5 py-1.5 rounded-md bg-rose-950/30 hover:bg-rose-950/50 text-[#EF4444] border border-rose-900/40 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                      >
                        Cancel Bounty
                      </button>
                    </>
                  )}

                  {b.status === "acquired" && (
                    <>
                      <button
                        onClick={() => setConfirmAction({ type: "complete", bounty: b })}
                        className="px-4 py-1.5 rounded-md bg-[#10B981] hover:bg-[#059669] text-white font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Release Escrow & Settle</span>
                      </button>
                      <button
                        onClick={() => setDisputingBounty(b)}
                        className="px-3.5 py-1.5 rounded-md bg-rose-950/30 hover:bg-rose-950/50 text-[#EF4444] border border-rose-900/40 font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Raise Dispute</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Expandable Applicants List */}
                {expandedBountyId === b.id && (
                  <div className="p-4 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-3 mt-3">
                    <h4 className="text-xs uppercase font-mono font-bold text-[#6B7068]">
                      Candidate Proposals
                    </h4>

                    {loadingApplicants === b.id ? (
                      <div className="py-3 text-center text-xs text-[#9A9E98] flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6FF4D]" />
                        <span>Loading proposals...</span>
                      </div>
                    ) : !applicantsMap[b.id] || applicantsMap[b.id].length === 0 ? (
                      <div className="py-3 text-center text-xs text-[#9A9E98]">No proposals submitted yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {applicantsMap[b.id].map((app) => (
                          <div
                            key={app.id}
                            className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#F5F5F0]">{app.worker_name}</span>
                                <span className="text-[#9A9E98] text-[11px]">({app.worker_email})</span>
                              </div>
                              <div className="text-[#C6FF4D]">Skills: {app.worker_skills}</div>
                              <div className="text-[#9A9E98] italic">"{app.worker_reason}"</div>
                              {app.wallet_address && (
                                <div className="text-[11px] font-mono text-[#6B7068] break-all">
                                  Payout Wallet: {app.wallet_address}
                                </div>
                              )}
                            </div>

                            {b.status === "open" && app.status === "pending" && (
                              <button
                                onClick={() => handleSelectWorker(b.id, app.worker_email)}
                                className="shrink-0 px-3.5 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                              >
                                Select Worker
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Post New Bounty */}
      {activeTab === "new" && (
        <div className="p-6 rounded-lg bg-[#141715] border border-[#2B302B] max-w-2xl space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#F5F5F0]">Fund & Deploy New Escrow</h2>
            <p className="text-xs text-[#9A9E98] mt-1">
              Specify your project criteria and allocate ALGO rewards. Funds remain locked until you approve the deliverable.
            </p>
          </div>

          <form onSubmit={handleCreateBounty} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#9A9E98] font-medium">Bounty Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Implement ARC-56 Type-Safe Client"
                value={newBounty.title}
                onChange={(e) => setNewBounty({ ...newBounty, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#9A9E98] font-medium">Scope & Deliverables</label>
              <textarea
                required
                rows={4}
                placeholder="Detail technical requirements, repo expectations, test cases, and documentation criteria..."
                value={newBounty.description}
                onChange={(e) => setNewBounty({ ...newBounty, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Reward (ALGO)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={newBounty.reward}
                  onChange={(e) => setNewBounty({ ...newBounty, reward: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Category</label>
                <select
                  value={newBounty.category}
                  onChange={(e) => setNewBounty({ ...newBounty, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Smart Contracts">Smart Contracts</option>
                  <option value="Writing">Writing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={newBounty.deadline}
                  onChange={(e) => setNewBounty({ ...newBounty, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={createSubmitting}
                className="w-full py-2.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                {createSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locking Escrow on-chain...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Lock Escrow & Deploy Task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === "tx" && (
        <div className="p-6 rounded-lg bg-[#141715] border border-[#2B302B] space-y-4">
          <h2 className="text-xl font-bold text-[#F5F5F0]">Escrow Settlement Ledger</h2>
          <p className="text-xs text-[#9A9E98]">
            Immutable log of state transitions and payments associated with your tasks.
          </p>

          {transactions.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-[#191D19]/40 border border-[#2B302B] space-y-2">
              <FileQuestion className="w-8 h-8 text-[#6B7068] mx-auto" />
              <p className="text-[#F5F5F0] text-xs font-semibold">No transactions recorded yet</p>
              <p className="text-[11px] text-[#9A9E98]">
                Transactions appear here as escrows are funded, modified, and released.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase text-[#C6FF4D]">
                        {tx.event_type}
                      </span>
                      <span className="text-[#F5F5F0] font-medium">{tx.description}</span>
                    </div>
                    {tx.txn_id && (
                      <div className="text-[11px] font-mono text-[#6B7068] break-all">
                        TxID: {tx.txn_id}
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="font-bold text-[#F5F5F0] font-mono tabular-nums">{tx.amount} ALGO</div>
                    <div className="text-[10px] text-[#6B7068]">{tx.created_at}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Accessible Confirmation Dialog */}
      {confirmAction && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!confirmSubmitting) setConfirmAction(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${
                confirmAction.type === "complete" 
                  ? "bg-emerald-950/40 text-[#10B981] border border-emerald-800/50" 
                  : "bg-rose-950/40 text-[#EF4444] border border-rose-800/50"
              }`}>
                {confirmAction.type === "complete" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#F5F5F0]">
                  {confirmAction.type === "complete" ? "Authorize Escrow Release" : "Cancel Bounty & Refund Escrow"}
                </h3>
                <p className="text-xs text-[#9A9E98] mt-0.5">
                  {confirmAction.type === "complete" 
                    ? "Verify deliverable approval before broadcasting the final payout on Algorand."
                    : "Cancelling will close this bounty to applicants and refund the locked escrow balance."}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#9A9E98]">
                <span>Bounty Title:</span>
                <span className="text-[#F5F5F0] font-medium text-right max-w-[200px] truncate">{confirmAction.bounty.title}</span>
              </div>
              <div className="flex justify-between items-center text-[#9A9E98]">
                <span>Escrow Reward:</span>
                <span className="text-[#C6FF4D] font-mono font-bold">{confirmAction.bounty.reward.toLocaleString()} ALGO</span>
              </div>
              {confirmAction.type === "complete" && (
                <div className="flex justify-between items-center text-[#9A9E98]">
                  <span>Recipient Contributor:</span>
                  <span className="text-[#F5F5F0] font-medium">{confirmAction.bounty.worker_name || confirmAction.bounty.assigned_worker}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 text-xs">
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Keep Bounty
              </button>
              <button
                type="button"
                disabled={confirmSubmitting}
                onClick={executeConfirmAction}
                className={`px-4 py-2 rounded-md font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                  confirmAction.type === "complete"
                    ? "bg-[#10B981] hover:bg-[#059669] text-white focus-visible:ring-[#10B981]"
                    : "bg-[#EF4444] hover:bg-[#DC2626] text-white focus-visible:ring-[#EF4444]"
                }`}
              >
                {confirmSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing on-chain...</span>
                  </>
                ) : (
                  <span>
                    {confirmAction.type === "complete" ? "Confirm & Release Escrow" : "Confirm Cancellation"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputingBounty && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!disputeSubmitting) setDisputingBounty(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-rose-800/60 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-mono font-bold text-[#EF4444]">Escrow Dispute Request</span>
                <h2 className="text-base font-bold text-[#F5F5F0] mt-0.5">Dispute: {disputingBounty.title}</h2>
              </div>
              <button
                onClick={() => setDisputingBounty(null)}
                className="p-1 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                aria-label="Close dispute modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseDisputeSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Reason for Dispute</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail why the submission failed agreed requirements or timeline expectations..."
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Evidence / Verification Links (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub commit hash, PR link, or screenshot URLs"
                  value={disputeForm.evidence}
                  onChange={(e) => setDisputeForm({ ...disputeForm, evidence: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={disputeSubmitting}
                  onClick={() => setDisputingBounty(null)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="px-4 py-2 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                >
                  {disputeSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Submit to Arbitrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
