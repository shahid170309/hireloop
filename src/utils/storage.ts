import {
  AppliedStatus,
  ApplicationStage,
  CoachSessionItem,
  HireLoopSettings,
  JobApplication,
  JobRegionCode,
  RecruiterActionType,
  ResumeDoc,
} from "../types/hireloop";
import { addDaysISO, getTodayISO } from "./dateUtils";
import { getRegionConfig, inferRegionFromLocation } from "./regions";

export const STORAGE_KEYS = {
  applications: "hireloop_applications",
  resumes: "hireloop_resumes",
  coachSessions: "hireloop_coach_sessions",
  settings: "hireloop_settings",
} as const;

const LEGACY_APP_KEYS = [
  "hireloop_apps",
  "hireloop_data",
  "applications",
  "job_applications",
];

function createInitialApplications(): JobApplication[] {
  const today = getTodayISO();

  return [
    {
      id: "app-stripe",
      company: "Stripe",
      role: "Staff Frontend Engineer",
      stage: "Interview",
      appliedStatus: "Shortlisted",
      recruiterAction: "Requested Availability",
      recruiterActionDate: addDaysISO(today, -1),
      salaryRange: "$220k – $255k",
      location: "San Francisco, CA",
      workMode: "Hybrid",
      resumeVersion: "v2.4 · Staff UI",
      appliedDate: addDaysISO(today, -14),
      followUpDate: today,
      lastActivityAt: addDaysISO(today, -1),
      interviewDate: today,
      interviewTime: "14:30",
      interviewRound: "Architecture & UI Systems",
      interviewLocation: "Google Meet",
      contactName: "Elena Vance",
      contactEmail: "elena.v@stripe.com",
      jobUrl: "https://stripe.com/jobs",
      notes:
        "Focus on resilient checkout state machines, optimistic updates, and accessibility compliance.",
      timeline: [
        {
          id: "t-1",
          date: addDaysISO(today, -14),
          label: "Submitted tailored resume v2.4",
          type: "applied",
        },
        {
          id: "t-2",
          date: addDaysISO(today, -6),
          label: "Completed recruiter screen with Elena",
          type: "followup",
        },
        {
          id: "t-3",
          date: addDaysISO(today, -1),
          label: "Confirmed UI Systems round schedule",
          type: "interview",
        },
      ],
    },
    {
      id: "app-linear",
      company: "Linear",
      role: "Senior Product Engineer",
      stage: "Interview",
      appliedStatus: "Shortlisted",
      recruiterAction: "Phone Screen Invite",
      recruiterActionDate: addDaysISO(today, -2),
      salaryRange: "$195k – $230k",
      location: "Remote (US/EU)",
      workMode: "Remote",
      resumeVersion: "v2.4 · Staff UI",
      appliedDate: addDaysISO(today, -10),
      followUpDate: addDaysISO(today, 3),
      lastActivityAt: addDaysISO(today, -2),
      interviewDate: addDaysISO(today, 2),
      interviewTime: "10:00",
      interviewRound: "Product Craft Pairing",
      interviewLocation: "Zoom",
      contactName: "Marcus Chen",
      contactEmail: "marcus@linear.app",
      notes:
        "Expect keyboard-first command palette pairing and sync engine latency discussion.",
      timeline: [
        {
          id: "t-4",
          date: addDaysISO(today, -10),
          label: "Applied via referral from product team",
          type: "applied",
        },
        {
          id: "t-5",
          date: addDaysISO(today, -2),
          label: "Scheduled 60m pairing session",
          type: "interview",
        },
      ],
    },
    {
      id: "app-figma",
      company: "Figma",
      role: "Design Systems Engineer",
      stage: "Screening",
      appliedStatus: "Assessment Sent",
      recruiterAction: "Sent Assessment",
      recruiterActionDate: addDaysISO(today, -9),
      salaryRange: "$190k – $225k",
      location: "San Francisco, CA",
      workMode: "Hybrid",
      resumeVersion: "v2.3 · Design Systems",
      appliedDate: addDaysISO(today, -12),
      followUpDate: addDaysISO(today, -2),
      lastActivityAt: addDaysISO(today, -9),
      contactName: "Priya Nair",
      contactEmail: "priya@figma.com",
      notes:
        "Sent take-home component API critique 9 days ago. Waiting on hiring manager review.",
      timeline: [
        {
          id: "t-6",
          date: addDaysISO(today, -12),
          label: "Applied with Design Systems portfolio",
          type: "applied",
        },
        {
          id: "t-7",
          date: addDaysISO(today, -9),
          label: "Completed initial recruiter call",
          type: "stage",
        },
      ],
    },
    {
      id: "app-anthropic",
      company: "Anthropic",
      role: "Frontend Infrastructure Engineer",
      stage: "Applied",
      appliedStatus: "Under Review",
      recruiterAction: "Application Viewed",
      recruiterActionDate: addDaysISO(today, -5),
      salaryRange: "$230k – $275k",
      location: "San Francisco, CA",
      workMode: "Hybrid",
      resumeVersion: "v2.4 · Staff UI",
      appliedDate: addDaysISO(today, -8),
      followUpDate: today,
      lastActivityAt: addDaysISO(today, -8),
      contactName: "Jordan Patel",
      notes: "Highlight streaming response rendering and React 19 concurrent patterns.",
      timeline: [
        {
          id: "t-8",
          date: addDaysISO(today, -8),
          label: "Submitted application via career portal",
          type: "applied",
        },
      ],
    },
    {
      id: "app-vercel",
      company: "Vercel",
      role: "Senior DX Engineer",
      stage: "Applied",
      appliedStatus: "Submitted",
      recruiterAction: "None",
      salaryRange: "$185k – $215k",
      location: "Remote",
      workMode: "Remote",
      resumeVersion: "v2.2 · Full-Stack DX",
      appliedDate: addDaysISO(today, -15),
      followUpDate: addDaysISO(today, -4),
      lastActivityAt: addDaysISO(today, -11),
      contactName: "Samira Ortiz",
      notes: "Follow up on DX team opening and share Next.js build perf case study.",
      timeline: [
        {
          id: "t-9",
          date: addDaysISO(today, -15),
          label: "Applied online",
          type: "applied",
        },
        {
          id: "t-10",
          date: addDaysISO(today, -11),
          label: "Connected with Samira on LinkedIn",
          type: "followup",
        },
      ],
    },
    {
      id: "app-notion",
      company: "Notion",
      role: "Product Engineer, Core Editor",
      stage: "Interview",
      appliedStatus: "Shortlisted",
      recruiterAction: "Shared Feedback",
      recruiterActionDate: addDaysISO(today, -3),
      salaryRange: "$200k – $235k",
      location: "New York, NY",
      workMode: "Hybrid",
      resumeVersion: "v2.4 · Staff UI",
      appliedDate: addDaysISO(today, -18),
      followUpDate: addDaysISO(today, 5),
      lastActivityAt: addDaysISO(today, -3),
      interviewDate: addDaysISO(today, 4),
      interviewTime: "15:00",
      interviewRound: "Final Engineering Panel",
      interviewLocation: "Zoom",
      contactName: "Hannah Brooks",
      notes: "Prepare block-tree CRDT conflict resolution examples.",
      timeline: [
        {
          id: "t-11",
          date: addDaysISO(today, -18),
          label: "Applied to Core Editor team",
          type: "applied",
        },
        {
          id: "t-12",
          date: addDaysISO(today, -3),
          label: "Passed technical screen — advanced to final panel",
          type: "stage",
        },
      ],
    },
    {
      id: "app-datadog",
      company: "Datadog",
      role: "UI Platform Lead",
      stage: "Offer",
      appliedStatus: "Offer Extended",
      recruiterAction: "Recruiter Reached Out",
      recruiterActionDate: addDaysISO(today, -1),
      salaryRange: "$215k – $245k",
      location: "New York, NY",
      workMode: "Hybrid",
      resumeVersion: "v2.4 · Staff UI",
      appliedDate: addDaysISO(today, -28),
      followUpDate: addDaysISO(today, 1),
      lastActivityAt: addDaysISO(today, -1),
      contactName: "David Kim",
      notes: "Written offer received. Review equity vesting schedule before tomorrow's call.",
      timeline: [
        {
          id: "t-13",
          date: addDaysISO(today, -1),
          label: "Received formal offer package",
          type: "stage",
        },
      ],
    },
    {
      id: "app-raycast",
      company: "Raycast",
      role: "Web & Extension Platform Engineer",
      stage: "Wishlist",
      salaryRange: "$170k – $200k",
      location: "Remote (Europe/US)",
      workMode: "Remote",
      resumeVersion: "v2.3 · Design Systems",
      appliedDate: today,
      followUpDate: addDaysISO(today, 6),
      lastActivityAt: addDaysISO(today, -4),
      notes: "Tailor portfolio highlights with keyboard navigation demo before submitting.",
    },
  ];
}

function createInitialResumes(): ResumeDoc[] {
  const today = getTodayISO();
  return [
    {
      id: "res-1",
      version: "v2.4 · Staff UI",
      title: "Staff Frontend & Architecture",
      targetRole: "Staff / Principal Frontend Engineer",
      updatedAt: addDaysISO(today, -3),
      highlights: [
        "Led checkout UI architecture serving 4M+ daily transactions at 99.98% reliability",
        "Reduced main-thread bundle weight by 38% via incremental hydration",
        "Mentored 12 engineers across design systems and performance guilds",
      ],
    },
    {
      id: "res-2",
      version: "v2.3 · Design Systems",
      title: "Design Systems & Accessibility",
      targetRole: "Design Systems Engineer",
      updatedAt: addDaysISO(today, -10),
      highlights: [
        "Built WCAG AA tokenized component primitives adopted by 18 product squads",
        "Authored automated visual regression and keyboard-navigation test suites",
      ],
    },
    {
      id: "res-3",
      version: "v2.2 · Full-Stack DX",
      title: "Developer Experience & Tooling",
      targetRole: "Senior DX Engineer",
      updatedAt: addDaysISO(today, -16),
      highlights: [
        "Designed local CLI + live preview dev servers cutting onboarding time from 2d to 12m",
        "Published interactive SDK guides with runnable browser playgrounds",
      ],
    },
  ];
}

const DEFAULT_SETTINGS: HireLoopSettings = {
  idleThresholdDays: 7,
  defaultFollowUpDays: 5,
  preferredRegion: "US",
};

function deriveDefaultAppliedStatus(stage: ApplicationStage): AppliedStatus | undefined {
  switch (stage) {
    case "Applied":
      return "Submitted";
    case "Screening":
      return "Recruiter Reached Out";
    case "Interview":
      return "Shortlisted";
    case "Offer":
      return "Offer Extended";
    case "Archived":
      return "Not Selected";
    default:
      return undefined;
  }
}

function normalizeApplication(raw: Partial<JobApplication>, idx: number): JobApplication {
  const today = getTodayISO();
  const applied = raw.appliedDate || today;
  const stage: ApplicationStage = raw.stage || "Applied";
  const recruiterAction: RecruiterActionType = raw.recruiterAction || "None";
  const region: JobRegionCode =
    raw.region || inferRegionFromLocation(raw.location, raw.salaryRange);
  const regionCfg = getRegionConfig(region);

  return {
    id: raw.id || `app-migrated-${idx}-${Date.now()}`,
    company: raw.company || "Company",
    role: raw.role || "Role",
    stage,
    appliedStatus: raw.appliedStatus ?? deriveDefaultAppliedStatus(stage),
    recruiterAction,
    recruiterActionDate: raw.recruiterActionDate,
    region,
    currency: raw.currency || regionCfg.currencyCode,
    salaryRange: raw.salaryRange || regionCfg.defaultSalaryRange,
    location: raw.location || "Remote",
    workMode: raw.workMode || "Remote",
    resumeVersion: raw.resumeVersion || "v2.4 · Staff UI",
    appliedDate: applied,
    followUpDate: raw.followUpDate,
    lastActivityAt: raw.lastActivityAt || applied,
    interviewDate: raw.interviewDate,
    interviewTime: raw.interviewTime,
    interviewRound: raw.interviewRound,
    interviewLocation: raw.interviewLocation,
    contactName: raw.contactName,
    contactEmail: raw.contactEmail,
    jobUrl: raw.jobUrl,
    notes: raw.notes,
    jobDescription: raw.jobDescription,
    jdAnalysis: raw.jdAnalysis,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
  };
}

export function loadApplications(): JobApplication[] {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.applications);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => normalizeApplication(item, idx));
      }
    }

    // Preserve any legacy key data if present without wiping user data
    for (const legacyKey of LEGACY_APP_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((item, idx) => normalizeApplication(item, idx));
          localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(migrated));
          return migrated;
        }
      }
    }

    const seeded = createInitialApplications();
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(seeded));
    return seeded;
  } catch {
    return createInitialApplications();
  }
}

export function saveApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(apps));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadResumes(): ResumeDoc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.resumes);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    const seeded = createInitialResumes();
    localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(seeded));
    return seeded;
  } catch {
    return createInitialResumes();
  }
}

export function saveResumes(resumes: ResumeDoc[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(resumes));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadCoachSessions(): CoachSessionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.coachSessions);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCoachSessions(sessions: CoachSessionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.coachSessions, JSON.stringify(sessions.slice(0, 20)));
  } catch {
    // Ignore
  }
}

export function loadSettings(): HireLoopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: HireLoopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
