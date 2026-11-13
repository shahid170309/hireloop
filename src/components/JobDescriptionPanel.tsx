import { useEffect, useState } from "react";
import { Check, Copy, FileSearch, Loader2, Send, Sparkles } from "lucide-react";
import { JobApplication, JobDescriptionAnalysis } from "../types/hireloop";
import { getTodayISO } from "../utils/dateUtils";

interface JobDescriptionPanelProps {
  app: JobApplication;
  onSaveAnalysis: (
    appId: string,
    jobDescription: string,
    analysis: JobDescriptionAnalysis
  ) => void;
  onMarkNoteSent?: (appId: string, label: string) => void;
}

export function JobDescriptionPanel({
  app,
  onSaveAnalysis,
  onMarkNoteSent,
}: JobDescriptionPanelProps) {
  const [jdText, setJdText] = useState(app.jobDescription || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setJdText(app.jobDescription || "");
    setError(null);
  }, [app.id, app.jobDescription]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jdText.trim().length < 20) {
      setError("Paste at least 20 characters of the job description to analyze.");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/coach/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: app.company,
          role: app.role,
          contactName: app.contactName,
          stage: app.stage,
          jobDescription: jdText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze job description.");
      }

      const analysis: JobDescriptionAnalysis = {
        requiredSkills: Array.isArray(data.requiredSkills)
          ? data.requiredSkills
          : [],
        interviewQuestions: Array.isArray(data.interviewQuestions)
          ? data.interviewQuestions
          : [],
        recruiterFollowUpNote:
          typeof data.recruiterFollowUpNote === "string"
            ? data.recruiterFollowUpNote
            : "",
        analyzedAt: getTodayISO(),
      };

      onSaveAnalysis(app.id, jdText.trim(), analysis);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not analyze job description."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyNote = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const analysis = app.jdAnalysis;

  return (
    <div className="mt-3 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
          <FileSearch className="w-3.5 h-3.5 text-[#4338CA]" />
          <span>Job Description AI Prep</span>
        </div>
        {analysis && (
          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
            Analyzed {analysis.analyzedAt}
          </span>
        )}
      </div>

      <form onSubmit={handleAnalyze} className="space-y-2">
        <textarea
          rows={3}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here to extract required skills, 3 tailored interview questions, and a recruiter follow-up note..."
          aria-label={`Paste job description for ${app.company}`}
          className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-xs text-[#0F172A] leading-relaxed focus:outline-none focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/15"
        />

        {error && (
          <p className="text-[11px] font-medium text-[#BA1A1A]">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-semibold disabled:opacity-60 transition-colors"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{analysis ? "Re-analyze JD" : "Analyze JD"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {analysis && (
        <div className="pt-2 border-t border-slate-200/80 space-y-3 text-xs">
          {/* 1. Key Required Skills */}
          {analysis.requiredSkills.length > 0 && (
            <div>
              <p className="font-semibold text-slate-700 mb-1.5">
                Key Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-[#0F172A]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. 3 Tailored Interview Questions */}
          {analysis.interviewQuestions.length > 0 && (
            <div>
              <p className="font-semibold text-slate-700 mb-1.5">
                Tailored Interview Questions
              </p>
              <ol className="space-y-1.5 text-slate-700 leading-relaxed">
                {analysis.interviewQuestions.slice(0, 3).map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#4338CA] shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 3. Concise Recruiter Follow-up Note */}
          {analysis.recruiterFollowUpNote && (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-700">
                  Recruiter Follow-up Note
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyNote(analysis.recruiterFollowUpNote)}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#10B981]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  {onMarkNoteSent && (
                    <button
                      type="button"
                      onClick={() =>
                        onMarkNoteSent(
                          app.id,
                          `Sent JD-tailored recruiter note to ${app.contactName || "Hiring Team"}`
                        )
                      }
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] text-[11px] font-semibold"
                    >
                      <Send className="w-3 h-3" />
                      <span>Log Sent</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {analysis.recruiterFollowUpNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
