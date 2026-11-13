import { AlertTriangle, CheckCircle2, Mail, X } from "lucide-react";
import { JobApplication } from "../types/hireloop";
import { getIdleMeta, getTodayISO } from "../utils/dateUtils";

interface IdleAlertsBannerProps {
  applications: JobApplication[];
  idleThresholdDays: number;
  onChangeThreshold: (days: number) => void;
  onLogCheckIn: (appId: string) => void;
  onDraftFollowUp: (app: JobApplication) => void;
  onSelectApp: (app: JobApplication) => void;
  dismissed: boolean;
  onDismiss: () => void;
}

export function IdleAlertsBanner({
  applications,
  idleThresholdDays,
  onChangeThreshold,
  onLogCheckIn,
  onDraftFollowUp,
  onSelectApp,
  dismissed,
  onDismiss,
}: IdleAlertsBannerProps) {
  const today = getTodayISO();
  const idleApps = applications
    .map((app) => ({
      app,
      idle: getIdleMeta(app, idleThresholdDays, today),
    }))
    .filter((entry) => entry.idle.isIdle)
    .sort((a, b) => b.idle.daysIdle - a.idle.daysIdle);

  if (idleApps.length === 0 || dismissed) {
    return null;
  }

  return (
    <section
      aria-label="Idle application alerts"
      className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-semibold text-[#78350F]">
                Idle Application Alerts
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] tabular-nums">
                {idleApps.length} {idleApps.length === 1 ? "application" : "applications"}
              </span>
            </div>
            <p className="text-xs text-[#92400E] mt-0.5">
              No logged activity for {idleThresholdDays}+ days. Send a quick check-in or update status to keep momentum.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-medium text-[#92400E] flex items-center gap-1.5">
            <span>Alert after</span>
            <select
              value={idleThresholdDays}
              onChange={(e) => onChangeThreshold(Number(e.target.value))}
              aria-label="Idle alert threshold in days"
              className="h-8 px-2 rounded-lg bg-white border border-[#FCD34D] text-xs font-semibold text-[#78350F] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            >
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
              <option value={10}>10 days</option>
              <option value={14}>14 days</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss idle alerts banner"
            className="w-8 h-8 rounded-lg hover:bg-[#FEF3C7] text-[#92400E] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {idleApps.map(({ app, idle }) => (
          <div
            key={app.id}
            className="bg-white border border-[#FDE68A] rounded-xl p-3 flex flex-col justify-between gap-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectApp(app)}
                className="text-left min-w-0 group focus-visible:outline-none"
              >
                <p className="font-display text-sm font-semibold text-[#0F172A] group-hover:text-[#4338CA] truncate transition-colors">
                  {app.company}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {app.role} · {app.stage}
                </p>
              </button>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#BA1A1A] border border-[#FECACA] whitespace-nowrap shrink-0 tabular-nums">
                Idle {idle.daysIdle}d
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onDraftFollowUp(app)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-semibold whitespace-nowrap transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Draft Follow-up</span>
              </button>
              <button
                type="button"
                onClick={() => onLogCheckIn(app.id)}
                className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Log Check-in</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
