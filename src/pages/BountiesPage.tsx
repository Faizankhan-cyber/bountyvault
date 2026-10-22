import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Bounty, BountyStatus } from "../types";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { 
  Search, 
  Calendar, 
  User, 
  X, 
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  FilterX,
  Clock,
  ArrowRight
} from "lucide-react";

interface BountiesPageProps {
  initialSearch?: string;
  onNavigate: (view: string) => void;
}

export const BountiesPage: React.FC<BountiesPageProps> = ({ initialSearch = "", onNavigate }) => {
  const { user, role, isAuthenticated } = useAuth();
  const { address } = useWallet();

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest" | "deadline">("newest");

  // Selected bounty for details modal
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

  // Application modal
  const [applyingBounty, setApplyingBounty] = useState<Bounty | null>(null);
  const [applyForm, setApplyForm] = useState({
    worker_name: user?.name || "",
    worker_email: user?.email || "",
    worker_skills: "",
    worker_reason: "",
    wallet_address: address || "",
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Escape key handler for open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedBounty) setSelectedBounty(null);
        if (applyingBounty && !applySubmitting) setApplyingBounty(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBounty, applyingBounty, applySubmitting]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const data = await api.getBounties();
      setBounties(data);
    } catch (err: any) {
      console.error("Failed to fetch bounties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  useEffect(() => {
    if (user) {
      setApplyForm((prev) => ({
        ...prev,
        worker_name: user.name || prev.worker_name,
        worker_email: user.email || prev.worker_email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (address) {
      setApplyForm((prev) => ({ ...prev, wallet_address: address }));
    }
  }, [address]);

  // Filtering and sorting
  const filteredBounties = bounties
    .filter((b) => {
      const matchesSearch =
        search.trim() === "" ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()) ||
        b.poster_name.toLowerCase().includes(search.toLowerCase());

      const matchesCat = category === "all" || b.category.toLowerCase() === category.toLowerCase();
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "highest") return b.reward - a.reward;
      if (sortBy === "lowest") return a.reward - b.reward;
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return 0;
    });

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingBounty) return;

    setApplySubmitting(true);
    try {
      await api.applyToBounty(applyingBounty.id, {
        worker_name: applyForm.worker_name,
        worker_email: applyForm.worker_email,
        worker_skills: applyForm.worker_skills,
        worker_reason: applyForm.worker_reason,
        wallet_address: applyForm.wallet_address || undefined,
      });

      setToastMessage({ text: "Application submitted successfully! Track your submission in Worker Dashboard." });
      setApplyingBounty(null);
      setApplyForm((prev) => ({
        ...prev,
        worker_skills: "",
        worker_reason: "",
      }));
    } catch (err: any) {
      setToastMessage({ text: err.message || "Failed to submit application", isError: true });
    } finally {
      setApplySubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getStatusBadge = (status: BountyStatus) => {
    switch (status) {
      case "open":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#2B302B] bg-[#191D19] text-[#C6FF4D] uppercase">Open</span>;
      case "acquired":
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-sky-800/40 bg-sky-950/30 text-sky-400 uppercase">Assigned</span>;
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
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg text-xs shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border ${
            toastMessage.isError 
              ? "bg-[#141715] border-[#EF4444] text-[#EF4444]" 
              : "bg-[#141715] border-[#10B981] text-[#10B981]"
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="font-medium text-[#F5F5F0]">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-[#9A9E98] hover:text-[#F5F5F0] ml-2 p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B302B] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6FF4D] uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C6FF4D]"></span>
            <span>ESCROW MARKETPLACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight">Public Bounty Board</h1>
          <p className="text-xs text-[#9A9E98] mt-1">
            Inspect active Algorand smart contracts, verify escrow deposits, and submit proposals.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchBounties}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-[#F5F5F0] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
          >
            {loading ? "Refreshing..." : "Refresh Feed"}
          </button>
          {isAuthenticated && role === "poster" && (
            <button
              onClick={() => onNavigate("poster")}
              className="px-3.5 py-1.5 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
            >
              + Create Bounty
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-lg bg-[#141715] border border-[#2B302B] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7068] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search keywords or posters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-xs text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="smart contracts">Smart Contracts</option>
            <option value="writing">Writing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-xs text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Available)</option>
            <option value="acquired">Assigned (In Progress)</option>
            <option value="completed">Completed (Paid)</option>
            <option value="disputed">Disputed (Arbitration)</option>
            <option value="cancelled">Cancelled (Refunded)</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-xs text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] transition-colors"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="highest">Sort: Reward (High to Low)</option>
            <option value="lowest">Sort: Reward (Low to High)</option>
            <option value="deadline">Sort: Upcoming Deadline</option>
          </select>
        </div>
      </div>

      {/* Grid of Bounties */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#C6FF4D] animate-spin" />
          <span className="text-xs font-mono text-[#9A9E98]">SYNCING WITH ESCROW CONTRACTS...</span>
        </div>
      ) : filteredBounties.length === 0 ? (
        <div className="p-12 text-center rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
          <div className="w-12 h-12 rounded-lg bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#9A9E98]">
            <FolderOpen className="w-6 h-6" />
          </div>
          <p className="text-[#F5F5F0] text-sm font-semibold">No bounties match your criteria</p>
          <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
            Try adjusting your search terms, changing category filters, or resetting to default view.
          </p>
          <div>
            <button
              onClick={resetFilters}
              className="mt-1 px-4 py-2 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#C6FF4D] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBounties.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row: Status and reward */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    {getStatusBadge(b.status)}
                    <span className="text-[11px] font-mono text-[#6B7068]">
                      #{b.id.toString().padStart(4, "0")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-[#C6FF4D] text-base tabular-nums">
                      {b.reward.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#F5F5F0]">ALGO</span>
                  </div>
                </div>

                <h3 className="font-bold text-[#F5F5F0] text-sm mb-2 group-hover:text-[#C6FF4D] transition-colors line-clamp-2">
                  {b.title}
                </h3>

                <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed mb-4">
                  {b.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#2B302B] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#9A9E98]">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <User className="w-3.5 h-3.5 shrink-0 text-[#6B7068]" />
                    <span className="truncate">{b.poster_name}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-[#6B7068]" />
                    {b.deadline ? `Due ${b.deadline}` : "No deadline"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedBounty(b)}
                    className="flex-1 py-2 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-[#F5F5F0] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  >
                    View Details
                  </button>

                  {b.status === "open" && (
                    <button
                      onClick={() => setApplyingBounty(b)}
                      className="flex-1 py-2 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bounty Details Modal */}
      {selectedBounty && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBounty(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-[#141715] border border-[#2B302B] rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#9A9E98] mb-1">
                  <span className="font-mono text-[#6B7068]">#BV-{selectedBounty.id.toString().padStart(4, "0")}</span>
                  <span>·</span>
                  <span className="capitalize">{selectedBounty.category || "General"}</span>
                  <span>·</span>
                  {getStatusBadge(selectedBounty.status)}
                </div>
                <h2 className="text-lg font-bold text-[#F5F5F0]">{selectedBounty.title}</h2>
              </div>
              <button
                onClick={() => setSelectedBounty(null)}
                className="p-1 rounded-md text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#9A9E98]">
              <div className="p-3.5 rounded-lg bg-[#191D19] border border-[#2B302B] space-y-1.5">
                <div className="text-[11px] uppercase font-mono font-bold text-[#6B7068]">Task Specification</div>
                <p className="whitespace-pre-wrap text-[#F5F5F0] leading-relaxed">{selectedBounty.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B]">
                  <div className="text-[#6B7068] text-[10px] uppercase font-mono mb-1">Escrow Reward</div>
                  <div className="text-lg font-bold font-mono text-[#C6FF4D] tabular-nums">
                    {selectedBounty.reward.toLocaleString()} ALGO
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B]">
                  <div className="text-[#6B7068] text-[10px] uppercase font-mono mb-1">Delivery Deadline</div>
                  <div className="text-xs font-semibold text-[#F5F5F0]">{selectedBounty.deadline || "Open-ended"}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B]">
                  <div className="text-[#6B7068] text-[10px] uppercase font-mono mb-0.5">Poster</div>
                  <div className="text-xs font-medium text-[#F5F5F0]">{selectedBounty.poster_name}</div>
                  <div className="text-[11px] text-[#9A9E98] truncate">{selectedBounty.poster_email}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B]">
                  <div className="text-[#6B7068] text-[10px] uppercase font-mono mb-0.5">Assigned Contributor</div>
                  <div className="text-xs font-medium text-[#F5F5F0]">
                    {selectedBounty.worker_name || "Unassigned"}
                  </div>
                  {selectedBounty.worker_email && (
                    <div className="text-[11px] text-[#9A9E98] truncate">{selectedBounty.worker_email}</div>
                  )}
                </div>
              </div>

              {selectedBounty.txn_id && (
                <div className="p-3 rounded-lg bg-[#191D19] border border-[#2B302B]">
                  <div className="text-[#6B7068] text-[10px] uppercase font-mono mb-1">Algorand Txn ID</div>
                  <div className="font-mono text-[11px] text-[#C6FF4D] break-all select-all">
                    {selectedBounty.txn_id}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B302B]">
              <button
                onClick={() => setSelectedBounty(null)}
                className="px-4 py-2 rounded-md text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                Close
              </button>
              {selectedBounty.status === "open" && (
                <button
                  onClick={() => {
                    const b = selectedBounty;
                    setSelectedBounty(null);
                    setApplyingBounty(b);
                  }}
                  className="px-4 py-2 rounded-md bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                >
                  Apply to Bounty
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#9A9E98] font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={applyForm.worker_name}
                    onChange={(e) => setApplyForm({ ...applyForm, worker_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#9A9E98] font-medium">Your Email</label>
                  <input
                    type="email"
                    required
                    value={applyForm.worker_email}
                    onChange={(e) => setApplyForm({ ...applyForm, worker_email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Relevant Skills & Stack</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorand PyTeal, React, TypeScript"
                  value={applyForm.worker_skills}
                  onChange={(e) => setApplyForm({ ...applyForm, worker_skills: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Proposal Pitch</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain your approach, milestones, and timeline..."
                  value={applyForm.worker_reason}
                  onChange={(e) => setApplyForm({ ...applyForm, worker_reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#9A9E98] font-medium">Algorand Payout Wallet Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 52-char Algorand address"
                  value={applyForm.wallet_address}
                  onChange={(e) => setApplyForm({ ...applyForm, wallet_address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#191D19] border border-[#2B302B] rounded-md text-[#F5F5F0] font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
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
    </div>
  );
};
