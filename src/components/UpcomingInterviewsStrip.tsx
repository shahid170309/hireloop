import { CalendarClock, ChevronRight, Mic, Video } from "lucide-react";
import { JobApplication } from "../types/hireloop";
import {
  formatShortDate,
  formatTime12h,
  getCountdownLabel,
  getTodayISO,
} from "../utils/dateUtils";
import { CompanyAvatar } from "./CompanyAvatar";

interface UpcomingInterviewsStripProps {
  interviews: JobApplication[];
  onPrepWithCoach: (app: JobApplication) => void;
  onSelectApp: (app: JobApplication) => void;
  onScheduleNew: () => void;
}

export function UpcomingInterviewsStrip({
  interviews,
  onPrepWithCoach,
  onSelectApp,
  onScheduleNew,
}: UpcomingInterviewsStripProps) {
  const today = getTodayISO();

  if (interviews.length === 0) {
    return (
      <section
        aria-label="Upcoming interviews"
        className="bg-white border border-slate-200 rounded-2xl p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.02)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-[#0F172A]">
              No Upcoming Interviews Scheduled
            </h2>
            <p className="text-xs text-slate-500">
              Add an interview date to an application to see countdowns and launch AI prep here.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onScheduleNew}
          className="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A] whitespace-nowrap shrink-0 self-start sm:self-auto transition-colors"
        >
          Schedule Interview
        </button>
      </section>
    );
  }

  const nextInterview = interviews[0];
  const nextCountdown = nextInterview.interviewDate
    ? getCountdownLabel(nextInterview.interviewDate, today)
    : "";

  return (
    <section
      aria-label="Upcoming interviews summary"
      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.02)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-semibold text-[#0F172A]">
                Upcoming Interviews
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#E0E7FF] tabular-nums">
                {interviews.length}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 tabular-nums">
          Next up:{" "}
          <span className="font-semibold text-[#0F172A]">
            {nextInterview.company} · {nextCountdown}
            {nextInterview.interviewTime
              ? ` at ${formatTime12h(nextInterview.interviewTime)}`
              : ""}
          </span>
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {interviews.map((app) => {
          const countdown = app.interviewDate
            ? getCountdownLabel(app.interviewDate, today)
            : "";
          const isToday = countdown === "Today";

          return (
            <div
              key={app.id}
              className="snap-start min-w-[270px] sm:min-w-[300px] flex-1 max-w-[360px] rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1] transition-colors p-3.5 flex flex-col justify-between gap-3"
            >
              <div
                onClick={() => onSelectApp(app)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectApp(app);
                  }
                }}
                className="flex items-start justify-between gap-2.5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded-lg"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CompanyAvatar company={app.company} size="sm" />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-[#0F172A] truncate">
                      {app.company}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {app.interviewRound || app.role}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 tabular-nums border ${
                    isToday
                      ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  {countdown}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0 tabular-nums">
                  <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {formatShortDate(app.interviewDate)}
                    {app.interviewTime ? ` · ${formatTime12h(app.interviewTime)}` : ""}
                    {app.interviewLocation ? ` · ${app.interviewLocation}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPrepWithCoach(app)}
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-gradient-to-r from-[#4338CA] to-[#4F46E5] hover:opacity-95 text-white text-xs font-semibold whitespace-nowrap transition-opacity shadow-[0_2px_8px_rgba(79,70,229,0.28)]"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Prep</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectApp(app)}
                    aria-label={`Inspect ${app.company} interview`}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
