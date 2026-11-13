import { FollowUpStatus, JobApplication } from "../types/hireloop";

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(isoDate: string): Date {
  const clean = isoDate.slice(0, 10);
  const [y, m, d] = clean.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDaysISO(baseISO: string, days: number): string {
  const d = parseLocalDate(baseISO);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Positive return value means `targetISO` is in the future relative to `baseISO`.
 * Negative return value means `targetISO` is in the past relative to `baseISO`.
 */
export function diffDaysISO(targetISO: string, baseISO: string = getTodayISO()): number {
  const t = parseLocalDate(targetISO).getTime();
  const b = parseLocalDate(baseISO).getTime();
  return Math.round((t - b) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(isoDate?: string): string {
  if (!isoDate) return "—";
  const d = parseLocalDate(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(isoDate?: string): string {
  if (!isoDate) return "—";
  const d = parseLocalDate(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime12h(time24?: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr || 0);
  if (Number.isNaN(h)) return time24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export interface FollowUpMeta {
  status: FollowUpStatus;
  daysDelta: number; // positive = days overdue when overdue, days until when upcoming
}

export function getFollowUpMeta(
  app: JobApplication,
  todayISO: string = getTodayISO()
): FollowUpMeta {
  if (!app.followUpDate || app.stage === "Archived") {
    return { status: "none", daysDelta: 0 };
  }
  const delta = diffDaysISO(app.followUpDate.slice(0, 10), todayISO);
  if (delta < 0) {
    return { status: "overdue", daysDelta: Math.abs(delta) };
  }
  if (delta === 0) {
    return { status: "due_today", daysDelta: 0 };
  }
  return { status: "upcoming", daysDelta: delta };
}

export interface IdleMeta {
  isIdle: boolean;
  daysIdle: number;
}

export function getIdleMeta(
  app: JobApplication,
  thresholdDays: number = 7,
  todayISO: string = getTodayISO()
): IdleMeta {
  // Active pipeline stages subject to idle alerts
  const activeStages = new Set(["Applied", "Screening", "Interview"]);
  const referenceDate = (app.lastActivityAt || app.appliedDate || todayISO).slice(0, 10);
  const daysSince = Math.max(0, diffDaysISO(todayISO, referenceDate));

  if (!activeStages.has(app.stage)) {
    return { isIdle: false, daysIdle: daysSince };
  }

  return {
    isIdle: daysSince >= thresholdDays,
    daysIdle: daysSince,
  };
}

export function getUpcomingInterviews(
  apps: JobApplication[],
  todayISO: string = getTodayISO()
): JobApplication[] {
  return apps
    .filter((app) => {
      if (app.stage === "Archived" || !app.interviewDate) return false;
      return app.interviewDate.slice(0, 10) >= todayISO;
    })
    .sort((a, b) => {
      const dateA = `${a.interviewDate}T${a.interviewTime || "23:59"}`;
      const dateB = `${b.interviewDate}T${b.interviewTime || "23:59"}`;
      return dateA.localeCompare(dateB);
    });
}

export function getCountdownLabel(
  isoDate: string,
  todayISO: string = getTodayISO()
): string {
  const delta = diffDaysISO(isoDate.slice(0, 10), todayISO);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta > 1) return `In ${delta}d`;
  return `${Math.abs(delta)}d ago`;
}
