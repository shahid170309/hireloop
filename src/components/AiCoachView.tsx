import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import {
  CoachEvaluation,
  CoachQuestion,
  CoachSessionItem,
  JobApplication,
} from "../types/hireloop";
import { formatShortDate } from "../utils/dateUtils";

interface AiCoachViewProps {
  applications: JobApplication[];
  selectedAppId: string | null;
  onSelectAppId: (id: string | null) => void;
  sessions: CoachSessionItem[];
  onSaveSession: (item: CoachSessionItem) => void;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const WAVE_BARS = [16, 28, 42, 24, 38, 48, 30, 20, 44, 34, 22, 40, 26, 18, 36, 28];

export function AiCoachView({
  applications,
  selectedAppId,
  onSelectAppId,
  sessions,
  onSaveSession,
}: AiCoachViewProps) {
  const activeApps = applications.filter((a) => a.stage !== "Archived");
  const selectedApp =
    activeApps.find((a) => a.id === selectedAppId) || activeApps[0] || null;

  const [customCompany, setCustomCompany] = useState(selectedApp?.company || "Stripe");
  const [customRole, setCustomRole] = useState(
    selectedApp?.role || "Senior Frontend Engineer"
  );
  const [round, setRound] = useState(
    selectedApp?.interviewRound || "Behavioral & Architecture"
  );

  const [questionData, setQuestionData] = useState<CoachQuestion>({
    question:
      "Tell me about a time you redesigned a complex user workflow or system under tight reliability constraints. How did you balance speed with long-term maintainability?",
    category: "Behavioral & Systems",
    interviewerIntent:
      "Evaluating technical ownership, trade-off articulation, and measurable user or reliability impact.",
    prepHints: [
      "Frame the baseline bottleneck or reliability risk in 2 sentences",
      "Detail your specific architectural decision vs. alternatives considered",
      "Close with concrete before/after metrics (latency, error rate, adoption)",
    ],
  });

  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [generatingQ, setGeneratingQ] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CoachEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveStep, setWaveStep] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (selectedApp) {
      setCustomCompany(selectedApp.company);
      setCustomRole(selectedApp.role);
      setRound(selectedApp.interviewRound || `${selectedApp.stage} Round`);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setWaveStep((prev) => (prev + 1) % 100);
    }, 160);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoicePractice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    setSpeechNotice(null);
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsRecording(true);
      setSpeechNotice(
        "Voice waveform timer active — type or paste your spoken notes below in browsers without SpeechRecognition."
      );
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setAnswer(transcript.trim());
      };
      rec.onerror = () => {
        setSpeechNotice("Microphone unavailable in preview — continue typing your response below.");
        setIsRecording(false);
      };
      rec.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch {
      setIsRecording(true);
      setSpeechNotice("Practice timer started — type your response below.");
    }
  };

  const handleGenerateQuestion = async (followUpPrompt?: string) => {
    setGeneratingQ(true);
    setError(null);
    setEvaluation(null);

    if (followUpPrompt) {
      setQuestionData({
        question: followUpPrompt,
        category: "Follow-up Probe",
        interviewerIntent:
          "Testing depth of ownership and how you handle edge cases under scrutiny.",
        prepHints: [
          "Stay concise and anchored to the specific scenario you just shared",
          "Name concrete trade-offs or metrics directly",
        ],
      });
      setAnswer("");
      setGeneratingQ(false);
      return;
    }

    try {
      const res = await fetch("/api/coach/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: customCompany,
          role: customRole,
          round,
          stage: selectedApp?.stage || "Interview",
          notes: selectedApp?.notes,
          previousQuestions: [questionData.question],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate interview question.");
      }
      setQuestionData(data);
      setAnswer("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to generate question.");
    } finally {
      setGeneratingQ(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().length < 5) {
      setError("Write or dictate at least a short response before requesting coaching feedback.");
      return;
    }

    if (isRecording) {
      toggleVoicePractice();
    }

    setEvaluating(true);
    setError(null);

    try {
      const res = await fetch("/api/coach/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: customCompany,
          role: customRole,
          round,
          question: questionData.question,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate response.");
      }
      setEvaluation(data);
      onSaveSession({
        id: `coach-${Date.now()}`,
        applicationId: selectedApp?.id,
        company: customCompany,
        role: customRole,
        round,
        question: questionData.question,
        answer,
        evaluation: data,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation request failed.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            AI Interview Coach
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tailored mock prompts, STAR structure feedback, and voice cadence practice for your active roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Practice Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {/* Target Role Selector */}
          <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tracked Application
                </label>
                <select
                  value={selectedApp?.id || ""}
                  onChange={(e) => onSelectAppId(e.target.value || null)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                >
                  {activeApps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company} — {a.role}
                    </option>
                  ))}
                  {activeApps.length === 0 && (
                    <option value="">Custom Practice Session</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target Company & Role
                </label>
                <input
                  type="text"
                  value={`${customCompany} · ${customRole}`}
                  onChange={(e) => {
                    const parts = e.target.value.split("·");
                    setCustomCompany((parts[0] || "").trim());
                    if (parts[1] !== undefined) {
                      setCustomRole(parts.slice(1).join("·").trim());
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Interview Round
                </label>
                <input
                  type="text"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>
            </div>
          </section>

          {/* Active Question Card */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#E0E7FF]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{questionData.category}</span>
              </span>

              <button
                type="button"
                onClick={() => handleGenerateQuestion()}
                disabled={generatingQ}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A] disabled:opacity-60 transition-colors"
              >
                {generatingQ ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>New Question</span>
              </button>
            </div>

            <h2 className="font-display text-lg sm:text-xl font-semibold text-[#0F172A] leading-snug">
              {questionData.question}
            </h2>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                What the interviewer is listening for
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {questionData.interviewerIntent}
              </p>
              <ul className="pt-1 space-y-1">
                {questionData.prepHints.map((hint, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="font-mono text-[#4338CA] font-semibold">
                      0{idx + 1}.
                    </span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Audio Coach Waveform Bar */}
            <div className="rounded-xl bg-[#0F172A] text-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoicePractice}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isRecording
                      ? "bg-[#10B981] text-white"
                      : "bg-[#4338CA] hover:bg-[#4F46E5] text-white"
                  }`}
                  aria-label={isRecording ? "Stop voice practice" : "Start voice practice"}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {isRecording ? "Listening to your response..." : "Voice Practice Mode"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {isRecording
                      ? "Speak naturally using STAR structure"
                      : "Tap mic to dictate or type your answer below"}
                  </p>
                </div>
              </div>

              {/* Dynamic Waveform Bars */}
              <div
                className="flex items-center gap-1 h-10 px-2"
                aria-hidden="true"
              >
                {WAVE_BARS.map((baseH, idx) => {
                  const height = isRecording
                    ? 10 + ((baseH + waveStep * (idx + 3)) % 28)
                    : Math.max(6, Math.round(baseH * 0.35));
                  const barColor =
                    isRecording && idx % 3 === 0 ? "bg-[#10B981]" : "bg-[#6366F1]";
                  return (
                    <span
                      key={idx}
                      style={{ height: `${height}px` }}
                      className={`w-1 rounded-full transition-all duration-150 ${barColor}`}
                    />
                  );
                })}
              </div>
            </div>

            {speechNotice && (
              <p className="text-xs text-slate-500">{speechNotice}</p>
            )}

            {/* Answer Input & Submit */}
            <form onSubmit={handleEvaluate} className="space-y-3">
              <textarea
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Draft or speak your response here (Situation, Task, Action, and measurable Result)..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-[#0F172A] leading-relaxed focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              />

              {error && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#BA1A1A]">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 tabular-nums">
                  {answer.trim() ? `${answer.trim().split(/\s+/).length} words` : "0 words"}
                </span>
                <button
                  type="submit"
                  disabled={evaluating}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#4F46E5] hover:opacity-95 text-white text-sm font-semibold shadow-[0_4px_14px_rgba(79,70,229,0.35)] disabled:opacity-60 transition-opacity"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Evaluate with AI Coach</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Evaluation Feedback */}
          {evaluation && (
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_4px_12px_rgba(15,23,42,0.06)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A]">
                    Coaching Feedback
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {evaluation.summaryVerdict}
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                  <span className="text-xs font-medium text-[#065F46]">Clarity</span>
                  <span className="font-mono text-lg font-bold text-[#059669] tabular-nums">
                    {evaluation.clarityScore}/100
                  </span>
                </div>
              </div>

              {/* STAR Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    ["Situation", evaluation.starChecklist.situation],
                    ["Task", evaluation.starChecklist.task],
                    ["Action", evaluation.starChecklist.action],
                    ["Result", evaluation.starChecklist.result],
                  ] as const
                ).map(([label, present]) => (
                  <div
                    key={label}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                      present
                        ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <span>{label}</span>
                    <span>{present ? "Covered" : "Add detail"}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-[#059669]">What landed well</p>
                  <ul className="space-y-1.5 text-slate-700">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-[#D97706]">Ways to sharpen</p>
                  <ul className="space-y-1.5 text-slate-700">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-mono text-[#D97706] font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
                <p className="text-xs font-semibold text-[#0F172A]">
                  Polished Impact Phrasing
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  “{evaluation.polishedSnippet}”
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-600">
                  Likely follow-up:{" "}
                  <span className="font-medium text-[#0F172A]">
                    {evaluation.followUpQuestion}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateQuestion(evaluation.followUpQuestion)}
                  className="h-9 px-3.5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-semibold whitespace-nowrap"
                >
                  Practice Follow-up
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Practice History Sidebar */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-[#0F172A]">
              Recent Practice Sessions
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {sessions.length}
            </span>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed py-4">
              Complete a practice answer to build your interview readiness log and track clarity scores over time.
            </p>
          ) : (
            <div className="space-y-2.5">
              {sessions.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#0F172A] truncate">
                      {item.company} · {item.round}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#059669] tabular-nums shrink-0">
                      {item.evaluation.clarityScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.question}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {formatShortDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
