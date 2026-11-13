import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Mail,
  Mic,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import {
  ApplicationStage,
  AppliedStatus,
  JobApplication,
  JobDescriptionAnalysis,
  RecruiterActionType,
} from "../types/hireloop";
import {
  formatFullDate,
  formatTime12h,
  getFollowUpMeta,
  getIdleMeta,
  getTodayISO,
} from "../utils/dateUtils";
import { getRegionConfig } from "../utils/regions";
import { CompanyAvatar } from "./CompanyAvatar";
import { JobDescriptionPanel } from "./JobDescriptionPanel";

interface ApplicationDetailDrawerProps {
  app: JobApplication | null;
  idleThresholdDays: number;
  onClose: () => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (appId: string) => void;
  onChangeStage: (appId: string, stage: ApplicationStage) => void;
  onUpdateAppliedStatus: (appId: string, status: AppliedStatus) => void;
  onLogRecruiterAction: (appId: string, action: RecruiterActionType) => void;
  onUpdateFollowUpDate: (appId: string, date: string) => void;
  onLogTouchpoint: (appId: string, note?: string) => void;
  onSaveJdAnalysis: (
    appId: string,
    jobDescription: string,
    analysis: JobDescriptionAnalysis
  ) => void;
  onDraftFollowUp: (app: JobApplication) => void;
  onPrepWithCoach: (app: JobApplication) => void;
}

const STAGES: ApplicationStage[] = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Archived",
];

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

const RECRUITER_ACTION_BUTTONS: RecruiterActionType[] = [
  "Application Viewed",
  "Recruiter Reached Out",
  "Phone Screen Invite",
  "Sent Assessment",
  "Requested Availability",
  "Shared Feedback",
  "Put on Hold",
];

export function ApplicationDetailDrawer({
  app,
  idleThresholdDays,
  onClose,
  onEdit,
  onDelete,
  onChangeStage,
  onUpdateAppliedStatus,
  onLogRecruiterAction,
  onUpdateFollowUpDate,
  onLogTouchpoint,
  onSaveJdAnalysis,
  onDraftFollowUp,
  onPrepWithCoach,
}: ApplicationDetailDrawerProps) {
  const [touchpointNote, setTouchpointNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!app) return null;

  const today = getTodayISO();
  const followUpMeta = getFollowUpMeta(app, today);
  const idleMeta = getIdleMeta(app, idleThresholdDays, today);

  const handleLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    onLogTouchpoint(app.id, touchpointNote.trim() || undefined);
    setTouchpointNote("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`${app.company} application details`}
    >
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto border-l border-slate-200 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Drawer Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CompanyAvatar company={app.company} size="lg" />
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-[#0F172A] truncate">
                  {app.role}
                </h2>
                <p className="text-sm text-slate-600 truncate">{app.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(app)}
                aria-label="Edit application"
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Status & Follow-up Summary */}
            <div className="flex flex-wrap items-center gap-2">
              {followUpMeta.status === "overdue" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#BA1A1A] border border-[#FECACA] tabular-nums">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Overdue · {followUpMeta.daysDelta}d</span>
                </span>
              )}
              {followUpMeta.status === "due_today" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due Today</span>
                </span>
              )}
              {idleMeta.isIdle && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D] tabular-nums">
                  <span>Idle · {idleMeta.daysIdle}d without activity</span>
                </span>
              )}
            </div>

            {/* Stage Selector */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Pipeline Stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((stage) => {
                  const active = app.stage === stage;
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => onChangeStage(app.id, stage)}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? "bg-[#4338CA] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applied Application Status */}
            {app.stage !== "Wishlist" && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Applied Application Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {APPLIED_STATUSES.map((status) => {
                    const active = (app.appliedStatus || "Submitted") === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => onUpdateAppliedStatus(app.id, status)}
                        className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                          active
                            ? "bg-[#0F172A] text-white border-[#0F172A]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recruiter Actions Panel */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#4338CA] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      Recruiter Actions
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {app.contactName || "Hiring Team"}
                      {app.recruiterAction && app.recruiterAction !== "None"
                        ? ` · Latest: ${app.recruiterAction}${
                            app.recruiterActionDate
                              ? ` (${formatFullDate(app.recruiterActionDate)})`
                              : ""
                          }`
                        : " · No recruiter action logged yet"}
                    </p>
                  </div>
                </div>
                {app.contactEmail && (
                  <a
                    href={`mailto:${app.contactEmail}`}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#4338CA] whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {RECRUITER_ACTION_BUTTONS.map((action) => {
                  const isCurrent = app.recruiterAction === action;
                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => onLogRecruiterAction(app.id, action)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap border ${
                        isCurrent
                          ? "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {action}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Metadata */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs">
              <div>
                <p className="text-slate-500">
                  Compensation ({app.currency || getRegionConfig(app.region).currencyCode})
                </p>
                <p className="font-mono font-semibold text-[#0F172A] mt-0.5 tabular-nums">
                  {app.salaryRange}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Region & Location</p>
                <p className="font-medium text-[#0F172A] mt-0.5">
                  {getRegionConfig(app.region).name} · {app.location} ({app.workMode})
                </p>
              </div>
              <div>
                <p className="text-slate-500">Resume Version</p>
                <p className="font-medium text-[#0F172A] mt-0.5">
                  {app.resumeVersion}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Applied Date</p>
                <p className="font-mono font-medium text-[#0F172A] mt-0.5 tabular-nums">
                  {formatFullDate(app.appliedDate)}
                </p>
              </div>
            </div>

            {/* Follow-up & Interview Actions */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4338CA]" />
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Scheduled Follow-up
                  </span>
                </div>
                <input
                  type="date"
                  value={app.followUpDate || ""}
                  onChange={(e) => onUpdateFollowUpDate(app.id, e.target.value)}
                  aria-label="Update follow-up date"
                  className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              {app.interviewDate && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarClock className="w-4 h-4 text-[#D97706] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#0F172A] truncate">
                        {app.interviewRound || "Upcoming Interview"}
                      </p>
                      <p className="text-xs text-slate-600 tabular-nums">
                        {formatFullDate(app.interviewDate)}
                        {app.interviewTime ? ` · ${formatTime12h(app.interviewTime)}` : ""}
                        {app.interviewLocation ? ` · ${app.interviewLocation}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPrepWithCoach(app);
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#4338CA] to-[#4F46E5] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>AI Prep</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDraftFollowUp(app)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Draft AI Follow-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLogTouchpoint(app.id)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A] whitespace-nowrap transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Log Touchpoint</span>
                </button>
              </div>
            </div>

            {/* Contact & Link */}
            {(app.contactName || app.contactEmail || app.jobUrl) && (
              <div className="text-xs space-y-1.5 text-slate-600">
                {app.contactName && (
                  <p>
                    Contact:{" "}
                    <span className="font-semibold text-[#0F172A]">
                      {app.contactName}
                    </span>
                    {app.contactEmail ? ` (${app.contactEmail})` : ""}
                  </p>
                )}
                {app.jobUrl && (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#4338CA] font-semibold hover:underline"
                  >
                    <span>View Job Posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Job Description AI Prep */}
            <JobDescriptionPanel
              app={app}
              onSaveAnalysis={onSaveJdAnalysis}
              onMarkNoteSent={(id, label) => onLogTouchpoint(id, label)}
            />

            {/* Notes */}
            {app.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
                  {app.notes}
                </p>
              </div>
            )}

            {/* Quick Activity Log Form */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Activity Timeline
              </p>
              <form onSubmit={handleLogNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={touchpointNote}
                  onChange={(e) => setTouchpointNote(e.target.value)}
                  placeholder="Log a call, follow-up, or prep note..."
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-300 text-xs text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
                <button
                  type="submit"
                  className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap"
                >
                  Log
                </button>
              </form>

              <div className="space-y-2">
                {(app.timeline || []).length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No touchpoints logged yet. Last activity:{" "}
                    {formatFullDate(app.lastActivityAt)}
                  </p>
                ) : (
                  [...(app.timeline || [])]
                    .reverse()
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0 text-xs"
                      >
                        <span className="text-slate-700">{event.label}</span>
                        <span className="font-mono text-slate-400 shrink-0 tabular-nums">
                          {formatFullDate(event.date)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#BA1A1A] hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Application</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDelete(app.id);
                  onClose();
                }}
                className="h-8 px-3 rounded-lg bg-[#BA1A1A] text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onPrepWithCoach(app);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#4F46E5] text-white text-xs font-semibold"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Practice Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
