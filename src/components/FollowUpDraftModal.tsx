import { useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Send, X } from "lucide-react";
import { JobApplication } from "../types/hireloop";
import { diffDaysISO, getTodayISO } from "../utils/dateUtils";

interface FollowUpDraftModalProps {
  app: JobApplication | null;
  onClose: () => void;
  onMarkSent: (appId: string, subject: string) => void;
}

export function FollowUpDraftModal({
  app,
  onClose,
  onMarkSent,
}: FollowUpDraftModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateDraft = async (target: JobApplication) => {
    setLoading(true);
    setError(null);
    const today = getTodayISO();
    const daysIdle = Math.max(
      0,
      diffDaysISO(today, (target.lastActivityAt || target.appliedDate).slice(0, 10))
    );

    try {
      const res = await fetch("/api/coach/followup-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: target.company,
          role: target.role,
          stage: target.stage,
          contactName: target.contactName,
          daysIdle,
          followUpType:
            target.stage === "Interview"
              ? "interview_follow_up"
              : "application_check_in",
          notes: target.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to draft follow-up message.");
      }
      setSubject(data.subject || `Following up: ${target.role} at ${target.company}`);
      setBody(data.body || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to draft message.";
      setError(msg);
      setSubject(`Following up on ${target.role} application — ${target.company}`);
      setBody(
        `Hi ${target.contactName || "Hiring Team"},\n\nI hope your week is going well. I wanted to briefly check in regarding my application for the ${target.role} role at ${target.company}. I remain very excited about the opportunity to contribute to your team and would be happy to share any additional context.\n\nThank you for your time and consideration!\n\nBest regards`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (app) {
      setCopied(false);
      generateDraft(app);
    }
  }, [app]);

  if (!app) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="followup-draft-title"
    >
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="followup-draft-title"
              className="font-display text-base sm:text-lg font-semibold text-[#0F172A]"
            >
              Follow-up Draft · {app.company}
            </h2>
            <p className="text-xs text-slate-500">
              {app.role} {app.contactName ? `· To ${app.contactName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close follow-up drafter"
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              Using editable template ({error}).
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin text-[#4338CA]" />
              <p className="text-sm font-medium">
                Drafting a tailored follow-up for {app.company}...
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm leading-relaxed text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => generateDraft(app)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onMarkSent(app.id, subject);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Mark Sent & Reschedule (+5d)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
