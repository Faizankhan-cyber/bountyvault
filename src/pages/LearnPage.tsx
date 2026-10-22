import React, { useState, useEffect, useMemo } from "react";
import {
  LESSONS,
  LEARNING_TRACKS,
  Lesson,
  GLOSSARY_TERMS
} from "../data/learnContent";
import { LessonViewer } from "../components/learn/LessonViewer";
import { InteractiveEscrowWalkthrough } from "../components/learn/InteractiveEscrowWalkthrough";
import { GlossaryViewer } from "../components/learn/GlossaryViewer";
import {
  BookOpen,
  Search,
  Sparkles,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  BookA,
  Compass,
  Code2,
  Lock,
  ChevronRight,
  Filter,
  Check,
  X
} from "lucide-react";

interface LearnPageProps {
  initialLessonId?: string;
  onNavigate: (view: string, searchParam?: string) => void;
}

interface UserProgress {
  completedLessonIds: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  lastVisitedLessonId?: string;
}

const STORAGE_KEY = "bountyvault_learn_v1";

export const LearnPage: React.FC<LearnPageProps> = ({ initialLessonId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<"hub" | "walkthrough" | "glossary" | "lesson">("hub");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(initialLessonId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // User learning progress stored locally
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return { completedLessonIds: [], quizScores: {} };
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore
    }
  }, [progress]);

  // If initialLessonId passed, open that lesson directly
  useEffect(() => {
    if (initialLessonId) {
      setSelectedLessonId(initialLessonId);
      setActiveTab("lesson");
    }
  }, [initialLessonId]);

  const toggleLessonComplete = (lessonId: string) => {
    setProgress((prev) => {
      const exists = prev.completedLessonIds.includes(lessonId);
      const updated = exists
        ? prev.completedLessonIds.filter((id) => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      return { ...prev, completedLessonIds: updated };
    });
  };

  const saveQuizScore = (lessonId: string, score: number, total: number) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [lessonId]: { score, total, date: new Date().toISOString() },
      },
    }));
  };

  const resetAllProgress = () => {
    if (window.confirm("Reset all learning progress and quiz scores?")) {
      setProgress({ completedLessonIds: [], quizScores: {} });
    }
  };

  const handleOpenLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeLesson = useMemo(() => {
    return LESSONS.find((l) => l.id === selectedLessonId) || null;
  }, [selectedLessonId]);

  const filteredLessons = useMemo(() => {
    return LESSONS.filter((lesson) => {
      const matchesSearch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === "All" || lesson.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, selectedDifficulty]);

  const completionPercentage = Math.round(
    (progress.completedLessonIds.length / LESSONS.length) * 100
  );

  return (
    <div className="min-h-screen text-[#9A9E98] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Tabs (Hub / Interactive Walkthrough / Glossary / Lesson) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2B302B]">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141715] border border-[#2B302B] text-xs">
            <button
              onClick={() => {
                setActiveTab("hub");
                setSelectedLessonId(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "hub"
                  ? "bg-[#C6FF4D] text-[#0B0D0C] shadow-sm"
                  : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> All Lessons & Paths
            </button>
            <button
              onClick={() => {
                setActiveTab("walkthrough");
                setSelectedLessonId(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "walkthrough"
                  ? "bg-[#C6FF4D] text-[#0B0D0C] shadow-sm"
                  : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Interactive Escrow Simulation
            </button>
            <button
              onClick={() => {
                setActiveTab("glossary");
                setSelectedLessonId(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "glossary"
                  ? "bg-[#C6FF4D] text-[#0B0D0C] shadow-sm"
                  : "text-[#9A9E98] hover:text-[#F5F5F0]"
              }`}
            >
              <BookA className="w-3.5 h-3.5" /> Web3 Glossary
            </button>
          </div>

          {/* User Progress Badge in Top Bar */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141715] border border-[#2B302B]">
              <span className="text-[#9A9E98]">Completed:</span>
              <span className="font-mono text-[#F5F5F0] font-bold">
                {progress.completedLessonIds.length} / {LESSONS.length}
              </span>
              <div className="w-16 h-1.5 rounded-full bg-[#2B302B] overflow-hidden ml-1">
                <div
                  className="h-full bg-[#10B981] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {progress.completedLessonIds.length > 0 && (
              <button
                onClick={resetAllProgress}
                className="text-[11px] text-[#6B7068] hover:text-[#EF4444] transition-colors"
                title="Reset progress"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Individual Lesson Reading Mode */}
        {activeTab === "lesson" && activeLesson && (
          <LessonViewer
            lesson={activeLesson}
            onSelectLesson={(id) => handleOpenLesson(id)}
            onBackToHub={() => {
              setActiveTab("hub");
              setSelectedLessonId(null);
            }}
            isCompleted={progress.completedLessonIds.includes(activeLesson.id)}
            onToggleComplete={toggleLessonComplete}
            quizScore={progress.quizScores[activeLesson.id]}
            onSaveQuizScore={saveQuizScore}
          />
        )}

        {/* View Mode 2: Interactive Simulation Sandbox */}
        {activeTab === "walkthrough" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                  Interactive Sandbox
                </span>
                <span className="text-xs text-[#9A9E98]">BountyVault State Machine</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
                Simulated Escrow Lifecycle Walkthrough
              </h2>
              <p className="text-xs md:text-sm text-[#9A9E98] max-w-3xl leading-relaxed">
                Step through every transaction phase of a decentralized bounty. Explore the happy path from creation to release, or switch to the dispute arbitration path to observe how non-custodial smart contracts protect both parties.
              </p>
            </div>

            <InteractiveEscrowWalkthrough />
          </div>
        )}

        {/* View Mode 3: Web3 Glossary */}
        {activeTab === "glossary" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                  Terminology Guide
                </span>
                <span className="text-xs text-[#9A9E98]">
                  {GLOSSARY_TERMS.length} Curated Definitions
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
                The Decentralized Bounty Glossary
              </h2>
              <p className="text-xs md:text-sm text-[#9A9E98] max-w-3xl leading-relaxed">
                Clear, precise definitions for every foundational concept in Algorand smart contracts, atomic groups, cryptographic key pairs, and dispute protocols.
              </p>
            </div>

            <GlossaryViewer onNavigateToTopic={(topicId) => handleOpenLesson(topicId)} />
          </div>
        )}

        {/* View Mode 4: Main Learn Hub */}
        {activeTab === "hub" && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="p-8 md:p-12 rounded-2xl bg-[#141715] border border-[#2B302B] relative overflow-hidden space-y-6">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#191D19] border border-[#2B302B] text-xs font-semibold text-[#C6FF4D]">
                  <Sparkles className="w-3.5 h-3.5" />
                  BountyVault Academy
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F5F5F0] tracking-tight leading-tight">
                  Understand the technology <br className="hidden sm:inline" />
                  <span className="text-[#C6FF4D]">behind the bounty.</span>
                </h1>
                <p className="text-sm md:text-base text-[#9A9E98] leading-relaxed max-w-2xl">
                  Decentralized escrow replaces blind trust with mathematical verification. Learn how distributed ledgers, Algorand smart contracts, and independent dispute arbitration safeguard contributors and clients alike.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenLesson("blockchain-fundamentals")}
                    className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                  >
                    Start with Lesson 1 <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab("walkthrough")}
                    className="px-4 py-2.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] hover:border-[#3D443D] text-xs font-semibold text-[#F5F5F0] transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#C6FF4D]" /> Launch Escrow Simulator
                  </button>
                  <button
                    onClick={() => setActiveTab("glossary")}
                    className="px-4 py-2.5 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] hover:border-[#3D443D] text-xs font-semibold text-[#9A9E98] hover:text-[#F5F5F0] transition-colors flex items-center gap-2"
                  >
                    <BookA className="w-4 h-4" /> Glossary ({GLOSSARY_TERMS.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Learning Paths */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#F5F5F0] tracking-tight">
                    Recommended Learning Paths
                  </h2>
                  <p className="text-xs text-[#9A9E98]">
                    Organized by difficulty to take you from foundational concepts to advanced security.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {LEARNING_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            track.difficulty === "Beginner"
                              ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                              : track.difficulty === "Intermediate"
                              ? "bg-[#C6FF4D]/15 text-[#C6FF4D] border border-[#C6FF4D]/30"
                              : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                          }`}
                        >
                          {track.difficulty}
                        </span>
                        <span className="text-[11px] text-[#9A9E98] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {track.duration}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-xs text-[#9A9E98] leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#2B302B]">
                      <span className="text-[10px] font-bold uppercase text-[#6B7068] tracking-wider block">
                        Included Lessons:
                      </span>
                      <div className="space-y-1.5">
                        {track.lessonIds.map((lid) => {
                          const l = LESSONS.find((item) => item.id === lid);
                          if (!l) return null;
                          const isDone = progress.completedLessonIds.includes(lid);
                          return (
                            <button
                              key={lid}
                              onClick={() => handleOpenLesson(lid)}
                              className="w-full text-left p-2 rounded-lg bg-[#0B0D0C] hover:bg-[#191D19] border border-[#2B302B] text-xs flex items-center justify-between text-[#9A9E98] hover:text-[#F5F5F0] transition-colors"
                            >
                              <span className="truncate pr-2">{l.title}</span>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-[#6B7068] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Filter Header for All Topics */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#F5F5F0] tracking-tight">
                    All Core Lessons & Topics
                  </h2>
                  <p className="text-xs text-[#9A9E98]">
                    Explore self-contained lessons featuring visual diagrams and knowledge quizzes.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#6B7068] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search lessons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-64 pl-8 pr-3 py-1.5 bg-[#141715] border border-[#2B302B] focus:border-[#C6FF4D] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-[#141715] border border-[#2B302B] rounded-lg text-xs text-[#F5F5F0] px-3 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => {
                  const isDone = progress.completedLessonIds.includes(lesson.id);
                  const quizResult = progress.quizScores[lesson.id];

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleOpenLesson(lesson.id)}
                      className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] cursor-pointer transition-all flex flex-col justify-between space-y-4 group relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              lesson.difficulty === "Beginner"
                                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                : lesson.difficulty === "Intermediate"
                                ? "bg-[#C6FF4D]/15 text-[#C6FF4D] border border-[#C6FF4D]/30"
                                : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                            }`}
                          >
                            {lesson.difficulty}
                          </span>
                          <span className="text-[11px] text-[#9A9E98] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {lesson.readTime}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-[#C6FF4D] font-medium">{lesson.subtitle}</p>
                        <p className="text-xs text-[#9A9E98] leading-relaxed line-clamp-3">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#2B302B] flex items-center justify-between text-xs">
                        {isDone ? (
                          <span className="flex items-center gap-1 text-[#10B981] font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="text-[#6B7068] text-[11px]">Not Started</span>
                        )}

                        <span className="text-[#C6FF4D] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                          Read Lesson <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Practical Connection Callout to Real BountyVault Marketplace */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#0B0D0C] border border-[#2B302B] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C6FF4D]" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#F5F5F0]">
                    Ready to apply what you've learned?
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#F5F5F0]">
                  Explore Real Bounties on Algorand Testnet
                </h3>
                <p className="text-xs text-[#9A9E98] leading-relaxed">
                  Browse open development and design bounties, connect your Pera Wallet, or create a bounty to experience non-custodial escrow in action.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigate("bounties")}
                  className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] text-xs font-semibold shadow-sm transition-colors"
                >
                  View Marketplace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
