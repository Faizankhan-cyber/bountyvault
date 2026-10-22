import React, { useState, useMemo } from "react";
import { LESSONS, GLOSSARY_TERMS, Lesson, GlossaryTerm } from "../data/learnData";
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Coins, 
  Lock, 
  ShieldCheck, 
  FileCode, 
  HelpCircle,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  BookMarked
} from "lucide-react";

interface LearnPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [glossaryCategory, setGlossaryCategory] = useState<string>("all");

  // Read completed lessons from localStorage
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("bountyvault_completed_lessons");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const resetProgress = () => {
    if (confirm("Reset your learning progress records?")) {
      setCompletedLessons([]);
      try {
        localStorage.removeItem("bountyvault_completed_lessons");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLessons = useMemo(() => {
    let list = [...LESSONS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subtitle.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (difficultyFilter !== "all") {
      list = list.filter((l) => l.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    }

    return list;
  }, [search, difficultyFilter]);

  const filteredGlossary = useMemo(() => {
    let list = [...GLOSSARY_TERMS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.term.toLowerCase().includes(q) ||
          g.definition.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }

    if (glossaryCategory !== "all") {
      list = list.filter((g) => g.category.toLowerCase() === glossaryCategory.toLowerCase());
    }

    return list;
  }, [search, glossaryCategory]);

  const progressPercent = Math.round((completedLessons.length / LESSONS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. Header & Learning Hero */}
      <div className="border-b border-[#2B302B] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141715] border border-[#2B302B] text-xs font-mono text-[#C6FF4D]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>BOUNTYVAULT EDUCATION CENTER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F0]">
          Understand the technology behind the bounty.
        </h1>
        <p className="text-sm sm:text-base text-[#9A9E98] max-w-2xl leading-relaxed">
          From basic cryptographic keys to smart contract invariants and Algorand state proofs. Master the mechanics of decentralized, trustless escrow without technical jargon or hype.
        </p>

        {/* Learning Progress Bar */}
        <div className="pt-4 max-w-xl">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#F5F5F0]">
              Curriculum Progress: <strong className="text-[#C6FF4D]">{completedLessons.length} of {LESSONS.length}</strong> Completed
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#9A9E98]">{progressPercent}%</span>
              {completedLessons.length > 0 && (
                <button
                  onClick={resetProgress}
                  className="text-[10px] text-[#6B7068] hover:text-[#EF4444] transition-colors"
                  title="Reset local progress"
                >
                  (Reset)
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[#141715] border border-[#2B302B] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C6FF4D] to-[#10B981] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Escrow Walkthrough Highlight Card */}
      <div className="bg-gradient-to-r from-[#141715] via-[#191D19] to-[#141715] border border-[#C6FF4D]/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6FF4D]">
            <Sparkles className="w-4 h-4" />
            <span>INTERACTIVE LAB SANDBOX</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
            Step Through an Escrow Lifecycle in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-[#9A9E98] leading-relaxed">
            Experience our isolated, zero-risk educational simulator. Create a simulated bounty, lock test escrow, assign a contributor, and test both the happy approval path and the on-chain dispute arbitration path.
          </p>
        </div>
        <button
          onClick={() => onNavigate("learn-simulation")}
          className="px-5 py-3 rounded-xl bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all shadow-sm"
        >
          <span>Launch Simulator</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
            <input
              type="text"
              placeholder="Search lessons, terms, or security rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141715] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:border-[#C6FF4D] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7068] font-mono">Difficulty:</span>
            {["all", "beginner", "intermediate", "advanced"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  difficultyFilter === d
                    ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                    : "bg-[#141715] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Lesson Directory Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F5F5F0] flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#C6FF4D]" />
            <span>Curriculum Lessons ({filteredLessons.length})</span>
          </h2>
          <span className="text-xs text-[#6B7068] font-mono">
            {completedLessons.length}/{LESSONS.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const isDone = completedLessons.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all hover:shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#C6FF4D]">
                      {lesson.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        lesson.difficulty === "Beginner" 
                          ? "bg-emerald-950/20 text-[#10B981] border-emerald-800/30" 
                          : lesson.difficulty === "Intermediate" 
                          ? "bg-amber-950/20 text-amber-400 border-amber-800/30" 
                          : "bg-purple-950/20 text-purple-400 border-purple-800/30"
                      }`}>
                        {lesson.difficulty}
                      </span>
                      {isDone && (
                        <span title="Completed">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    onClick={() => onNavigate("lesson-detail", lesson.id)}
                    className="font-bold text-lg text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors cursor-pointer leading-snug"
                  >
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-[#9A9E98] line-clamp-3 leading-relaxed">
                    {lesson.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2B302B] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7068] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.readTime} read</span>
                  </div>

                  <button
                    onClick={() => onNavigate("lesson-detail", lesson.id)}
                    className="text-xs font-semibold text-[#F5F5F0] group-hover:text-[#C6FF4D] flex items-center gap-1 transition-colors"
                  >
                    <span>{isDone ? "Review Lesson" : "Start Lesson"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Web3 & Escrow Glossary Section */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B302B] pb-4">
          <div>
            <div className="text-xs font-mono uppercase text-[#C6FF4D] font-bold">
              Essential Definitions
            </div>
            <h3 className="text-2xl font-bold text-[#F5F5F0] mt-0.5">
              Web3 & Escrow Glossary
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {["all", "blockchain", "algorand", "escrow", "security", "cryptography"].map((cat) => (
              <button
                key={cat}
                onClick={() => setGlossaryCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                  glossaryCategory === cat
                    ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                    : "bg-[#0B0D0C] text-[#9A9E98] hover:text-[#F5F5F0] border border-[#2B302B]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5F5F0] text-sm">{item.term}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#9A9E98]">
                  {item.category}
                </span>
              </div>
              <p className="text-[#9A9E98] leading-relaxed">{item.definition}</p>
              <div className="text-[11px] text-[#6B7068] pt-1 border-t border-[#2B302B]/60">
                <strong className="text-[#F5F5F0]">Example:</strong> {item.example}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
