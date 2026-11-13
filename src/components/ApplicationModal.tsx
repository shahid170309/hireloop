import { useEffect, useState } from "react";
import { Globe, X } from "lucide-react";
import {
  ApplicationStage,
  AppliedStatus,
  JobApplication,
  JobRegionCode,
  RecruiterActionType,
  ResumeDoc,
  WorkMode,
} from "../types/hireloop";
import { addDaysISO, getTodayISO } from "../utils/dateUtils";
import {
  formatSalaryInRegionCurrency,
  getRegionConfig,
  inferRegionFromLocation,
  JOB_REGIONS,
} from "../utils/regions";

interface ApplicationModalProps {
  isOpen: boolean;
  initialApp?: JobApplication | null;
  resumes: ResumeDoc[];
  defaultFollowUpDays: number;
  defaultRegion: JobRegionCode;
  onClose: () => void;
  onSave: (appData: Omit<JobApplication, "id" | "timeline">, existingId?: string) => void;
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

const WORK_MODES: WorkMode[] = ["Remote", "Hybrid", "On-site"];

export function ApplicationModal({
  isOpen,
  initialApp,
  resumes,
  defaultFollowUpDays,
  defaultRegion,
  onClose,
  onSave,
}: ApplicationModalProps) {
  const today = getTodayISO();

  const [region, setRegion] = useState<JobRegionCode>(defaultRegion);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("Applied");
  const [appliedStatus, setAppliedStatus] = useState<AppliedStatus>("Submitted");
  const [recruiterAction, setRecruiterAction] =
    useState<RecruiterActionType>("None");
  const [salaryRange, setSalaryRange] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("Remote");
  const [resumeVersion, setResumeVersion] = useState(
    resumes[0]?.version || "v2.4 · Staff UI"
  );
  const [appliedDate, setAppliedDate] = useState(today);
  const [followUpDate, setFollowUpDate] = useState(
    addDaysISO(today, defaultFollowUpDays)
  );
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewRound, setInterviewRound] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("Google Meet");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (initialApp) {
      const detectedRegion =
        initialApp.region ||
        inferRegionFromLocation(initialApp.location, initialApp.salaryRange);
      setRegion(detectedRegion);
      setCompany(initialApp.company);
      setRole(initialApp.role);
      setStage(initialApp.stage);
      setAppliedStatus(initialApp.appliedStatus || "Submitted");
      setRecruiterAction(initialApp.recruiterAction || "None");
      setSalaryRange(initialApp.salaryRange);
      setLocation(initialApp.location);
      setWorkMode(initialApp.workMode);
      setResumeVersion(initialApp.resumeVersion);
      setAppliedDate(initialApp.appliedDate);
      setFollowUpDate(initialApp.followUpDate || "");
      setInterviewDate(initialApp.interviewDate || "");
      setInterviewTime(initialApp.interviewTime || "");
      setInterviewRound(initialApp.interviewRound || "");
      setInterviewLocation(initialApp.interviewLocation || "Google Meet");
      setContactName(initialApp.contactName || "");
      setContactEmail(initialApp.contactEmail || "");
      setJobUrl(initialApp.jobUrl || "");
      setNotes(initialApp.notes || "");
    } else {
      const cfg = getRegionConfig(defaultRegion);
      setRegion(defaultRegion);
      setCompany("");
      setRole("");
      setStage("Applied");
      setAppliedStatus("Submitted");
      setRecruiterAction("None");
      setSalaryRange(cfg.defaultSalaryRange);
      setLocation(cfg.defaultLocation);
      setWorkMode("Hybrid");
      setResumeVersion(resumes[0]?.version || "v2.4 · Staff UI");
      setAppliedDate(today);
      setFollowUpDate(addDaysISO(today, defaultFollowUpDays));
      setInterviewDate("");
      setInterviewTime("");
      setInterviewRound("");
      setInterviewLocation("Google Meet");
      setContactName("");
      setContactEmail("");
      setJobUrl("");
      setNotes("");
    }
  }, [isOpen, initialApp, resumes, defaultFollowUpDays, defaultRegion, today]);

  if (!isOpen) return null;

  const activeRegionConfig = getRegionConfig(region);

  const handleRegionChange = (nextCode: JobRegionCode) => {
    const prevCfg = getRegionConfig(region);
    const nextCfg = getRegionConfig(nextCode);
    setRegion(nextCode);

    // Update salary range currency seamlessly if empty or using previous default/symbol
    const trimmedSalary = salaryRange.trim();
    if (!trimmedSalary || trimmedSalary === prevCfg.defaultSalaryRange) {
      setSalaryRange(nextCfg.defaultSalaryRange);
    } else {
      const stripped = trimmedSalary
        .replace(/^(AED\s*|C\$|A\$|S\$|\$|₹|£|€|¥)/g, "")
        .replace(/(\s*[–-]\s*)(AED\s*|C\$|A\$|S\$|\$|₹|£|€|¥)/g, "$1");
      setSalaryRange(formatSalaryInRegionCurrency(stripped, nextCode));
    }

    // Update default location if empty or still on previous region's default city
    if (!location.trim() || location.trim() === prevCfg.defaultLocation) {
      setLocation(nextCfg.defaultLocation);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const formattedSalary = formatSalaryInRegionCurrency(salaryRange, region);

    onSave(
      {
        company: company.trim(),
        role: role.trim(),
        stage,
        appliedStatus: stage === "Wishlist" ? undefined : appliedStatus,
        recruiterAction,
        recruiterActionDate:
          recruiterAction !== "None"
            ? initialApp?.recruiterAction === recruiterAction
              ? initialApp.recruiterActionDate
              : today
            : undefined,
        region,
        currency: activeRegionConfig.currencyCode,
        salaryRange: formattedSalary,
        location: location.trim() || activeRegionConfig.defaultLocation,
        workMode,
        resumeVersion,
        appliedDate,
        followUpDate: followUpDate || undefined,
        lastActivityAt: initialApp ? initialApp.lastActivityAt : today,
        interviewDate: interviewDate || undefined,
        interviewTime: interviewTime || undefined,
        interviewRound: interviewRound.trim() || undefined,
        interviewLocation: interviewLocation.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        jobUrl: jobUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      initialApp?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <div className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)]">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2
              id="app-modal-title"
              className="font-display text-lg font-semibold text-[#0F172A]"
            >
              {initialApp ? `Edit ${initialApp.company}` : "Add Job Application"}
            </h2>
            <p className="text-xs text-slate-500">
              Track pipeline stage, follow-up schedule, and upcoming interview dates.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Step 1: Target Job Region & Currency */}
          <div className="p-3.5 rounded-xl bg-[#EEF2FF]/60 border border-[#C7D2FE] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="job-region-select"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2a14b4]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Target Job Region (sets salary currency) *</span>
              </label>
              <span className="font-mono text-[11px] font-semibold text-[#4338CA]">
                {activeRegionConfig.currencyCode} ({activeRegionConfig.currencySymbol.trim()})
              </span>
            </div>
            <select
              id="job-region-select"
              value={region}
              onChange={(e) => handleRegionChange(e.target.value as JobRegionCode)}
              className="w-full h-11 px-3 rounded-xl border border-[#C7D2FE] bg-white text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
            >
              {JOB_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.currencyCode} · {r.currencySymbol.trim()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Staff Frontend Engineer"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ApplicationStage)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applied Application Status
              </label>
              <select
                value={appliedStatus}
                onChange={(e) => setAppliedStatus(e.target.value as AppliedStatus)}
                disabled={stage === "Wishlist"}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] bg-white disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              >
                {APPLIED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Latest Recruiter Action
              </label>
              <select
                value={recruiterAction}
                onChange={(e) =>
                  setRecruiterAction(e.target.value as RecruiterActionType)
                }
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              >
                {RECRUITER_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compensation Range ({activeRegionConfig.currencyCode})
              </label>
              <div className="flex items-center h-11 rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#4338CA] focus-within:ring-3 focus-within:ring-[#4338CA]/15">
                <span className="px-3 h-full flex items-center bg-slate-50 border-r border-slate-200 font-mono text-xs font-semibold text-slate-600 shrink-0">
                  {activeRegionConfig.currencyCode}
                </span>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder={activeRegionConfig.salaryPlaceholder}
                  className="w-full h-full px-3 text-sm font-mono text-[#0F172A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={activeRegionConfig.defaultLocation}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full h-11 px-2.5 rounded-xl border border-slate-300 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#4338CA]"
                >
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Version
                </label>
                <select
                  value={resumeVersion}
                  onChange={(e) => setResumeVersion(e.target.value)}
                  className="w-full h-11 px-2.5 rounded-xl border border-slate-300 text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#4338CA]"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.version}>
                      {r.version}
                    </option>
                  ))}
                  {!resumes.some((r) => r.version === resumeVersion) && (
                    <option value={resumeVersion}>{resumeVersion}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Follow-Up Schedule */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-[#0F172A]">
              Follow-Up & Interview Schedule
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Follow-up Date (triggers Due Today / Overdue)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Upcoming Interview Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Interview Time
                </label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Interview Round
                </label>
                <input
                  type="text"
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  placeholder="e.g. System Design"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Meeting Platform / Location
                </label>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="Google Meet, Zoom, Office"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recruiter / Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Elena Vance"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="elena@company.com"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Posting URL
            </label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prep Notes & Key Context
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Role focus areas, interviewer names, compensation notes..."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-semibold transition-colors"
            >
              {initialApp ? "Save Changes" : "Save Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
