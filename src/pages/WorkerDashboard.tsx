import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { api } from "../services/api";
import { Bounty, Applicant, BountyStatus } from "../types";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Coins, 
  FileText, 
  Send, 
  AlertTriangle, 
  RefreshCw, 
  X,
  Search,
  Wallet,
  Loader2,
  Inbox
} from "lucide-react";

interface WorkerDashboardProps {
  onNavigate: (view: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { address, isConnected, connectWallet } = useWallet();

  const [activeTab, setActiveTab] = useState<"applications" | "browse" | "earnings">("applications");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [myApplications, setMyApplications] = useState<{ applicant: Applicant; bounty: Bounty }[]>([]);
  const [loading, setLoading] = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");

  // Apply modal
  const [applyingBounty, setApplyingBounty] = useState<Bounty | null>(null);
  const [applyForm, setApplyForm] = useState({
    worker_skills: "",
    worker_reason: "",
    wallet_address: address || "",
  });
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Dispute modal
  const [disputingBounty, setDisputingBounty] = useState<Bounty | null>(null);
  const [disputeForm, setDisputeForm] = useState({ reason: "", evidence: "" });
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Notice
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  // Keyboard navigation & escape listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (applyingBounty && !applySubmitting) setApplyingBounty(null);
        if (disputingBounty && !disputeSubmitting) setDisputingBounty(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [applyingBounty, applySubmitting, disputingBounty, disputeSubmitting]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allBounties = await api.getBounties();
      setBounties(allBounties);

      const userEmail = user.email.toLowerCase();
      const appPromises = allBounties.map(async (b) => {
        try {
          const apps = await api.getApplicants(b.id);
          const userApp = apps.find((a) => a.worker_email.toLowerCase() === userEmail);
          if (userApp) {
            return { applicant: userApp, bounty: b };
          }
          if (b.assigned_worker && b.assigned_worker.toLowerCase() === userEmail) {
            return {
              applicant: {
                id: 0,
                bounty_id: b.id,
                worker_name: b.worker_name || user.name,
                worker_email: user.email,
                worker_skills: b.worker_skills || "Web3 Contributor",
                worker_reason: b.worker_reason || "Assigned directly",
                wallet_address: b.worker_address || address || null,
                status: (b.status === "open" ? "pending" : "selected") as any,
                created_at: b.created_at,
              },
              bounty: b,
            };
          }
        } catch {
          return null;
        }
        return null;
      });

      const results = (await Promise.all(appPromises)).filter(Boolean) as {
        applicant: Applicant;
        bounty: Bounty;
      }[];

      setMyApplications(results);
    } catch (err: any) {
      showNotice(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (address) {
      setApplyForm((prev) => ({ ...prev, wallet_address: address }));
    }
  }, [address]);

  // Handle Apply
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingBounty || !user) return;

    setApplySubmitting(true);
    try {
      await api.applyToBounty(applyingBounty.id, {
        worker_name: user.name,
        worker_email: user.email,
        worker_skills: applyForm.worker_skills,
        worker_reason: applyForm.worker_reason,
        wallet_address: applyForm.wallet_address || address || undefined,
      });

      showNotice(`Application sent for "${applyingBounty.title}"!`);
      setApplyingBounty(null);
      setApplyForm({ worker_skills: "", worker_reason: "", wallet_address: address || "" });
      setActiveTab("applications");
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to apply", "error");
    } finally {
      setApplySubmitting(false);
    }
  };

  // Handle Worker Dispute
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

      showNotice("Dispute submitted. Neutral arbiter assigned to evaluate contract.");
      setDisputingBounty(null);
      setDisputeForm({ reason: "", evidence: "" });
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to submit dispute", "error");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const completedJobs = myApplications.filter((item) => item.bounty.status === "completed");
  const totalEarned = completedJobs.reduce((sum, item) => sum + item.bounty.reward, 0);

  const activeInFlightJobs = myApplications.filter(
    (item) => item.bounty.status === "acquired" && item.applicant.status === "selected"
  );
  const potentialEarned = activeInFlightJobs.reduce((sum, item) => sum + item.bounty.reward, 0);

  const openBounties = bounties.filter(
    (b) =>
      b.status === "open" &&
      (browseSearch.trim() === "" ||
        b.title.toLowerCase().includes(browseSearch.toLowerCase()) ||
        b.description.toLowerCase().includes(browseSearch.toLowerCase()))
  );

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
            <span>WEB3 CONTRIBUTOR WORKSPACE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F0] tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs text-[#9A9E98] mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
            <span>Wallet Status:</span>
            {isConnected ? (
              <span className="text-[#10B981] break-all">{address}</span>
            ) : (
              <span className="text-[#6B7068]">Disconnected</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {!isConnected && (
            <button
              onClick={() => connectWallet()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-xs text-[#0B0D0C] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C6FF4D]" : ""}`} />
            <span>{loading ? "Syncing..." : "Refresh Workspace"}</span>
          </button>
        </div>
      </div>

      {/* Responsive Segmented Tabs */}
      <div className="overflow-x-auto pb-1 -mb-1">
        <div className="inline-flex min-w-full sm:min-w-0 sm:flex gap-1 p-1 rounded-lg bg-[#141715] border border-[#2B302B] text-xs font-semibold sm:max-w-md">
          <button
            onClick={() => setActiveTab("applications")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "applications" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>My Applications ({myApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("browse")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "browse" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>Browse Bounties ({openBounties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`whitespace-nowrap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              activeTab === "earnings" ? "bg-[#191D19] text-[#C6FF4D] border border-[#2B302B] shadow-sm" : "text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span>Earnings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-12 text-center rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#C6FF4D]">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-[#F5F5F0] text-sm font-semibold">No active applications</p>
              <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
                Explore open bounties across development, smart contracts, and architecture to submit your first proposal.
              </p>
              <div>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="mt-1 px-4 py-2 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Explore Opportunities
                </button>
              </div>
            </div>
          ) : (
            myApplications.map(({ applicant, bounty }) => {
              const isSelected = applicant.status === "selected";
              const isAcquired = bounty.status === "acquired";
              const isCompleted = bounty.status === "completed";
              const isDisputed = bounty.status === "disputed";

              return (
                <div
                  key={`${bounty.id}-${applicant.id}`}
                  className="p-5 sm:p-6 rounded-lg bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-[#9A9E98]">
                        <span className="font-mono text-[#6B7068]">#BV-{bounty.id.toString().padStart(4, "0")}</span>
                        <span>·</span>
                        <span>{bounty.category || "General"}</span>
                        <span>·</span>

                        {isSelected ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800/40 bg-emerald-950/30 text-[#10B981] uppercase">
                            Selected & Assigned
                          </span>
                        ) : applicant.status === "rejected" ? (
                          <span className="text-[10px] font-mono text-[#6B7068] uppercase">Proposal Closed</span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#2B302B] bg-[#191D19] text-[#C6FF4D] uppercase">
                            Under Review
                          </span>
                        )}

                        {bounty.deadline && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-[#6B7068]" /> Due {bounty.deadline}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#F5F5F0] tracking-tight">{bounty.title}</h3>
                      <p className="text-xs text-[#9A9E98] mt-1 max-w-3xl leading-relaxed whitespace-pre-line">
                        {bounty.description}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="inline-flex items-baseline gap-1 text-sm font-mono font-bold text-[#C6FF4D] tabular-nums bg-[#191D19] px-3 py-1.5 rounded-md border border-[#2B302B]">
                        <span>{bounty.reward.toLocaleString()}</span>
                        <span className="text-xs text-[#F5F5F0]">ALGO</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission details */}
                  <div className="p-3 sm:p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] text-xs space-y-1.5">
                    <div className="text-[#9A9E98]">
                      <span className="text-[#F5F5F0] font-medium">Your Proposal Pitch:</span> "{applicant.worker_reason}"
                    </div>
                    <div className="text-[#9A9E98]">
                      <span className="text-[#F5F5F0] font-medium">Skills:</span> {applicant.worker_skills}
                    </div>
                    {applicant.wallet_address && (
                      <div className="text-[11px] font-mono text-[#6B7068] break-all">
                        Payout Wallet: {applicant.wallet_address}
                      </div>
                    )}
                  </div>

                  {/* Active Job Controls */}
                  {isSelected && isAcquired && (
                    <div className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] text-xs flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#F5F5F0]">Milestone Deliverable Active</div>
                        <div className="text-[#9A9E98] mt-0.5 truncate max-w-sm">
                          Poster: {bounty.poster_name} ({bounty.poster_email})
                        </div>
                      </div>

                      <button
                        onClick={() => setDisputingBounty(bounty)}
                        className="px-3.5 py-1.5 rounded-md bg-rose-950/30 hover:bg-rose-950/50 text-[#EF4444] border border-rose-900/40 font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Raise Dispute</span>
                      </button>
                    </div>
                  )}

                  {/* Disputed State */}
                  {isDisputed && (
                    <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800/50 text-xs text-[#EF4444] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Contract currently in neutral Arbitrator Review. Settlement will execute automatically.</span>
                    </div>
                  )}

                  {/* Completed State */}
                  {isCompleted && (
                    <div className="p-3 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-xs text-[#10B981] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Milestone approved and {bounty.reward} ALGO payout settled!</span>
                      </div>
                      {bounty.txn_id && (
                        <span className="font-mono text-[11px] text-[#F5F5F0] break-all">
                          TxID: {bounty.txn_id}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Browse */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#6B7068] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search available bounties..."
              value={browseSearch}
              onChange={(e) => setBrowseSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
            />
          </div>

          {openBounties.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-[#141715] border border-[#2B302B] space-y-2">
              <p className="text-[#F5F5F0] text-xs font-semibold">No open bounties match your search</p>
              <p className="text-[11px] text-[#9A9E98]">Try clearing search keywords or check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openBounties.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="text-[#9A9E98]">{b.category || "General"}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-[#C6FF4D] tabular-nums">
                          {b.reward.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-mono text-[#F5F5F0]">ALGO</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[#F5F5F0] text-sm mb-1">{b.title}</h3>
                    <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed mb-4">
                      {b.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2B302B] flex items-center justify-between text-xs">
                    <span className="text-[#6B7068] text-[11px] font-mono">{b.deadline ? `Due ${b.deadline}` : "Open-ended"}</span>
                    <button
                      onClick={() => setApplyingBounty(b)}
                      className="px-3.5 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Earnings */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Total ALGO Received</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#10B981] font-mono tabular-nums">
                {totalEarned.toLocaleString()} ALGO
              </div>
              <div className="text-[11px] text-[#9A9E98] mt-1">Settled on Algorand</div>
            </div>

            <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">Completed Deliverables</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] font-mono tabular-nums">
                {completedJobs.length}
              </div>
              <div className="text-[11px] text-[#9A9E98] mt-1">Verified payouts</div>
            </div>

            <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B]">
              <div className="text-[10px] uppercase font-mono text-[#6B7068] mb-1">In-Flight Escrows</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#C6FF4D] font-mono tabular-nums">
                {potentialEarned.toLocaleString()} ALGO
              </div>
              <div className="text-[11px] text-[#9A9E98] mt-1">{activeInFlightJobs.length} active assignments</div>
            </div>
          </div>

          {/* Settled table */}
          <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F0]">Settlement History</h3>

            {completedJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9A9E98]">
                No completed payouts yet. Complete your first assigned task to record escrow release.
              </div>
            ) : (
              <div className="space-y-2">
                {completedJobs.map(({ bounty }) => (
                  <div
                    key={bounty.id}
                    className="p-3.5 rounded-md bg-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#F5F5F0]">{bounty.title}</div>
                      <div className="text-[#9A9E98] text-[11px]">Poster: {bounty.poster_name}</div>
                      {bounty.txn_id && (
                        <div className="text-[11px] font-mono text-[#6B7068] break-all">
                          TxID: {bounty.txn_id}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-[#10B981] tabular-nums">
                        +{bounty.reward.toLocaleString()} ALGO
                      </div>
                      <div className="text-[10px] text-[#6B7068]">Settled</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingBounty && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!applySubmitting) setApplyingBounty(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-mono font-bold text-[#C6FF4D]">Submit Proposal</span>
                <h2 className="text-base font-bold text-[#F5F5F0] mt-0.5">{applyingBounty.title}</h2>
                <div className="text-xs text-[#9A9E98] mt-0.5 font-mono">
                  Reward: <span className="text-[#C6FF4D] font-bold">{applyingBounty.reward.toLocaleString()} ALGO</span>
                </div>
              </div>
              <button
                onClick={() => setApplyingBounty(null)}
                className="p-1 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Relevant Skills & Experience</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorand PyTeal, React, TypeScript"
                  value={applyForm.worker_skills}
                  onChange={(e) => setApplyForm({ ...applyForm, worker_skills: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Approach & Deliverable Milestones</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline your execution plan, timeline, and previous deliverables..."
                  value={applyForm.worker_reason}
                  onChange={(e) => setApplyForm({ ...applyForm, worker_reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Payout Algorand Address</label>
                <input
                  type="text"
                  placeholder="e.g. 52-char Algorand address"
                  value={applyForm.wallet_address}
                  onChange={(e) => setApplyForm({ ...applyForm, wallet_address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] font-mono placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={applySubmitting}
                  onClick={() => setApplyingBounty(null)}
                  className="px-4 py-2 rounded-md text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="px-4 py-2 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  {applySubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Dispute Modal */}
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
                <span className="text-[11px] uppercase font-mono font-bold text-[#EF4444]">Escrow Dispute</span>
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
                <label className="text-[#9A9E98] font-medium">Dispute Claim & Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail why the poster is refusing release despite deliverable completion..."
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Proof of Delivery / Commit Links</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub PR, deploy URL, Figma link..."
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
