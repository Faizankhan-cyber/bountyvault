import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { api } from "../services/api";
import { Bounty, Applicant, Transaction, Dispute, Role } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { 
  FolderKanban, 
  Briefcase, 
  Scale, 
  PlusCircle, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  FileText,
  Mail,
  ShieldCheck,
  Send,
  X
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, role, isAuthenticated, switchRole } = useAuth();
  const { address, sendPayment } = useWallet();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  // Poster state: applicants map
  const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);
  const [applicantsMap, setApplicantsMap] = useState<Record<number, Applicant[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState<number | null>(null);

  // Worker state: my applications
  const [myApplications, setMyApplications] = useState<{ applicant: Applicant; bounty: Bounty }[]>([]);

  // Action notification
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showNotice = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allBounties, allTx, allDisputes] = await Promise.all([
        api.getBounties().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getDisputes().catch(() => []),
      ]);
      setBounties(allBounties);
      setTransactions(allTx);
      setDisputes(allDisputes);

      // If worker, compute applications
      if (role === "worker") {
        const userEmail = user.email.toLowerCase();
        const appResults: { applicant: Applicant; bounty: Bounty }[] = [];
        for (const b of allBounties) {
          try {
            const apps = await api.getApplicants(b.id);
            const userApp = apps.find((a) => a.worker_email.toLowerCase() === userEmail);
            if (userApp) {
              appResults.push({ applicant: userApp, bounty: b });
            } else if (b.assigned_worker && b.assigned_worker.toLowerCase() === userEmail) {
              appResults.push({
                applicant: {
                  id: 0,
                  bounty_id: b.id,
                  worker_name: b.worker_name || user.name,
                  worker_email: user.email,
                  worker_skills: b.worker_skills || "General",
                  worker_reason: b.worker_reason || "Assigned directly",
                  wallet_address: b.worker_address || address || null,
                  status: (b.status === "open" ? "pending" : "selected") as any,
                  created_at: b.created_at,
                },
                bounty: b,
              });
            }
          } catch {
            // Ignore individual fetch errors
          }
        }
        setMyApplications(appResults);
      }
    } catch (err: any) {
      showNotice(err.message || "Failed to load dashboard data.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  const loadApplicantsForBounty = async (bountyId: number) => {
    if (expandedBountyId === bountyId) {
      setExpandedBountyId(null);
      return;
    }
    setExpandedBountyId(bountyId);
    if (!applicantsMap[bountyId]) {
      setLoadingApplicants(bountyId);
      try {
        const apps = await api.getApplicants(bountyId);
        setApplicantsMap((prev) => ({ ...prev, bountyId, [bountyId]: apps }));
      } catch (err: any) {
        showNotice("Could not load applicants for this bounty.", true);
      } finally {
        setLoadingApplicants(null);
      }
    }
  };

  const handleSelectApplicant = async (bountyId: number, workerEmail: string) => {
    setActionLoading(true);
    try {
      await api.selectApplicant(bountyId, workerEmail);
      showNotice("Contributor selected! Bounty marked In Progress.");
      loadData();
      const updatedApps = await api.getApplicants(bountyId);
      setApplicantsMap((prev) => ({ ...prev, [bountyId]: updatedApps }));
    } catch (err: any) {
      showNotice(err.message || "Failed to select worker.", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBounty = async (bounty: Bounty) => {
    setActionLoading(true);
    try {
      const recipient = bounty.worker_address || "ALGO-TESTNET-WORKER";
      const txnId = await sendPayment(recipient, bounty.reward);
      await api.completeBounty(bounty.id, txnId);
      showNotice(`Bounty completed and ${bounty.reward} ALGO released!`);
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to complete bounty.", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBounty = async (bountyId: number) => {
    if (!confirm("Are you sure you want to cancel this bounty? Escrow will be refunded to poster.")) return;
    setActionLoading(true);
    try {
      await api.cancelBounty(bountyId);
      showNotice("Bounty cancelled and escrow refunded.");
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to cancel bounty.", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArbitratorResolve = async (dispute: Dispute, decision: "worker" | "poster") => {
    setActionLoading(true);
    try {
      const b = bounties.find((item) => item.id === dispute.bounty_id);
      const recipient = decision === "worker"
        ? (b?.worker_address || "ALGO-TESTNET-WORKER")
        : "ALGO-TESTNET-POSTER-REFUND";
      const reward = b?.reward || 10;
      const txnId = await sendPayment(recipient, reward);

      await api.resolveDispute(dispute.bounty_id, {
        decision,
        txn_id: txnId,
        resolved_by: user!.email,
        resolver_wallet: address || undefined,
      });

      showNotice(`Dispute resolved in favor of ${decision}. Payment executed.`);
      loadData();
    } catch (err: any) {
      showNotice(err.message || "Failed to resolve dispute.", true);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#F5F5F0]">Sign In to View Dashboard</h2>
        <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
          Access your created bounties, proposals, escrow allocations, and settlement receipts.
        </p>
        <button
          onClick={() => onNavigate("login")}
          className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filtered views based on user role
  const myPosterBounties = bounties.filter(
    (b) => b.poster_email.toLowerCase() === user.email.toLowerCase()
  );
  const myPosterTotalLocked = myPosterBounties
    .filter((b) => b.status === "open" || b.status === "acquired")
    .reduce((sum, b) => sum + b.reward, 0);

  const activeWorkerTasks = myApplications.filter(
    (a) => a.bounty.status === "acquired" && a.applicant.status === "selected"
  );
  const completedWorkerTasks = myApplications.filter(
    (a) => a.bounty.status === "completed" && a.applicant.status === "selected"
  );
  const totalEarned = completedWorkerTasks.reduce((sum, a) => sum + a.bounty.reward, 0);

  const openDisputes = disputes.filter((d) => d.status === "open");

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

      {/* Header with Role Switcher Demo Helper */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2B302B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#C6FF4D]">
              {(role || "USER").toUpperCase()} CONSOLE
            </span>
            <span className="text-xs text-[#6B7068] font-mono">{user.email}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9E98] mt-1">
            {role === "poster" && "Manage your posted smart escrows, inspect applicant proposals, and approve milestone payouts."}
            {role === "worker" && "Track your active assignments, submitted bounty proposals, and Algorand settlement payouts."}
            {role === "arbitrator" && "Review contested bounties, inspect cryptographic evidence, and execute irrevocable dispute verdicts."}
          </p>
        </div>

        {/* Quick Role Tester for evaluation */}
        <div className="flex items-center gap-2 bg-[#141715] p-1.5 rounded-lg border border-[#2B302B]">
          <span className="text-[10px] text-[#6B7068] font-mono uppercase px-2">Role:</span>
          {(["poster", "worker", "arbitrator"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors ${
                role === r
                  ? "bg-[#C6FF4D] text-[#0B0D0C]"
                  : "text-[#9A9E98] hover:text-[#F5F5F0] hover:bg-[#191D19]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          POSTER VIEW
      ========================================================================= */}
      {role === "poster" && (
        <div className="space-y-8">
          
          {/* Poster KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">My Bounties</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F0] mt-1">
                {myPosterBounties.length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Escrow Locked</div>
              <div className="text-2xl font-bold font-mono text-[#C6FF4D] mt-1">
                {myPosterTotalLocked} ALGO
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">In Progress</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {myPosterBounties.filter((b) => b.status === "acquired").length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Settled / Completed</div>
              <div className="text-2xl font-bold font-mono text-[#10B981] mt-1">
                {myPosterBounties.filter((b) => b.status === "completed").length}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#C6FF4D]" />
              <span>My Created Escrow Bounties</span>
            </h2>
            <button
              onClick={() => onNavigate("create-bounty")}
              className="px-4 py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Bounty</span>
            </button>
          </div>

          {/* Bounties List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-[#9A9E98]">
              <Loader2 className="w-6 h-6 animate-spin text-[#C6FF4D] mx-auto mb-2" />
              Loading your bounties...
            </div>
          ) : myPosterBounties.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#6B7068]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">No Bounties Created Yet</h3>
              <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
                Post your first project, specify required milestones, and commit non-custodial ALGO escrow.
              </p>
              <button
                onClick={() => onNavigate("create-bounty")}
                className="px-4 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
              >
                Create a Bounty
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myPosterBounties.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] text-[#9A9E98] border border-[#2B302B]">
                          {b.category}
                        </span>
                        <StatusBadge status={b.status} size="sm" />
                        <span className="text-xs font-mono text-[#6B7068]">Bounty #{b.id}</span>
                      </div>
                      <h3
                        onClick={() => onNavigate("bounty-detail", String(b.id))}
                        className="font-bold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors cursor-pointer text-base"
                      >
                        {b.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[#6B7068] font-mono">Escrow</div>
                        <div className="font-mono font-bold text-[#C6FF4D] text-lg">
                          {b.reward} ALGO
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate("bounty-detail", String(b.id))}
                        className="px-3 py-1.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] transition-colors"
                      >
                        Full Details
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#2B302B] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {b.status === "open" && (
                        <button
                          onClick={() => loadApplicantsForBounty(b.id)}
                          className="px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-medium text-[#C6FF4D] flex items-center gap-1.5 transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>
                            {expandedBountyId === b.id ? "Hide Applicants" : "Review Proposals"}
                          </span>
                        </button>
                      )}

                      {b.status === "acquired" && (
                        <div className="text-[#9A9E98] flex items-center gap-1.5">
                          <span>Worker:</span>
                          <strong className="text-[#F5F5F0]">{b.worker_name || b.assigned_worker}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === "acquired" && (
                        <button
                          onClick={() => handleCompleteBounty(b)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-md bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Release Payment</span>
                        </button>
                      )}

                      {b.status === "open" && (
                        <button
                          onClick={() => handleCancelBounty(b.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#EF4444]"
                        >
                          Cancel Bounty
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Applicants Drawer for Open Bounties */}
                  {expandedBountyId === b.id && (
                    <div className="pt-3 border-t border-[#2B302B] space-y-3 bg-[#0B0D0C] p-4 rounded-lg">
                      <h4 className="text-xs font-bold text-[#F5F5F0] font-mono uppercase text-[#C6FF4D]">
                        Applicant Proposals for Bounty #{b.id}
                      </h4>

                      {loadingApplicants === b.id ? (
                        <div className="py-4 text-center text-xs text-[#9A9E98]">
                          <Loader2 className="w-4 h-4 animate-spin text-[#C6FF4D] mx-auto mb-1" />
                          Loading proposals...
                        </div>
                      ) : !applicantsMap[b.id] || applicantsMap[b.id].length === 0 ? (
                        <p className="text-xs text-[#6B7068]">No applications received yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {applicantsMap[b.id].map((app) => (
                            <div
                              key={app.id}
                              className="p-3 rounded bg-[#141715] border border-[#2B302B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-semibold text-[#F5F5F0]">{app.worker_name} ({app.worker_email})</div>
                                <div className="text-[11px] text-[#9A9E98] mt-0.5">{app.worker_skills}</div>
                                <div className="text-[11px] text-[#6B7068] mt-1 line-clamp-2">{app.worker_reason}</div>
                              </div>
                              {app.status === "pending" && (
                                <button
                                  onClick={() => handleSelectApplicant(b.id, app.worker_email)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 rounded bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs whitespace-nowrap self-end sm:self-center"
                                >
                                  Select Contributor
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          WORKER / CONTRIBUTOR VIEW
      ========================================================================= */}
      {role === "worker" && (
        <div className="space-y-8">
          
          {/* Worker KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Active Assignments</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {activeWorkerTasks.length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Submitted Proposals</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F0] mt-1">
                {myApplications.length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Settled Earnings</div>
              <div className="text-2xl font-bold font-mono text-[#10B981] mt-1">
                {totalEarned} ALGO
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Pending Decisions</div>
              <div className="text-2xl font-bold font-mono text-[#C6FF4D] mt-1">
                {myApplications.filter((a) => a.applicant.status === "pending").length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#C6FF4D]" />
              <span>My Contributor Applications & Work</span>
            </h2>
            <button
              onClick={() => onNavigate("marketplace")}
              className="px-4 py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#9A9E98]">
              <Loader2 className="w-6 h-6 animate-spin text-[#C6FF4D] mx-auto mb-2" />
              Loading your contributor tasks...
            </div>
          ) : myApplications.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#6B7068]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">No Applications Submitted Yet</h3>
              <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
                Explore the marketplace, find projects matching your skills, and apply with your Algorand wallet address.
              </p>
              <button
                onClick={() => onNavigate("marketplace")}
                className="px-4 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs"
              >
                Browse Open Bounties
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map(({ applicant, bounty }) => (
                <div
                  key={applicant.id || bounty.id}
                  className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] text-[#9A9E98] border border-[#2B302B]">
                          {bounty.category}
                        </span>
                        <StatusBadge status={applicant.status} size="sm" />
                        <span className="text-xs font-mono text-[#6B7068]">Bounty #{bounty.id}</span>
                      </div>
                      <h3
                        onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                        className="font-bold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors cursor-pointer text-base"
                      >
                        {bounty.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[#6B7068] font-mono">Reward</div>
                        <div className="font-mono font-bold text-[#C6FF4D] text-lg">
                          {bounty.reward} ALGO
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                        className="px-3 py-1.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] transition-colors"
                      >
                        Bounty Details
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B] text-xs text-[#9A9E98] space-y-1">
                    <div>
                      <strong className="text-[#F5F5F0]">My Proposal:</strong> {applicant.worker_reason}
                    </div>
                    {bounty.status === "acquired" && applicant.status === "selected" && (
                      <div className="text-[#10B981] font-mono text-[11px] pt-1">
                        Active assignment! Deliver requirements to receive escrow payout upon client sign-off.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ARBITRATOR VIEW
      ========================================================================= */}
      {role === "arbitrator" && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Open Disputes</div>
              <div className="text-2xl font-bold font-mono text-[#EF4444] mt-1">
                {openDisputes.length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Resolved Disputes</div>
              <div className="text-2xl font-bold font-mono text-[#10B981] mt-1">
                {disputes.filter((d) => d.status === "resolved").length}
              </div>
            </div>
            <div className="p-5 rounded-xl bg-[#141715] border border-[#2B302B]">
              <div className="text-xs text-[#6B7068] font-mono uppercase">Total Dispute History</div>
              <div className="text-2xl font-bold font-mono text-[#F5F5F0] mt-1">
                {disputes.length}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>Active Contested Smart Escrows</span>
          </h2>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#9A9E98]">
              <Loader2 className="w-6 h-6 animate-spin text-[#C6FF4D] mx-auto mb-2" />
              Loading disputes...
            </div>
          ) : openDisputes.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#10B981] mx-auto" />
              <h3 className="text-base font-bold text-[#F5F5F0]">No Open Disputes</h3>
              <p className="text-xs text-[#9A9E98]">
                All active escrows are running smoothly with zero unresolved conflicts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {openDisputes.map((d) => {
                const b = bounties.find((item) => item.id === d.bounty_id);
                return (
                  <div
                    key={d.id}
                    className="bg-[#141715] border border-rose-900/40 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950/40 text-[#EF4444] border border-rose-800/40">
                            FROZEN IN DISPUTE
                          </span>
                          <span className="text-xs text-[#6B7068] font-mono">Bounty #{d.bounty_id}</span>
                        </div>
                        <h3 className="font-bold text-[#F5F5F0] text-base">
                          {b?.title || `Bounty #${d.bounty_id}`}
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
                        <span className="text-[#6B7068]">Reason:</span>{" "}
                        <span className="text-[#9A9E98]">{d.reason}</span>
                      </div>
                      {d.evidence && (
                        <div>
                          <span className="text-[#6B7068]">Submitted Evidence:</span>{" "}
                          <span className="text-[#C6FF4D] font-mono break-all">{d.evidence}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                      <button
                        onClick={() => onNavigate("bounty-detail", String(d.bounty_id))}
                        className="px-3.5 py-2 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0]"
                      >
                        Inspect Full Contract
                      </button>
                      <button
                        onClick={() => handleArbitratorResolve(d, "worker")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-emerald-400 text-[#0B0D0C] font-semibold text-xs"
                      >
                        Award to Contributor
                      </button>
                      <button
                        onClick={() => handleArbitratorResolve(d, "poster")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg bg-[#191D19] hover:bg-amber-950/30 border border-amber-600 text-amber-400 font-semibold text-xs"
                      >
                        Refund to Client
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
