import React, { useState, useEffect } from "react";
import { LESSONS, Lesson, QuizQuestion } from "../data/learnData";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  AlertCircle, 
  Sparkles,
  Info,
  Check,
  X,
  RotateCcw
} from "lucide-react";

interface LessonDetailPageProps {
  lessonId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const LessonDetailPage: React.FC<LessonDetailPageProps> = ({ lessonId, onNavigate }) => {
  const lessonIndex = LESSONS.findIndex((l) => l.id === lessonId);
  const lesson: Lesson | undefined = LESSONS[lessonIndex] || LESSONS[0];

  // Local storage completed lessons
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("bountyvault_completed_lessons");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    // Reset quiz when switching lessons
    setSelectedAnswers({});
    setQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lessonId]);

  const isCompleted = completedLessons.includes(lesson.id);

  const markLessonCompleted = () => {
    if (!completedLessons.includes(lesson.id)) {
      const updated = [...completedLessons, lesson.id];
      setCompletedLessons(updated);
      try {
        localStorage.setItem("bountyvault_completed_lessons", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleCheckQuiz = () => {
    setQuizSubmitted(true);
    // Calculate if user scored well
    let correctCount = 0;
    lesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    if (correctCount >= Math.ceil(lesson.quiz.length / 2)) {
      markLessonCompleted();
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const prevLesson = lessonIndex > 0 ? LESSONS[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < LESSONS.length - 1 ? LESSONS[lessonIndex + 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#9A9E98]">
        <button onClick={() => onNavigate("home")} className="hover:text-[#F5F5F0]">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7068]" />
        <button onClick={() => onNavigate("learn")} className="hover:text-[#F5F5F0]">Learn Center</button>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7068]" />
        <span className="text-[#F5F5F0] truncate font-medium">{lesson.title}</span>
      </div>

      {/* Lesson Header Banner */}
      <div className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#191D19] border border-[#2B302B] text-[#C6FF4D]">
              {lesson.category}
            </span>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded border ${
              lesson.difficulty === "Beginner" 
                ? "bg-emerald-950/20 text-[#10B981] border-emerald-800/30" 
                : lesson.difficulty === "Intermediate" 
                ? "bg-amber-950/20 text-amber-400 border-amber-800/30" 
                : "bg-purple-950/20 text-purple-400 border-purple-800/30"
            }`}>
              {lesson.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#9A9E98] font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6B7068]" />
              <span>{lesson.readTime} read</span>
            </div>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[#10B981] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F0] tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-base sm:text-lg text-[#9A9E98] max-w-3xl leading-relaxed">
            {lesson.subtitle}
          </p>
        </div>

        {/* Key Takeaways Card */}
        <div className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3">
          <div className="text-xs font-mono uppercase text-[#C6FF4D] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Learning Takeaways</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-[#F5F5F0]">
            {lesson.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C6FF4D] font-bold">✓</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Grid: Content (Left 8 cols) + Sticky Table of Contents (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Main Lesson Content */}
        <div className="lg:col-span-8 space-y-10">
          {lesson.sections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F0] tracking-tight">
                {section.title}
              </h2>

              <div className="text-sm text-[#9A9E98] leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {section.content}
              </div>

              {section.codeSnippet && (
                <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#2B302B] font-mono text-xs text-[#C6FF4D] overflow-x-auto">
                  <pre>{section.codeSnippet}</pre>
                </div>
              )}

              {section.callout && (
                <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${
                  section.callout.type === "implementation"
                    ? "bg-[#191D19] border-[#C6FF4D]/40 text-[#F5F5F0]"
                    : section.callout.type === "warning"
                    ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                    : "bg-[#0B0D0C] border-[#2B302B] text-[#9A9E98]"
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {section.callout.type === "implementation" ? (
                      <span className="text-[#C6FF4D] uppercase font-mono text-[11px]">
                        ★ {section.callout.title}
                      </span>
                    ) : (
                      <span className="font-semibold text-[11px] uppercase font-mono">
                        {section.callout.title}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">{section.callout.text}</p>
                </div>
              )}
            </article>
          ))}

          {/* Knowledge Check Quiz Section */}
          <section className="bg-[#141715] border border-[#2B302B] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#2B302B] pb-4">
              <div>
                <div className="text-xs font-mono uppercase text-[#C6FF4D] font-bold">
                  Lesson Assessment
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F0] mt-0.5">
                  Knowledge Check Quiz
                </h3>
              </div>
              {quizSubmitted && (
                <button
                  onClick={handleResetQuiz}
                  className="text-xs text-[#9A9E98] hover:text-[#F5F5F0] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>
              )}
            </div>

            <div className="space-y-6">
              {lesson.quiz.map((q, qIndex) => {
                const userSelected = selectedAnswers[q.id];
                const isAnswered = userSelected !== undefined;
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] space-y-3"
                  >
                    <div className="font-semibold text-xs sm:text-sm text-[#F5F5F0]">
                      {qIndex + 1}. {q.question}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isChosen = userSelected === optIndex;
                        let optionStyle = "bg-[#141715] border-[#2B302B] text-[#9A9E98] hover:border-[#3D443D]";

                        if (isChosen && !quizSubmitted) {
                          optionStyle = "bg-[#191D19] border-[#C6FF4D] text-[#F5F5F0]";
                        } else if (quizSubmitted) {
                          if (optIndex === q.correctIndex) {
                            optionStyle = "bg-emerald-950/30 border-[#10B981] text-[#10B981] font-semibold";
                          } else if (isChosen && !isCorrect) {
                            optionStyle = "bg-rose-950/30 border-[#EF4444] text-rose-300";
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            disabled={quizSubmitted}
                            className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIndex === q.correctIndex && (
                              <Check className="w-4 h-4 text-[#10B981] shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isChosen && !isCorrect && (
                              <X className="w-4 h-4 text-[#EF4444] shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback and Explanation */}
                    {quizSubmitted && isAnswered && (
                      <div className={`p-3 rounded-lg text-xs leading-relaxed mt-2 ${
                        isCorrect ? "bg-emerald-950/20 text-emerald-300" : "bg-[#141715] text-[#9A9E98]"
                      }`}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleCheckQuiz}
                disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                className="w-full py-2.5 rounded-lg bg-[#C6FF4D] hover:bg-[#B4FA32] text-[#0B0D0C] font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                Submit & Verify Answers ({Object.keys(selectedAnswers).length}/{lesson.quiz.length} answered)
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-[#191D19] border border-[#2B302B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#F5F5F0]">
                  Quiz completed! Lesson progress has been recorded locally.
                </span>
                {nextLesson && (
                  <button
                    onClick={() => onNavigate("lesson-detail", nextLesson.id)}
                    className="px-4 py-2 rounded-lg bg-[#C6FF4D] text-[#0B0D0C] font-semibold text-xs flex items-center gap-1.5"
                  >
                    <span>Next: {nextLesson.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Navigation Controls: Previous / Next Lesson */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#2B302B]">
            {prevLesson ? (
              <button
                onClick={() => onNavigate("lesson-detail", prevLesson.id)}
                className="p-4 rounded-xl bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-left transition-colors group flex-1 max-w-xs"
              >
                <div className="text-[10px] font-mono text-[#6B7068] uppercase flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span>Previous Lesson</span>
                </div>
                <div className="font-semibold text-xs text-[#F5F5F0] group-hover:text-[#C6FF4D] truncate mt-1">
                  {prevLesson.title}
                </div>
              </button>
            ) : <div />}

            {nextLesson ? (
              <button
                onClick={() => onNavigate("lesson-detail", nextLesson.id)}
                className="p-4 rounded-xl bg-[#141715] hover:bg-[#191D19] border border-[#2B302B] text-right transition-colors group flex-1 max-w-xs"
              >
                <div className="text-[10px] font-mono text-[#6B7068] uppercase flex items-center justify-end gap-1">
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="font-semibold text-xs text-[#F5F5F0] group-hover:text-[#C6FF4D] truncate mt-1">
                  {nextLesson.title}
                </div>
              </button>
            ) : <div />}
          </div>
        </div>

        {/* Right Sticky Sidebar: Table of Contents & Quick Links */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          
          {/* Table of Contents */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-[#F5F5F0] tracking-wider">
              Table of Contents
            </h4>
            <nav className="space-y-1.5 text-xs">
              {lesson.sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-1 text-[#9A9E98] hover:text-[#C6FF4D] transition-colors truncate"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Quick Interactive Simulation Callout */}
          <div className="bg-[#141715] border border-[#2B302B] rounded-xl p-5 space-y-3">
            <span className="text-[10px] font-mono text-[#C6FF4D] uppercase font-bold">
              Interactive Lab
            </span>
            <h4 className="text-sm font-bold text-[#F5F5F0]">
              Test the Escrow Lifecycle
            </h4>
            <p className="text-xs text-[#9A9E98] leading-relaxed">
              Step through our simulated bounty lifecycle to see how funds lock, assign, and settle.
            </p>
            <button
              onClick={() => onNavigate("learn-simulation")}
              className="w-full py-2 rounded-lg bg-[#191D19] hover:bg-[#202520] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] hover:text-[#C6FF4D] transition-colors"
            >
              Launch Interactive Simulation
            </button>
          </div>

          {/* Return to Learn Hub */}
          <button
            onClick={() => onNavigate("learn")}
            className="w-full py-2.5 rounded-xl bg-[#0B0D0C] border border-[#2B302B] hover:border-[#3D443D] text-xs font-medium text-[#9A9E98] hover:text-[#F5F5F0] transition-colors"
          >
            ← View All Learning Topics
          </button>
        </aside>

      </div>

    </div>
  );
};
