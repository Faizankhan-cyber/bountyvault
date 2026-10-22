import React, { useState, useEffect } from "react";
import { Lesson, LESSONS } from "../../data/learnContent";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Bookmark,
  Share2,
  Shield,
  Layers,
  ChevronRight,
  Award,
  Sparkles
} from "lucide-react";

interface LessonViewerProps {
  lesson: Lesson;
  onSelectLesson: (lessonId: string) => void;
  onBackToHub: () => void;
  isCompleted: boolean;
  onToggleComplete: (lessonId: string) => void;
  quizScore?: { score: number; total: number; date: string };
  onSaveQuizScore: (lessonId: string, score: number, total: number) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onSelectLesson,
  onBackToHub,
  isCompleted,
  onToggleComplete,
  quizScore,
  onSaveQuizScore,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(lesson.sections[0]?.id || "");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(Boolean(quizScore));
  const [copiedLink, setCopiedLink] = useState(false);

  // Find previous and next lessons
  const currentIndex = LESSONS.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null;

  // Scroll to section handler
  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Scroll spy to update active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const section of lesson.sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSectionId(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lesson]);

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleQuizSubmit = () => {
    let calculatedScore = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });
    setQuizSubmitted(true);
    onSaveQuizScore(lesson.id, calculatedScore, lesson.quiz.length);
    if (!isCompleted && calculatedScore === lesson.quiz.length) {
      onToggleComplete(lesson.id);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const calculateCurrentScore = () => {
    let score = 0;
    lesson.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2B302B]">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onBackToHub}
            className="text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6FF4D] rounded px-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Learn Hub
          </button>
          <span className="text-[#6B7068]">/</span>
          <span className="text-[#9A9E98]">{lesson.category}</span>
          <span className="text-[#6B7068]">/</span>
          <span className="text-[#F5F5F0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {lesson.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mark Complete Button */}
          <button
            onClick={() => onToggleComplete(lesson.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] ${
              isCompleted
                ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]"
                : "bg-[#141715] hover:bg-[#191D19] border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isCompleted ? "Completed" : "Mark as Complete"}
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0] text-xs transition-colors"
            title="Share lesson"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#141715] border border-[#2B302B] space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
              lesson.difficulty === "Beginner"
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : lesson.difficulty === "Intermediate"
                ? "bg-[#C6FF4D]/15 text-[#C6FF4D] border border-[#C6FF4D]/30"
                : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
            }`}
          >
            {lesson.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#9A9E98]">
            <Clock className="w-3.5 h-3.5" /> {lesson.readTime}
          </span>
          <span className="text-xs text-[#6B7068]">•</span>
          <span className="text-xs text-[#9A9E98] font-mono">{lesson.category}</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F0] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-sm md:text-base text-[#C6FF4D] font-medium">{lesson.subtitle}</p>
        <p className="text-xs md:text-sm text-[#9A9E98] leading-relaxed max-w-3xl">
          {lesson.summary}
        </p>
      </div>

      {/* Grid: Sticky Table of Contents (Left) & Detailed Reading Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Table of Contents Column */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 space-y-4">
          <div className="p-4 rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
            <h3 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#C6FF4D]" /> Table of Contents
            </h3>
            <nav className="space-y-1">
              {lesson.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    activeSectionId === section.id
                      ? "bg-[#191D19] text-[#C6FF4D] font-semibold border-l-2 border-[#C6FF4D]"
                      : "text-[#9A9E98] hover:text-[#F5F5F0] hover:bg-[#191D19]/50"
                  }`}
                >
                  <span className="truncate">{section.title}</span>
                  {activeSectionId === section.id && (
                    <ChevronRight className="w-3 h-3 text-[#C6FF4D] shrink-0 ml-1" />
                  )}
                </button>
              ))}

              <button
                onClick={() => scrollToSection("knowledge-quiz")}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between mt-2 pt-2 border-t border-[#2B302B] ${
                  activeSectionId === "knowledge-quiz"
                    ? "bg-[#191D19] text-[#C6FF4D] font-semibold"
                    : "text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-[#C6FF4D]" /> Knowledge Check Quiz
                </span>
                {quizScore && (
                  <span className="text-[10px] font-mono text-[#10B981] px-1 rounded bg-[#10B981]/10">
                    {quizScore.score}/{quizScore.total}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Stats Box */}
          <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-2 text-xs">
            <div className="text-[11px] font-bold text-[#6B7068] uppercase tracking-wider">
              Lesson Overview
            </div>
            <div className="flex justify-between text-[#9A9E98]">
              <span>Sections:</span>
              <span className="text-[#F5F5F0] font-mono">{lesson.sections.length}</span>
            </div>
            <div className="flex justify-between text-[#9A9E98]">
              <span>Quiz Questions:</span>
              <span className="text-[#F5F5F0] font-mono">{lesson.quiz.length}</span>
            </div>
            <div className="flex justify-between text-[#9A9E98]">
              <span>Status:</span>
              <span className={isCompleted ? "text-[#10B981] font-semibold" : "text-[#9A9E98]"}>
                {isCompleted ? "Completed" : "In Progress"}
              </span>
            </div>
          </div>
        </div>

        {/* Lesson Body Content Column */}
        <div className="lg:col-span-3 space-y-10">
          {lesson.sections.map((section, sIndex) => (
            <section
              key={section.id}
              id={section.id}
              className="p-6 md:p-8 rounded-xl bg-[#141715] border border-[#2B302B] space-y-6 scroll-mt-24"
            >
              <h2 className="text-lg md:text-xl font-bold text-[#F5F5F0] tracking-tight">
                {section.title}
              </h2>

              <div className="text-xs md:text-sm text-[#9A9E98] leading-relaxed whitespace-pre-line space-y-4">
                {section.content}
              </div>

              {/* Optional Diagram / Infographic Block */}
              {section.diagram && (
                <div className="mt-6 p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F0] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C6FF4D]" />
                      {section.diagram.title}
                    </span>
                    <span className="text-[11px] text-[#6B7068]">{section.diagram.caption}</span>
                  </div>

                  {section.diagram.items && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {section.diagram.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-lg bg-[#141715] border border-[#2B302B] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#F5F5F0]">{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#191D19] text-[#C6FF4D] border border-[#2B302B]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#9A9E98] leading-relaxed">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.diagram.headers && section.diagram.rows && (
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#2B302B] text-[#6B7068] uppercase text-[10px]">
                            {section.diagram.headers.map((h, i) => (
                              <th key={i} className="pb-2 font-bold px-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2B302B]/60 text-[#9A9E98]">
                          {section.diagram.rows.map((row, rIndex) => (
                            <tr key={rIndex} className="hover:bg-[#141715]/40">
                              {row.map((cell, cIndex) => (
                                <td key={cIndex} className="py-2.5 px-3">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Optional Callout Block */}
              {section.callout && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    section.callout.type === "warning"
                      ? "bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]"
                      : section.callout.type === "bountyvault"
                      ? "bg-[#C6FF4D]/10 border-[#C6FF4D]/40 text-[#C6FF4D]"
                      : "bg-[#141715] border-[#2B302B] text-[#9A9E98]"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-[#F5F5F0] block">
                      {section.callout.title}
                    </span>
                    <p className="text-[#9A9E98] leading-relaxed">{section.callout.text}</p>
                  </div>
                </div>
              )}
            </section>
          ))}

          {/* Section: Knowledge Check Quiz */}
          <section
            id="knowledge-quiz"
            className="p-6 md:p-8 rounded-xl bg-[#141715] border border-[#2B302B] space-y-6 scroll-mt-24"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#2B302B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C6FF4D]/10 border border-[#C6FF4D]/30 flex items-center justify-center text-[#C6FF4D]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F0]">
                    Lesson Knowledge Check
                  </h3>
                  <p className="text-xs text-[#9A9E98]">
                    Verify what you've learned. Immediate answers and explanations provided.
                  </p>
                </div>
              </div>

              {quizSubmitted && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-lg bg-[#191D19] border border-[#2B302B] font-mono text-xs">
                    Score:{" "}
                    <span className="text-[#C6FF4D] font-bold">
                      {calculateCurrentScore()} / {lesson.quiz.length}
                    </span>
                  </div>
                  <button
                    onClick={handleResetQuiz}
                    className="p-1.5 rounded-lg bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0] text-xs transition-colors"
                    title="Retake Quiz"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {lesson.quiz.map((q, qIndex) => {
                const isSelected = selectedAnswers[qIndex] !== undefined;
                const isAnsweredCorrectly = selectedAnswers[qIndex] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#191D19] border border-[#2B302B] text-[11px] font-bold text-[#C6FF4D] flex items-center justify-center shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <h4 className="text-xs md:text-sm font-semibold text-[#F5F5F0] leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 pt-1 pl-7">
                      {q.options.map((opt, optIndex) => {
                        const isThisSelected = selectedAnswers[qIndex] === optIndex;
                        const isCorrectOption = optIndex === q.correctIndex;

                        let buttonStyle =
                          "bg-[#141715] border-[#2B302B] text-[#9A9E98] hover:border-[#3D443D] hover:text-[#F5F5F0]";

                        if (quizSubmitted) {
                          if (isCorrectOption) {
                            buttonStyle = "bg-[#10B981]/15 border-[#10B981] text-[#F5F5F0] font-semibold";
                          } else if (isThisSelected && !isCorrectOption) {
                            buttonStyle = "bg-[#EF4444]/15 border-[#EF4444] text-[#F5F5F0]";
                          } else {
                            buttonStyle = "bg-[#141715]/40 border-[#2B302B]/40 text-[#6B7068]";
                          }
                        } else if (isThisSelected) {
                          buttonStyle = "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0] font-semibold";
                        }

                        return (
                          <button
                            key={optIndex}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(qIndex, optIndex)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${buttonStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isThisSelected && !isCorrectOption && (
                              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation (shown after selection or submission) */}
                    {(quizSubmitted || isSelected) && (
                      <div className="mt-3 pl-7 pt-2 border-t border-[#2B302B]/60 text-xs">
                        <span className="font-semibold text-[#F5F5F0] block mb-1">
                          {isAnsweredCorrectly ? "✓ Correct!" : "Explanation:"}
                        </span>
                        <p className="text-[#9A9E98] leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Submit button */}
            {!quizSubmitted && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                  className="px-5 py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] disabled:opacity-40 text-xs font-semibold shadow-sm transition-colors"
                >
                  Submit Answers & View Score
                </button>
              </div>
            )}
          </section>

          {/* Navigation Controls: Previous / Next Lesson */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#2B302B]">
            {prevLesson ? (
              <button
                onClick={() => onSelectLesson(prevLesson.id)}
                className="p-4 rounded-xl bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-[11px] text-[#9A9E98] mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Previous Lesson
                </div>
                <div className="font-bold text-xs text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors">
                  {prevLesson.title}
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => onSelectLesson(nextLesson.id)}
                className="p-4 rounded-xl bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] hover:border-[#3D443D] text-right transition-all group sm:ml-auto w-full"
              >
                <div className="flex items-center justify-end gap-1.5 text-[11px] text-[#9A9E98] mb-1">
                  Next Lesson
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-xs text-[#F5F5F0] group-hover:text-[#C6FF4D] transition-colors">
                  {nextLesson.title}
                </div>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
