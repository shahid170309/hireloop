import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  FileSearch,
  Hourglass,
  Mail,
  Mic,
  UserCheck,
} from "lucide-react";
import {
  ApplicationStage,
  AppliedStatus,
  JobApplication,
  JobDescriptionAnalysis,
  RecruiterActionType,
} from "../types/hireloop";
import {
  formatShortDate,
  formatTime12h,
  getFollowUpMeta,
  getIdleMeta,
  getTodayISO,
} from "../utils/dateUtils";
import { CompanyAvatar } from "./CompanyAvatar";
import { JobDescriptionPanel } from "./JobDescriptionPanel";

interface ApplicationCardProps {
  app: JobApplication;
  idleThresholdDays: number;
  onSelect: (app: JobApplication) => void;
  onUpdateFollowUpDate: (appId: string, newDate: string) => void;
  onMarkFollowedUp: (appId: string, customLabel?: string) => void;
  onDraftFollowUp: (app: JobApplication) => void;
  onPrepWithCoach: (app: JobApplication) => void;
  onUpdateAppliedStatus: (appId: string, status: AppliedStatus) => void;
  onLogRecruiterAction: (appId: string, action: RecruiterActionType) => void;
  onSaveJdAnalysis: (
    appId: string,
    jobDescription: string,
    analysis: JobDescriptionAnalysis
  ) => void;
}

const STAGE_STYLES: Record<ApplicationStage, string> = {
  Wishlist: "bg-slate-100 text-slate-700 border-slate-200",
  Applied: "bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]",
  Screening: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
  Interview: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Offer: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
  Archived: "bg-slate-100 text-slate-500 border-slate-200",
};

const APPLIED_STATUSES: AppliedStatus[] = [
  "Submitted",
  "Under Review",
  "Recruiter Reached Out",
  "Assessment Sent",
  "Shortlisted",
  "On Hold",
  "Offer Extended",
  "Not Selected",
];

const RECRUITER_ACTIONS: RecruiterActionType[] = [
  "None",
  "Application Viewed",
  "Recruiter Reached Out",
  "Phone Screen Invite",
  "Sent Assessment",
  "Requested Availability",
  "Shared Feedback",
  "Put on Hold",
];

export function ApplicationCard({
  app,
  idleThresholdDays,
  onSelect,
  onUpdateFollowUpDate,
  onMarkFollowedUp,
  onDraftFollowUp,
  onPrepWithCoach,
  onUpdateAppliedStatus,
  onLogRecruiterAction,
  onSaveJdAnalysis,
}: ApplicationCardProps) {
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [showJdPanel, setShowJdPanel] = useState(false);
  const today = getTodayISO();
  const followUpMeta = getFollowUpMeta(app, today);
  const idleMeta = getIdleMeta(app, idleThresholdDays, today);
  const hasUpcomingInterview =
    Boolean(app.interviewDate) &&
    app.stage !== "Archived" &&
    (app.interviewDate as string).slice(0, 10) >= today;

  const isAppliedOrBeyond = app.stage !== "Wishlist";
  const currentAppliedStatus: AppliedStatus =
    app.appliedStatus ||
    (app.stage === "Offer"
      ? "Offer Extended"
      : app.stage === "Interview"
      ? "Shortlisted"
      : app.stage === "Screening"
      ? "Recruiter Reached Out"
      : app.stage === "Archived"
      ? "Not Selected"
      : "Submitted");

  const currentRecruiterAction: RecruiterActionType =
    app.recruiterAction || "None";

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.02)] hover:border-[#CBD5E1] transition-colors flex flex-col justify-between gap-3.5">
      <div>
        {/* Top Row: Company Icon + Role/Company + Stage & Follow-Up Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelect(app)}
            className="flex items-start gap-3 min-w-0 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded-xl"
          >
            <CompanyAvatar company={app.company} size="md" />
            <div className="min-w-0">
              <h3 className="font-display text-[15px] font-semibold text-[#0F172A] group-hover:text-[#4338CA] transition-colors truncate">
                {app.role}
              </h3>
              <p className="text-xs font-medium text-slate-600 truncate">
                {app.company}
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
            {followUpMeta.status === "overdue" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#BA1A1A] border border-[#FECACA] whitespace-nowrap tabular-nums">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue · {followUpMeta.daysDelta}d</span>
              </span>
            )}
            {followUpMeta.status === "due_today" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] whitespace-nowrap">
                <Clock className="w-3 h-3" />
                <span>Due Today</span>
              </span>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STAGE_STYLES[app.stage]}`}
            >
              {app.stage}
            </span>
          </div>
        </div>

        {/* Middle Row: Clean unboxed metadata with typographic separators */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          <span className="font-mono font-medium text-[#0F172A] tabular-nums">
            {app.salaryRange}
            {app.currency ? ` (${app.currency})` : ""}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>
            {app.location} ({app.workMode})
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span className="text-slate-500">{app.resumeVersion}</span>
        </div>

        {/* Applied Application Status & Recruiter Actions */}
        {isAppliedOrBeyond && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 whitespace-nowrap">
                App status ·{" "}
                <span className="font-mono text-[11px] tabular-nums">
                  Applied {formatShortDate(app.appliedDate)}
                </span>
              </span>
              <select
                value={currentAppliedStatus}
                onChange={(e) =>
                  onUpdateAppliedStatus(app.id, e.target.value as AppliedStatus)
                }
                aria-label={`Application status for ${app.company}`}
                className="h-7 px-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              >
                {APPLIED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 min-w-0 text-slate-600">
                <UserCheck className="w-3.5 h-3.5 text-[#4338CA] shrink-0" />
                <span className="truncate">
                  {app.contactName ? app.contactName : "Recruiter"}
                  {app.recruiterActionDate
                    ? ` · ${formatShortDate(app.recruiterActionDate)}`
                    : ""}
                </span>
              </div>

              <select
                value={currentRecruiterAction}
                onChange={(e) =>
                  onLogRecruiterAction(
                    app.id,
                    e.target.value as RecruiterActionType
                  )
                }
                aria-label={`Recruiter action for ${app.company}`}
                className="h-7 max-w-[175px] px-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-[#4338CA] focus:outline-none focus:border-[#4338CA]"
              >
                {RECRUITER_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action === "None" ? "Log recruiter action..." : action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Optional Idle Indicator or Upcoming Interview Row */}
        {(idleMeta.isIdle || hasUpcomingInterview) && (
          <div className="mt-3 space-y-2">
            {hasUpcomingInterview && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                <div className="flex items-center gap-2 text-xs text-slate-700 min-w-0 tabular-nums">
                  <CalendarClock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span className="truncate font-medium">
                    {app.interviewRound || "Interview"} ·{" "}
                    {formatShortDate(app.interviewDate)}
                    {app.interviewTime
                      ? ` at ${formatTime12h(app.interviewTime)}`
                      : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onPrepWithCoach(app)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors"
                >
                  <Mic className="w-3 h-3" />
                  <span>Prep</span>
                </button>
              </div>
            )}

            {idleMeta.isIdle && (
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E]">
                <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                  <Hourglass className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Idle {idleMeta.daysIdle}d since last touchpoint</span>
                </span>
                <button
                  type="button"
                  onClick={() => onDraftFollowUp(app)}
                  className="font-semibold text-[#4338CA] hover:underline whitespace-nowrap"
                >
                  Nudge
                </button>
              </div>
            )}
          </div>
        )}
        {/* Inline Job Description Paste & AI Insights Panel */}
        {showJdPanel && (
          <JobDescriptionPanel
            app={app}
            onSaveAnalysis={onSaveJdAnalysis}
            onMarkNoteSent={(id, label) => onMarkFollowedUp(id, label)}
          />
        )}
      </div>

      {/* Bottom Row: Follow-Up Date & Quick Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {editingFollowUp ? (
            <input
              type="date"
              value={app.followUpDate || today}
              onChange={(e) => {
                if (e.target.value) {
                  onUpdateFollowUpDate(app.id, e.target.value);
                }
                setEditingFollowUp(false);
              }}
              onBlur={() => setEditingFollowUp(false)}
              autoFocus
              aria-label={`Follow-up date for ${app.company}`}
              className="h-7 px-2 rounded-lg border border-[#4338CA] text-xs font-mono text-[#0F172A] focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingFollowUp(true)}
              className={`inline-flex items-center gap-1 py-1 px-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors tabular-nums ${
                followUpMeta.status === "overdue"
                  ? "text-[#BA1A1A] font-semibold"
                  : followUpMeta.status === "due_today"
                  ? "text-[#B45309] font-semibold"
                  : "text-slate-600"
              }`}
              title="Click to edit follow-up date"
            >
              <span>
                Follow-up:{" "}
                {app.followUpDate
                  ? formatShortDate(app.followUpDate)
                  : "Set date"}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(followUpMeta.status === "due_today" ||
            followUpMeta.status === "overdue" ||
            idleMeta.isIdle) && (
            <>
              <button
                type="button"
                onClick={() => onDraftFollowUp(app)}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap transition-colors"
                title="Draft follow-up email to recruiter with AI"
              >
                <Mail className="w-3.5 h-3.5 text-[#4338CA]" />
                <span>Follow-up</span>
              </button>
              <button
                type="button"
                onClick={() => onMarkFollowedUp(app.id)}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] text-xs font-semibold whitespace-nowrap transition-colors"
                title="Log touchpoint today and reschedule next follow-up"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowJdPanel((prev) => !prev)}
            className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors ${
              showJdPanel || app.jdAnalysis
                ? "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            title="Paste job description to extract skills, interview questions, and follow-up note"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>{app.jdAnalysis ? "JD Prep" : "Paste JD"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(app)}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 whitespace-nowrap transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
