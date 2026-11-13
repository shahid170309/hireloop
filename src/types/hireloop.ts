export type ApplicationStage =
  | "Wishlist"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Archived";

export type AppliedStatus =
  | "Submitted"
  | "Under Review"
  | "Recruiter Reached Out"
  | "Assessment Sent"
  | "Shortlisted"
  | "On Hold"
  | "Offer Extended"
  | "Not Selected";

export type RecruiterActionType =
  | "None"
  | "Application Viewed"
  | "Recruiter Reached Out"
  | "Phone Screen Invite"
  | "Sent Assessment"
  | "Requested Availability"
  | "Shared Feedback"
  | "Put on Hold";

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export type JobRegionCode =
  | "US"
  | "IN"
  | "UK"
  | "EU"
  | "CA"
  | "AU"
  | "SG"
  | "AE"
  | "JP";

export type FollowUpStatus = "overdue" | "due_today" | "upcoming" | "none";

export type NavTab = "pipeline" | "coach" | "resumes" | "insights";

export type PipelineFilter =
  | "all"
  | "due_today"
  | "overdue"
  | "idle"
  | "Wishlist"
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Archived";

export interface TimelineEvent {
  id: string;
  date: string;
  label: string;
  type: "applied" | "followup" | "interview" | "note" | "stage" | "recruiter";
}

export interface JobDescriptionAnalysis {
  requiredSkills: string[];
  interviewQuestions: string[];
  recruiterFollowUpNote: string;
  analyzedAt: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedStatus?: AppliedStatus;
  recruiterAction?: RecruiterActionType;
  recruiterActionDate?: string; // YYYY-MM-DD
  region?: JobRegionCode;
  currency?: string;
  salaryRange: string;
  location: string;
  workMode: WorkMode;
  resumeVersion: string;
  appliedDate: string; // YYYY-MM-DD
  followUpDate?: string; // YYYY-MM-DD
  lastActivityAt: string; // YYYY-MM-DD
  interviewDate?: string; // YYYY-MM-DD
  interviewTime?: string; // HH:mm
  interviewRound?: string;
  interviewLocation?: string;
  contactName?: string;
  contactEmail?: string;
  jobUrl?: string;
  notes?: string;
  jobDescription?: string;
  jdAnalysis?: JobDescriptionAnalysis;
  timeline?: TimelineEvent[];
}

export interface ResumeDoc {
  id: string;
  version: string;
  title: string;
  targetRole: string;
  updatedAt: string;
  highlights: string[];
}

export interface CoachQuestion {
  question: string;
  category: string;
  interviewerIntent: string;
  prepHints: string[];
}

export interface CoachEvaluation {
  clarityScore: number;
  summaryVerdict: string;
  strengths: string[];
  improvements: string[];
  starChecklist: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  polishedSnippet: string;
  followUpQuestion: string;
}

export interface CoachSessionItem {
  id: string;
  applicationId?: string;
  company: string;
  role: string;
  round: string;
  question: string;
  answer: string;
  evaluation: CoachEvaluation;
  createdAt: string;
}

export interface HireLoopSettings {
  idleThresholdDays: number;
  defaultFollowUpDays: number;
  preferredRegion: JobRegionCode;
}
