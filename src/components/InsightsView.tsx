import {
  ApplicationStage,
  HireLoopSettings,
  JobApplication,
  JobRegionCode,
} from "../types/hireloop";
import {
  getFollowUpMeta,
  getIdleMeta,
  getTodayISO,
  getUpcomingInterviews,
} from "../utils/dateUtils";
import { JOB_REGIONS } from "../utils/regions";

interface InsightsViewProps {
  applications: JobApplication[];
  settings: HireLoopSettings;
  onUpdateSettings: (next: HireLoopSettings) => void;
}

const PIPELINE_STAGES: ApplicationStage[] = [
  "Wishlist",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
];

export function InsightsView({
  applications,
  settings,
  onUpdateSettings,
}: InsightsViewProps) {
  const today = getTodayISO();
  const activeApps = applications.filter((a) => a.stage !== "Archived");

  const dueOrOverdueCount = activeApps.filter((app) => {
    const status = getFollowUpMeta(app, today).status;
    return status === "due_today" || status === "overdue";
  }).length;

  const overdueCount = activeApps.filter(
    (app) => getFollowUpMeta(app, today).status === "overdue"
  ).length;

  const idleCount = activeApps.filter(
    (app) => getIdleMeta(app, settings.idleThresholdDays, today).isIdle
  ).length;

  const upcomingInterviews = getUpcomingInterviews(applications, today);

  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length,
  }));

  const maxCount = Math.max(1, ...stageCounts.map((s) => s.count));

  const progressedCount = applications.filter(
    (a) => a.stage === "Screening" || a.stage === "Interview" || a.stage === "Offer"
  ).length;
  const submittedCount = applications.filter((a) => a.stage !== "Wishlist").length;
  const responseRate =
    submittedCount > 0 ? Math.round((progressedCount / submittedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
          Pipeline Insights & Follow-Up Health
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Track stage conversion, follow-up timeliness, and idle alert preferences.
        </p>
      </div>

      {/* 4-Column KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">Active Applications</p>
          <p className="font-display text-2xl font-bold text-[#0F172A] mt-1 tabular-nums">
            {activeApps.length}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {responseRate}% response rate
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">Follow-Ups Actionable</p>
          <p className="font-display text-2xl font-bold text-[#D97706] mt-1 tabular-nums">
            {dueOrOverdueCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {overdueCount} overdue right now
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">Upcoming Interviews</p>
          <p className="font-display text-2xl font-bold text-[#4338CA] mt-1 tabular-nums">
            {upcomingInterviews.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Scheduled on calendar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-medium text-slate-500">Idle Alerts</p>
          <p className="font-display text-2xl font-bold text-[#BA1A1A] mt-1 tabular-nums">
            {idleCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Quiet {settings.idleThresholdDays}+ days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Funnel Breakdown */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="font-display text-base font-semibold text-[#0F172A]">
            Pipeline Stage Distribution
          </h2>
          <div className="space-y-3">
            {stageCounts.map(({ stage, count }) => {
              const pct = Math.round((count / maxCount) * 100);
              const barColor =
                stage === "Offer"
                  ? "bg-[#10B981]"
                  : stage === "Interview"
                  ? "bg-[#F59E0B]"
                  : stage === "Applied"
                  ? "bg-[#0284C7]"
                  : stage === "Screening"
                  ? "bg-[#4338CA]"
                  : "bg-slate-400";

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A]">{stage}</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Follow-Up & Alert Preferences */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
          <h2 className="font-display text-base font-semibold text-[#0F172A]">
            Follow-up & Alert Cadence
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure when HireLoop flags quiet applications as idle and how far ahead new follow-ups are scheduled by default.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Target Job Region & Currency
              </label>
              <select
                value={settings.preferredRegion}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    preferredRegion: e.target.value as JobRegionCode,
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              >
                {JOB_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name} ({r.currencyCode} · {r.currencySymbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Idle Alert Threshold
              </label>
              <select
                value={settings.idleThresholdDays}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    idleThresholdDays: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              >
                <option value={5}>5 days without activity</option>
                <option value={7}>7 days without activity (Recommended)</option>
                <option value={10}>10 days without activity</option>
                <option value={14}>14 days without activity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Follow-up Spacing
              </label>
              <select
                value={settings.defaultFollowUpDays}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    defaultFollowUpDays: Number(e.target.value),
                  })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
              >
                <option value={3}>Every 3 days</option>
                <option value={5}>Every 5 days (Recommended)</option>
                <option value={7}>Every 7 days</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
