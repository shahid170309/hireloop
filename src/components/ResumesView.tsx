import { useState } from "react";
import { Check, Copy, FileText, Plus } from "lucide-react";
import { JobApplication, ResumeDoc } from "../types/hireloop";
import { formatFullDate, getTodayISO } from "../utils/dateUtils";

interface ResumesViewProps {
  resumes: ResumeDoc[];
  applications: JobApplication[];
  onAddResume: (doc: Omit<ResumeDoc, "id">) => void;
}

export function ResumesView({
  resumes,
  applications,
  onAddResume,
}: ResumesViewProps) {
  const [showNew, setShowNew] = useState(false);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim()) return;
    const highlights = highlightsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onAddResume({
      version: version.trim(),
      title: title.trim(),
      targetRole: targetRole.trim() || "Engineering",
      updatedAt: getTodayISO(),
      highlights:
        highlights.length > 0
          ? highlights
          : ["Tailored impact bullets for target applications"],
    });
    setVersion("");
    setTitle("");
    setTargetRole("");
    setHighlightsText("");
    setShowNew(false);
  };

  const handleCopyHighlights = async (doc: ResumeDoc) => {
    try {
      await navigator.clipboard.writeText(doc.highlights.map((h) => `• ${h}`).join("\n"));
      setCopiedId(doc.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Resume Versions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Keep track of tailored resume variants and see which applications use each version.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNew((prev) => !prev)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-semibold whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Version</span>
        </button>
      </div>

      {showNew && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
        >
          <h2 className="font-display text-base font-semibold text-[#0F172A]">
            Add Resume Version
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Version Tag *
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v2.5 · AI Systems"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4338CA]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="AI Product Engineering"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4338CA]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Senior Product Engineer"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4338CA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Impact Highlights (one per line)
            </label>
            <textarea
              rows={3}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="Reduced latency by 42%...&#10;Led 5-person squad shipping..."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#4338CA]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-[#4338CA] text-white text-xs font-semibold"
            >
              Save Version
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map((doc) => {
          const linkedApps = applications.filter(
            (app) => app.resumeVersion === doc.version
          );

          return (
            <article
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-sm font-semibold text-[#0F172A] truncate">
                        {doc.title}
                      </h2>
                      <p className="text-xs text-slate-500 truncate">
                        {doc.version} · {doc.targetRole}
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  {doc.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#4338CA] font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 tabular-nums">
                  Used in{" "}
                  <strong className="text-[#0F172A]">
                    {linkedApps.length}
                  </strong>{" "}
                  {linkedApps.length === 1 ? "role" : "roles"} · Updated{" "}
                  {formatFullDate(doc.updatedAt)}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyHighlights(doc)}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shrink-0"
                >
                  {copiedId === doc.id ? (
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
            </article>
          );
        })}
      </div>
    </div>
  );
}
