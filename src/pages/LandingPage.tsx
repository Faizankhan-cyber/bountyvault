import React, { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { Bounty, PlatformStats } from "../types";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowRight, 
  Search, 
  Clock, 
  Lock,
  FilterX,
  ExternalLink,
  ShieldCheck,
  FileCode
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (view: string, searchParam?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, role } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  // Marketplace filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"highest" | "newest" | "deadline">("highest");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, bountiesData] = await Promise.all([
          api.getStats().catch(() => null),
          api.getBounties().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        setBounties(bountiesData);
      } catch (err: any) {
        console.error("Unable to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered and sorted bounties for the marketplace section
  const filteredBounties = useMemo(() => {
    let list = [...bounties];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.poster_name?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter(b => (b.category || "General").toLowerCase() === selectedCategory.toLowerCase());
    }

    if (sortBy === "highest") {
      list.sort((a, b) => b.reward - a.reward);
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
  }, [bounties, searchQuery, selectedCategory, sortBy]);

  // Featured terminal bounty (highest reward active bounty or first bounty)
  const featuredBounty = useMemo(() => {
    const active = bounties.filter(b => b.status === "open" || b.status === "acquired");
    if (active.length > 0) {
      return [...active].sort((a, b) => b.reward - a.reward)[0];
    }
    return bounties[0] || null;
  }, [bounties]);

  // Dynamic categories derived from actual bounties
  const categories = useMemo(() => {
    const set = new Set<string>();
    bounties.forEach(b => {
      if (b.category) set.add(b.category);
    });
    return ["all", ...Array.from(set)];
  }, [bounties]);

  const getDashboardDestination = () => {
    if (!isAuthenticated) return "auth";
    if (role === "poster") return "poster";
    if (role === "worker") return "worker";
    if (role === "arbitrator") return "arbitrator";
    return "bounties";
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "open":
        return { label: "OPEN FOR PROPOSALS", color: "text-[#C6FF4D] bg-[#191D19] border-[#2B302B]" };
      case "acquired":
        return { label: "IN PROGRESS", color: "text-amber-400 bg-amber-950/30 border-amber-800/40" };
      case "completed":
        return { label: "SETTLED", color: "text-[#10B981] bg-emerald-950/30 border-emerald-800/40" };
      case "disputed":
        return { label: "IN DISPUTE", color: "text-[#EF4444] bg-rose-950/30 border-rose-800/40" };
      case "cancelled":
        return { label: "CANCELLED", color: "text-[#9A9E98] bg-[#141715] border-[#2B302B]" };
      default:
        return { label: status.toUpperCase(), color: "text-[#9A9E98] bg-[#141715] border-[#2B302B]" };
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Asymmetric Left-Aligned Editorial Hero */}
      <section className="pt-10 md:pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Asymmetric Editorial Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#F5F5F0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF4D] animate-pulse"></span>
              <span>ALGORAND ESCROW PROTOCOL</span>
              <span className="text-[#6B7068]">·</span>
              <span className="text-[#9A9E98]">TESTNET NODE SYNCED</span>
            </div>

            {/* Mandated Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F5F0] leading-[1.08]">
              Good work. <br />
              <span className="text-[#C6FF4D]">Secured rewards.</span>
            </h1>

            {/* Concise Supporting Copy */}
            <p className="text-base sm:text-lg text-[#9A9E98] max-w-xl leading-relaxed font-normal">
              BountyVault locks client funds into non-custodial Algorand smart contracts upfront. 
              Contributors build with cryptographic payment guarantees, while posters retain escrow-backed 
              approval controls and impartial on-chain arbitration.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("bounties")}
                className="px-5 py-3 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => onNavigate(getDashboardDestination())}
                className="px-5 py-3 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-[#F5F5F0] font-medium text-xs uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
              >
                {isAuthenticated ? (
                  role === "poster" ? "Open Poster Console" : "Open Workspace"
                ) : (
                  "Post a Bounty"
                )}
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-3 text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded"
              >
                How It Works ↓
              </button>
            </div>

            {/* Quick Filter / Search Bar */}
            <div className="pt-2 max-w-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onNavigate("bounties", searchQuery);
                }}
                className="flex items-center gap-2 p-1.5 bg-[#141715] border border-[#2B302B] rounded-lg focus-within:border-[#C6FF4D] transition-colors"
              >
                <div className="pl-2.5 text-[#6B7068]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Filter by title, stack (e.g. Algorand, React)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[#F5F5F0] text-xs focus:outline-none placeholder-[#6B7068] py-1 px-1"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-medium text-[#F5F5F0] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Refined Terminal Bounty Preview (Populated ONLY with Real Data) */}
          <div className="lg:col-span-5">
            <div className="bg-[#141715] border border-[#2B302B] rounded-xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#191D19] border-b border-[#2B302B]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80"></span>
                  <span className="ml-2 font-mono text-[11px] text-[#9A9E98] tracking-wider uppercase">
                    TERMINAL // ESCROW_PREVIEW
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#10B981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                  <span>LIVE</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-5 space-y-4">
                {featuredBounty ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#6B7068] uppercase">
                          CONTRACT #BV-{featuredBounty.id.toString().padStart(4, "0")}
                        </span>
                        <h3 className="text-base font-semibold text-[#F5F5F0] line-clamp-1 mt-0.5">
                          {featuredBounty.title}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${formatStatus(featuredBounty.status).color}`}>
                        {formatStatus(featuredBounty.status).label}
                      </span>
                    </div>

                    {/* Escrow Value Box */}
                    <div className="p-4 rounded-lg bg-[#0B0D0C] border border-[#2B302B] space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-[#9A9E98] font-mono uppercase">Escrow Locked Amount</span>
                        <span className="text-[11px] font-mono text-[#10B981]">Non-Custodial</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold text-[#C6FF4D] tracking-tight">
                          {featuredBounty.reward.toLocaleString()}
                        </span>
                        <span className="text-sm font-mono font-bold text-[#F5F5F0]">ALGO</span>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2.5 rounded bg-[#191D19] border border-[#2B302B]/60">
                        <span className="text-[#6B7068] block">CATEGORY</span>
                        <span className="text-[#F5F5F0] truncate block">{featuredBounty.category || "Development"}</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#191D19] border border-[#2B302B]/60">
                        <span className="text-[#6B7068] block">STATUS</span>
                        <span className="text-[#F5F5F0] block capitalize">{featuredBounty.status}</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#191D19] border border-[#2B302B]/60">
                        <span className="text-[#6B7068] block">POSTER</span>
                        <span className="text-[#F5F5F0] truncate block">{featuredBounty.poster_name || "Protocol Client"}</span>
                      </div>
                      <div className="p-2.5 rounded bg-[#191D19] border border-[#2B302B]/60">
                        <span className="text-[#6B7068] block">FINALITY</span>
                        <span className="text-[#10B981] block">Instant (&lt;3.3s)</span>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => onNavigate("bounties")}
                      className="w-full py-2.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] hover:border-[#C6FF4D] text-xs font-semibold text-[#F5F5F0] flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
                    >
                      <span>View Live Escrow Details</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#C6FF4D]" />
                    </button>
                  </>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-xs font-mono text-[#6B7068]">CONNECTING TO ALGORAND ESCROW REGISTRY...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Compact Metrics Strip Below Hero (Real Backend Data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1 */}
          <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9E98] block">
              Active Escrows
            </span>
            <div className="text-2xl font-mono font-bold text-[#F5F5F0] mt-1">
              {stats ? (stats.bounties.open + stats.bounties.acquired) : "—"}
            </div>
            <span className="text-[10px] text-[#6B7068] mt-0.5 block">
              Smart contracts initialized
            </span>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9E98] block">
              Total Escrow Volume
            </span>
            <div className="text-2xl font-mono font-bold text-[#C6FF4D] mt-1">
              {stats ? `${stats.transactions.volume.toLocaleString()} ALGO` : "—"}
            </div>
            <span className="text-[10px] text-[#6B7068] mt-0.5 block">
              On-chain locked & settled
            </span>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9E98] block">
              Settled Bounties
            </span>
            <div className="text-2xl font-mono font-bold text-[#10B981] mt-1">
              {stats ? stats.bounties.completed : "—"}
            </div>
            <span className="text-[10px] text-[#6B7068] mt-0.5 block">
              Disbursed to contributors
            </span>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-lg bg-[#141715] border border-[#2B302B]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A9E98] block">
              Arbitration Queue
            </span>
            <div className="text-2xl font-mono font-bold text-[#F5F5F0] mt-1">
              {stats ? `${stats.disputes.open} open` : "—"}
            </div>
            <span className="text-[10px] text-[#6B7068] mt-0.5 block">
              On-chain dispute resolution
            </span>
          </div>
        </div>
      </section>

      {/* 3. The Bounty Marketplace - Main Attraction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2B302B] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#C6FF4D] uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-[#C6FF4D]"></span>
              <span>LIVE OPPORTUNITY LEDGER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight">
              Bounty Marketplace
            </h2>
            <p className="text-xs text-[#9A9E98] mt-1">
              Verified tasks with guaranteed funds locked in smart contract escrow.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#6B7068]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141715] border border-[#2B302B] text-xs text-[#F5F5F0] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C6FF4D]"
            >
              <option value="highest">Highest Reward</option>
              <option value="newest">Recently Posted</option>
              <option value="deadline">Expiring Soon</option>
            </select>
            <button
              onClick={() => onNavigate("bounties")}
              className="px-3 py-1.5 rounded-md bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-xs font-medium text-[#F5F5F0] transition-colors flex items-center gap-1.5"
            >
              <span>Full View</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C6FF4D]" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] ${
                selectedCategory === cat
                  ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                  : "bg-[#141715] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Bounties List / Table Display */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-[#141715] border border-[#2B302B] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredBounties.length > 0 ? (
          <div className="space-y-2.5">
            {filteredBounties.slice(0, 6).map((bounty) => {
              const status = formatStatus(bounty.status);
              return (
                <div
                  key={bounty.id}
                  onClick={() => onNavigate("bounties")}
                  className="group bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] rounded-lg p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onNavigate("bounties");
                    }
                  }}
                >
                  {/* Left info: Title and unboxed metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#6B7068]">
                        #{bounty.id.toString().padStart(4, "0")}
                      </span>
                      <span className="text-[11px] text-[#6B7068]">·</span>
                      <span className="text-xs text-[#9A9E98] font-medium">{bounty.category || "General"}</span>
                      {bounty.deadline && (
                        <>
                          <span className="text-[11px] text-[#6B7068]">·</span>
                          <span className="text-xs text-[#9A9E98] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[#6B7068]" />
                            {new Date(bounty.deadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors truncate">
                      {bounty.title}
                    </h3>
                    <p className="text-xs text-[#9A9E98] line-clamp-1 max-w-3xl">
                      {bounty.description}
                    </p>
                  </div>

                  {/* Right: Reward & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#2B302B]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-mono uppercase text-[#6B7068] block">Locked Escrow</span>
                      <div className="flex items-baseline gap-1 md:justify-end">
                        <span className="text-xl font-mono font-bold text-[#C6FF4D] tracking-tight">
                          {bounty.reward.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#F5F5F0]">ALGO</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("bounties");
                      }}
                      className="px-3.5 py-1.5 rounded-md bg-[#191D19] group-hover:bg-[#C6FF4D] group-hover:text-[#0B0D0C] border border-[#2B302B] group-hover:border-[#C6FF4D] text-xs font-semibold text-[#F5F5F0] transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#141715] border border-[#2B302B] rounded-lg space-y-3">
            <FilterX className="w-8 h-8 text-[#6B7068] mx-auto" />
            <h4 className="text-sm font-semibold text-[#F5F5F0]">No matching bounties located</h4>
            <p className="text-xs text-[#9A9E98] max-w-sm mx-auto">
              No tasks match your active filters. Try searching for broader terms or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-3 py-1.5 rounded-md bg-[#191D19] border border-[#2B302B] text-xs text-[#C6FF4D] font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View All Marketplace CTA */}
        {filteredBounties.length > 6 && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate("bounties")}
              className="px-6 py-2.5 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-xs font-semibold text-[#F5F5F0] transition-colors inline-flex items-center gap-2"
            >
              <span>View All {bounties.length} Available Bounties</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C6FF4D]" />
            </button>
          </div>
        )}
      </section>

      {/* 4. Compact 3-Step "How It Works" Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-left border-b border-[#2B302B] pb-4">
          <span className="text-xs font-mono text-[#C6FF4D] uppercase">PROTOCOL WORKFLOW</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F0] tracking-tight mt-0.5">
            How BountyVault Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#C6FF4D]">01 // ESCROW</span>
              <Lock className="w-4 h-4 text-[#9A9E98]" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F0]">Lock in Smart Escrow</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Poster creates a task specification and funds the reward in ALGO directly to an Algorand smart contract escrow. Funds are locked non-custodially.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#C6FF4D]">02 // DELIVER</span>
              <FileCode className="w-4 h-4 text-[#9A9E98]" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F0]">Ship Verified Work</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Worker applies, gets selected, and completes the technical milestones. Work is submitted on-chain with cryptographic repo or artifact proof.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-lg bg-[#141715] border border-[#2B302B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#C6FF4D]">03 // SETTLE</span>
              <ShieldCheck className="w-4 h-4 text-[#9A9E98]" />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F0]">Release or Arbitrate</h3>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Upon approval, escrow releases funds directly to the contributor's Algorand address. In case of disagreement, neutral arbitrators resolve with irrevocable ruling.
            </p>
          </div>
        </div>

        {/* Learn & Simulator Callout */}
        <div className="p-6 rounded-xl bg-[#0B0D0C] border border-[#2B302B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                Interactive Academy
              </span>
              <span className="text-xs text-[#9A9E98]">Beginner Friendly</span>
            </div>
            <h4 className="text-sm font-bold text-[#F5F5F0]">
              Want to see smart escrow in action before transacting?
            </h4>
            <p className="text-xs text-[#9A9E98] leading-relaxed max-w-2xl">
              Launch our risk-free educational simulation sandbox, test happy and dispute workflows, or study blockchain fundamentals and safe wallet hygiene.
            </p>
          </div>
          <button
            onClick={() => onNavigate("learn")}
            className="px-4 py-2 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#C6FF4D] text-xs font-semibold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Visit Learn Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. Bottom Architectural Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-xl bg-[#141715] border border-[#2B302B] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-[#F5F5F0]">Ready to deploy task escrows?</h3>
            <p className="text-xs text-[#9A9E98]">
              Connect your Algorand wallet to post your first bounty or start claiming rewards.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("auth")}
              className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D]"
            >
              Get Started Now
            </button>
            <button
              onClick={() => onNavigate("bounties")}
              className="px-4 py-2.5 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-medium text-[#F5F5F0] hover:bg-[#202520] transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
