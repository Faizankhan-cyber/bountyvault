import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { Bounty, BountyStatus } from "../types";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { ApplyModal } from "../components/ApplyModal";
import { 
  Search, 
  Calendar, 
  User, 
  PlusCircle, 
  Clock, 
  ArrowRight, 
  FilterX, 
  Grid, 
  List, 
  Loader2, 
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface MarketplacePageProps {
  initialSearch?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ initialSearch = "", onNavigate }) => {
  const { user, isAuthenticated, role } = useAuth();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"highest" | "newest" | "lowest" | "deadline">("highest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Apply modal
  const [applyingBounty, setApplyingBounty] = useState<Bounty | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const data = await api.getBounties();
      setBounties(data);
    } catch (err: any) {
      console.error("Failed to fetch marketplace bounties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    bounties.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ["all", ...Array.from(set)];
  }, [bounties]);

  const filteredBounties = useMemo(() => {
    let list = [...bounties];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.poster_name.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      list = list.filter((b) => (b.category || "General").toLowerCase() === category.toLowerCase());
    }

    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (sortBy === "highest") {
      list.sort((a, b) => b.reward - a.reward);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.reward - b.reward);
    } else if (sortBy === "newest") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === "deadline") {
      list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return list;
  }, [bounties, search, category, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatusFilter("all");
    setSortBy("highest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 font-semibold text-xs ml-3">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2B302B] pb-6">
        <div>
          <div className="text-xs font-mono text-[#C6FF4D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Algorand Escrow Directory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F0]">
            Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9E98] mt-1 max-w-xl">
            Browse live bounties backed by non-custodial smart contracts. Submit proposals with verified skills and receive instant settlements upon milestone sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && role === "poster" && (
            <button
              onClick={() => onNavigate("create-bounty")}
              className="px-4 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Bounty</span>
            </button>
          )}
          <div className="flex items-center bg-[#141715] border border-[#2B302B] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-[#191D19] text-[#C6FF4D]" : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table" ? "bg-[#191D19] text-[#C6FF4D]" : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        {/* Search Bar + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
            <input
              type="text"
              placeholder="Search bounties by title, stack, description, or poster..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141715] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 bg-[#141715] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] focus:border-[#C6FF4D] focus:outline-none cursor-pointer"
            >
              <option value="highest">Reward: Highest to Lowest</option>
              <option value="lowest">Reward: Lowest to Highest</option>
              <option value="newest">Recently Posted</option>
              <option value="deadline">Approaching Deadline</option>
            </select>
          </div>
        </div>

        {/* Category & Status Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#6B7068] font-mono mr-1 text-[11px]">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                    : "bg-[#141715] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#6B7068] font-mono mr-1 text-[11px]">Status:</span>
            {[
              { id: "all", label: "All" },
              { id: "open", label: "Open" },
              { id: "acquired", label: "In Progress" },
              { id: "completed", label: "Settled" },
              { id: "disputed", label: "Disputed" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? "bg-[#191D19] text-[#F5F5F0] border border-[#C6FF4D]"
                    : "bg-[#141715] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-[#9A9E98] pt-2">
        <span>
          Showing <span className="text-[#F5F5F0] font-mono font-bold">{filteredBounties.length}</span> of{" "}
          <span className="font-mono">{bounties.length}</span> total bounties
        </span>
        {(search || category !== "all" || statusFilter !== "all") && (
          <button
            onClick={resetFilters}
            className="text-[#C6FF4D] hover:underline flex items-center gap-1 text-[11px]"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C6FF4D]" />
          <p className="text-xs text-[#9A9E98]">Loading Algorand escrow smart contract data...</p>
        </div>
      ) : filteredBounties.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#141715] border border-[#2B302B] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#191D19] border border-[#2B302B] flex items-center justify-center mx-auto text-[#6B7068]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#F5F5F0]">No Bounties Found</h3>
          <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
            No active bounties matched your current query and filters. Try resetting your search terms or view all open categories.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] hover:bg-[#202520] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map((bounty) => (
            <div
              key={bounty.id}
              className="bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] text-[#9A9E98] border border-[#2B302B]">
                    {bounty.category || "General"}
                  </span>
                  <StatusBadge status={bounty.status} size="sm" />
                </div>

                <div>
                  <h3
                    onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                    className="font-bold text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors text-base line-clamp-2 cursor-pointer"
                  >
                    {bounty.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B7068] mt-1">
                    <User className="w-3 h-3" />
                    <span>Posted by {bounty.poster_name}</span>
                  </div>
                </div>

                <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed">
                  {bounty.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2B302B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#9A9E98]">
                    <Clock className="w-3.5 h-3.5 text-[#6B7068]" />
                    <span>Deadline: {bounty.deadline || "Open"}</span>
                  </div>
                  <div className="font-mono font-bold text-[#C6FF4D] text-lg">
                    {bounty.reward} ALGO
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                    className="w-full py-2 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>View Detail</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B7068]" />
                  </button>

                  {bounty.status === "open" ? (
                    <button
                      onClick={() => setApplyingBounty(bounty)}
                      className="w-full py-2 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                      className="w-full py-2 rounded-lg bg-[#141715] border border-[#2B302B] text-xs text-[#6B7068] cursor-pointer hover:text-[#9A9E98]"
                    >
                      Inspect Escrow
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#141715] border border-[#2B302B] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B302B] bg-[#191D19] text-[#6B7068] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Bounty Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Poster</th>
                  <th className="py-3 px-4">Escrow Reward</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B302B]">
                {filteredBounties.map((bounty) => (
                  <tr key={bounty.id} className="hover:bg-[#191D19]/60 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div
                        onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                        className="font-semibold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors cursor-pointer truncate"
                      >
                        {bounty.title}
                      </div>
                      <div className="text-[11px] text-[#6B7068] truncate">{bounty.description}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#9A9E98]">
                      {bounty.category}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#9A9E98]">
                      {bounty.poster_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#C6FF4D]">
                      {bounty.reward} ALGO
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[#9A9E98] font-mono">
                      {bounty.deadline || "TBD"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={bounty.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onNavigate("bounty-detail", String(bounty.id))}
                        className="px-2.5 py-1 rounded bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0]"
                      >
                        Details
                      </button>
                      {bounty.status === "open" && (
                        <button
                          onClick={() => setApplyingBounty(bounty)}
                          className="px-2.5 py-1 rounded bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold"
                        >
                          Apply
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingBounty && (
        <ApplyModal
          bounty={applyingBounty}
          isOpen={Boolean(applyingBounty)}
          onClose={() => setApplyingBounty(null)}
          onSuccess={() => {
            setToastMessage(`Application successfully submitted for "${applyingBounty.title}"!`);
            fetchBounties();
          }}
        />
      )}

    </div>
  );
};
