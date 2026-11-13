/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from "react";
import { Bell, Globe, Plus, Search } from "lucide-react";
import { AiCoachView } from "./components/AiCoachView";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationDetailDrawer } from "./components/ApplicationDetailDrawer";
import { ApplicationModal } from "./components/ApplicationModal";
import { FollowUpDraftModal } from "./components/FollowUpDraftModal";
import { IdleAlertsBanner } from "./components/IdleAlertsBanner";
import { InsightsView } from "./components/InsightsView";
import { Navigation } from "./components/Navigation";
import { ResumesView } from "./components/ResumesView";
import { UpcomingInterviewsStrip } from "./components/UpcomingInterviewsStrip";
import {
  ApplicationStage,
  AppliedStatus,
  CoachSessionItem,
  HireLoopSettings,
  JobApplication,
  JobDescriptionAnalysis,
  JobRegionCode,
  NavTab,
  PipelineFilter,
  RecruiterActionType,
  ResumeDoc,
} from "./types/hireloop";
import { JOB_REGIONS } from "./utils/regions";
import {
  addDaysISO,
  getFollowUpMeta,
  getIdleMeta,
  getTodayISO,
  getUpcomingInterviews,
} from "./utils/dateUtils";
import {
  loadApplications,
  loadCoachSessions,
  loadResumes,
  loadSettings,
  saveApplications,
  saveCoachSessions,
  saveResumes,
  saveSettings,
} from "./utils/storage";

type SortMode = "priority" | "recent" | "company";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("pipeline");
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    loadApplications()
  );
  const [resumes, setResumes] = useState<ResumeDoc[]>(() => loadResumes());
  const [coachSessions, setCoachSessions] = useState<CoachSessionItem[]>(() =>
    loadCoachSessions()
  );
  const [settings, setSettings] = useState<HireLoopSettings>(() => loadSettings());

  const [filter, setFilter] = useState<PipelineFilter>("all");
  const [regionFilter, setRegionFilter] = useState<JobRegionCode | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [idleBannerDismissed, setIdleBannerDismissed] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [draftModalApp, setDraftModalApp] = useState<JobApplication | null>(null);
  const [coachAppId, setCoachAppId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    saveResumes(resumes);
  }, [resumes]);

  useEffect(() => {
    saveCoachSessions(coachSessions);
  }, [coachSessions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const today = getTodayISO();

  const selectedApp = useMemo(
    () => applications.find((a) => a.id === selectedAppId) || null,
    [applications, selectedAppId]
  );

  const upcomingInterviews = useMemo(
    () => getUpcomingInterviews(applications, today),
    [applications, today]
  );

  const counts = useMemo(() => {
    const active = applications.filter((a) => a.stage !== "Archived");
    const dueToday = active.filter(
      (a) => getFollowUpMeta(a, today).status === "due_today"
    ).length;
    const overdue = active.filter(
      (a) => getFollowUpMeta(a, today).status === "overdue"
    ).length;
    const idle = active.filter(
      (a) => getIdleMeta(a, settings.idleThresholdDays, today).isIdle
    ).length;
    return {
      all: active.length,
      dueToday,
      overdue,
      idle,
      Wishlist: applications.filter((a) => a.stage === "Wishlist").length,
      Applied: applications.filter((a) => a.stage === "Applied").length,
      Screening: applications.filter((a) => a.stage === "Screening").length,
      Interview: applications.filter((a) => a.stage === "Interview").length,
      Offer: applications.filter((a) => a.stage === "Offer").length,
      Archived: applications.filter((a) => a.stage === "Archived").length,
    };
  }, [applications, settings.idleThresholdDays, today]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = applications.filter((app) => {
      if (regionFilter !== "ALL" && (app.region || "US") !== regionFilter) {
        return false;
      }

      if (q) {
        const matches =
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          (app.currency || "").toLowerCase().includes(q) ||
          (app.appliedStatus || "").toLowerCase().includes(q) ||
          (app.recruiterAction || "").toLowerCase().includes(q) ||
          (app.contactName || "").toLowerCase().includes(q) ||
          (app.notes || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filter === "all") return app.stage !== "Archived";
      if (filter === "due_today") {
        return getFollowUpMeta(app, today).status === "due_today";
      }
      if (filter === "overdue") {
        return getFollowUpMeta(app, today).status === "overdue";
      }
      if (filter === "idle") {
        return getIdleMeta(app, settings.idleThresholdDays, today).isIdle;
      }
      return app.stage === filter;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "company") {
        return a.company.localeCompare(b.company);
      }
      if (sortMode === "recent") {
        return (b.lastActivityAt || b.appliedDate).localeCompare(
          a.lastActivityAt || a.appliedDate
        );
      }
      // Priority sort: Overdue -> Due Today -> Idle -> Upcoming Interview -> Recent
      const score = (item: JobApplication) => {
        const fu = getFollowUpMeta(item, today);
        const idle = getIdleMeta(item, settings.idleThresholdDays, today);
        if (fu.status === "overdue") return 0;
        if (fu.status === "due_today") return 1;
        if (idle.isIdle) return 2;
        if (item.interviewDate && item.interviewDate >= today) return 3;
        return 4;
      };
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;
      return (a.followUpDate || "9999-12-31").localeCompare(
        b.followUpDate || "9999-12-31"
      );
    });
  }, [
    applications,
    filter,
    regionFilter,
    searchQuery,
    sortMode,
    settings.idleThresholdDays,
    today,
  ]);

  const handleSaveApplication = (
    data: Omit<JobApplication, "id" | "timeline">,
    existingId?: string
  ) => {
    if (existingId) {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? {
                ...item,
                ...data,
                lastActivityAt: today,
                timeline: [
                  ...(item.timeline || []),
                  {
                    id: `tl-${Date.now()}`,
                    date: today,
                    label: "Updated application details",
                    type: "note",
                  },
                ],
              }
            : item
        )
      );
      showToast(`Updated ${data.company}`);
    } else {
      const newApp: JobApplication = {
        ...data,
        id: `app-${Date.now()}`,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            date: data.appliedDate || today,
            label: `Added application (${data.stage})`,
            type: "applied",
          },
        ],
      };
      setApplications((prev) => [newApp, ...prev]);
      showToast(`Added ${data.company} to pipeline`);
    }
    setEditingApp(null);
  };

  const handleDeleteApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    if (selectedAppId === appId) setSelectedAppId(null);
    if (target) showToast(`Removed ${target.company}`);
  };

  const handleChangeStage = (appId: string, stage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId
          ? {
              ...item,
              stage,
              appliedStatus:
                stage === "Wishlist"
                  ? undefined
                  : stage === "Offer"
                  ? "Offer Extended"
                  : stage === "Archived"
                  ? "Not Selected"
                  : item.appliedStatus || "Submitted",
              lastActivityAt: today,
              timeline: [
                ...(item.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  date: today,
                  label: `Moved stage to ${stage}`,
                  type: "stage",
                },
              ],
            }
          : item
      )
    );
    showToast(`Stage updated to ${stage}`);
  };

  const handleUpdateAppliedStatus = (
    appId: string,
    appliedStatus: AppliedStatus
  ) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId
          ? {
              ...item,
              appliedStatus,
              lastActivityAt: today,
              timeline: [
                ...(item.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  date: today,
                  label: `Application status updated: ${appliedStatus}`,
                  type: "stage",
                },
              ],
            }
          : item
      )
    );
    showToast(`Application status: ${appliedStatus}`);
  };

  const handleLogRecruiterAction = (
    appId: string,
    action: RecruiterActionType
  ) => {
    setApplications((prev) =>
      prev.map((item) => {
        if (item.id !== appId) return item;

        let nextAppliedStatus = item.appliedStatus;
        if (action === "Application Viewed" && (!nextAppliedStatus || nextAppliedStatus === "Submitted")) {
          nextAppliedStatus = "Under Review";
        } else if (action === "Recruiter Reached Out" || action === "Phone Screen Invite") {
          nextAppliedStatus = "Recruiter Reached Out";
        } else if (action === "Sent Assessment") {
          nextAppliedStatus = "Assessment Sent";
        } else if (action === "Requested Availability") {
          nextAppliedStatus = "Shortlisted";
        } else if (action === "Put on Hold") {
          nextAppliedStatus = "On Hold";
        }

        return {
          ...item,
          recruiterAction: action,
          recruiterActionDate: action === "None" ? undefined : today,
          appliedStatus: nextAppliedStatus,
          lastActivityAt: today,
          timeline:
            action === "None"
              ? item.timeline
              : [
                  ...(item.timeline || []),
                  {
                    id: `tl-${Date.now()}`,
                    date: today,
                    label: `Recruiter action: ${action}`,
                    type: "recruiter",
                  },
                ],
        };
      })
    );
    showToast(
      action === "None"
        ? "Cleared recruiter action"
        : `Logged recruiter action: ${action}`
    );
  };

  const handleUpdateFollowUpDate = (appId: string, newDate: string) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId
          ? {
              ...item,
              followUpDate: newDate || undefined,
              lastActivityAt: today,
              timeline: [
                ...(item.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  date: today,
                  label: newDate
                    ? `Scheduled follow-up for ${newDate}`
                    : "Cleared follow-up date",
                  type: "followup",
                },
              ],
            }
          : item
      )
    );
    showToast("Follow-up date updated");
  };

  const handleMarkFollowedUp = (appId: string, customLabel?: string) => {
    const nextDate = addDaysISO(today, settings.defaultFollowUpDays);
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId
          ? {
              ...item,
              lastActivityAt: today,
              followUpDate: nextDate,
              timeline: [
                ...(item.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  date: today,
                  label:
                    customLabel ||
                    `Logged touchpoint — next follow-up ${nextDate}`,
                  type: "followup",
                },
              ],
            }
          : item
      )
    );
    showToast(`Touchpoint logged · Next follow-up in ${settings.defaultFollowUpDays}d`);
  };

  const handleSaveJdAnalysis = (
    appId: string,
    jobDescription: string,
    analysis: JobDescriptionAnalysis
  ) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === appId
          ? {
              ...item,
              jobDescription,
              jdAnalysis: analysis,
              lastActivityAt: today,
              timeline: [
                ...(item.timeline || []),
                {
                  id: `tl-${Date.now()}`,
                  date: today,
                  label: `Analyzed job description (${analysis.requiredSkills.length} skills extracted)`,
                  type: "note",
                },
              ],
            }
          : item
      )
    );
    showToast("Extracted skills, 3 interview questions, and recruiter note");
  };

  const handlePrepWithCoach = (app: JobApplication) => {
    setCoachAppId(app.id);
    setActiveTab("coach");
  };

  const handleAddResume = (doc: Omit<ResumeDoc, "id">) => {
    const created: ResumeDoc = { ...doc, id: `res-${Date.now()}` };
    setResumes((prev) => [created, ...prev]);
    showToast(`Added resume ${doc.version}`);
  };

  const FILTER_TABS: { id: PipelineFilter; label: string; count: number }[] = [
    { id: "all", label: "Active", count: counts.all },
    { id: "due_today", label: "Due Today", count: counts.dueToday },
    { id: "overdue", label: "Overdue", count: counts.overdue },
    { id: "idle", label: "Idle", count: counts.idle },
    { id: "Interview", label: "Interview", count: counts.Interview },
    { id: "Screening", label: "Screening", count: counts.Screening },
    { id: "Applied", label: "Applied", count: counts.Applied },
    { id: "Offer", label: "Offer", count: counts.Offer },
    { id: "Wishlist", label: "Wishlist", count: counts.Wishlist },
    { id: "Archived", label: "Archived", count: counts.Archived },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-20 md:pb-10">
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewApp={() => {
          setEditingApp(null);
          setModalOpen(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 space-y-5">
        {activeTab === "pipeline" && (
          <>
            {/* Screen Header & Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                  Application Pipeline
                </h1>
                <p className="text-sm text-slate-600 mt-1 tabular-nums">
                  {counts.all} active {counts.all === 1 ? "role" : "roles"} ·{" "}
                  <span className="font-medium text-[#D97706]">
                    {counts.dueToday} due today
                  </span>{" "}
                  ·{" "}
                  <span className="font-medium text-[#BA1A1A]">
                    {counts.overdue} overdue
                  </span>{" "}
                  ·{" "}
                  <span className="font-medium text-[#4338CA]">
                    {upcomingInterviews.length} upcoming{" "}
                    {upcomingInterviews.length === 1 ? "interview" : "interviews"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {idleBannerDismissed && counts.idle > 0 && (
                  <button
                    type="button"
                    onClick={() => setIdleBannerDismissed(false)}
                    className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs font-semibold text-[#92400E] whitespace-nowrap"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Show {counts.idle} Idle Alerts</span>
                  </button>
                )}

                <div className="inline-flex items-center h-10 px-2.5 rounded-xl bg-white border border-slate-300 gap-1.5 focus-within:border-[#4338CA]">
                  <Globe className="w-4 h-4 text-[#4338CA] shrink-0" />
                  <select
                    value={regionFilter}
                    onChange={(e) => {
                      const val = e.target.value as JobRegionCode | "ALL";
                      setRegionFilter(val);
                      if (val !== "ALL") {
                        setSettings((prev) => ({ ...prev, preferredRegion: val }));
                      }
                    }}
                    aria-label="Select applying job region"
                    className="h-full bg-transparent text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none pr-1"
                  >
                    <option value="ALL">Region: All Regions</option>
                    {JOB_REGIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name} ({r.currencyCode} {r.currencySymbol.trim()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 sm:flex-initial sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company, role, location..."
                    aria-label="Search applications"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#4338CA] focus:ring-3 focus:ring-[#4338CA]/15"
                  />
                </div>

                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  aria-label="Sort applications"
                  className="h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#4338CA]"
                >
                  <option value="priority">Sort: Follow-up Priority</option>
                  <option value="recent">Sort: Recent Activity</option>
                  <option value="company">Sort: Company A–Z</option>
                </select>
              </div>
            </div>

            {/* Upcoming Interviews Summary Strip */}
            <UpcomingInterviewsStrip
              interviews={upcomingInterviews}
              onPrepWithCoach={handlePrepWithCoach}
              onSelectApp={(app) => setSelectedAppId(app.id)}
              onScheduleNew={() => {
                setEditingApp(null);
                setModalOpen(true);
              }}
            />

            {/* Idle Applications Alert Banner */}
            <IdleAlertsBanner
              applications={applications}
              idleThresholdDays={settings.idleThresholdDays}
              onChangeThreshold={(days) =>
                setSettings((prev) => ({ ...prev, idleThresholdDays: days }))
              }
              onLogCheckIn={(appId) => handleMarkFollowedUp(appId)}
              onDraftFollowUp={(app) => setDraftModalApp(app)}
              onSelectApp={(app) => setSelectedAppId(app.id)}
              dismissed={idleBannerDismissed}
              onDismiss={() => setIdleBannerDismissed(true)}
            />

            {/* Interactive Filter Tabs */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
              role="tablist"
              aria-label="Filter applications"
            >
              {FILTER_TABS.map((tab) => {
                const active = filter === tab.id;
                const isAlertFilter =
                  (tab.id === "overdue" || tab.id === "due_today" || tab.id === "idle") &&
                  tab.count > 0;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                      active
                        ? "bg-[#4338CA] text-white border-[#4338CA]"
                        : isAlertFilter
                        ? "bg-white text-[#0F172A] border-slate-200 hover:bg-slate-50"
                        : "bg-white text-slate-600 border-slate-200 hover:text-[#0F172A] hover:bg-slate-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md tabular-nums ${
                        active
                          ? "bg-white/20 text-white"
                          : tab.id === "overdue" && tab.count > 0
                          ? "bg-[#FEE2E2] text-[#BA1A1A]"
                          : tab.id === "due_today" && tab.count > 0
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Applications Grid */}
            {filteredApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <p className="font-display text-base font-semibold text-[#0F172A]">
                  No applications match this filter
                </p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Try clearing your search or switching back to Active roles, or add a new opportunity to your pipeline.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {filter !== "all" || regionFilter !== "ALL" || searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFilter("all");
                        setRegionFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#0F172A]"
                    >
                      Show All Active
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingApp(null);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#4338CA] text-white text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Application</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    idleThresholdDays={settings.idleThresholdDays}
                    onSelect={(item) => setSelectedAppId(item.id)}
                    onUpdateFollowUpDate={handleUpdateFollowUpDate}
                    onMarkFollowedUp={(id, customLabel) =>
                      handleMarkFollowedUp(id, customLabel)
                    }
                    onDraftFollowUp={(item) => setDraftModalApp(item)}
                    onPrepWithCoach={handlePrepWithCoach}
                    onUpdateAppliedStatus={handleUpdateAppliedStatus}
                    onLogRecruiterAction={handleLogRecruiterAction}
                    onSaveJdAnalysis={handleSaveJdAnalysis}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "coach" && (
          <AiCoachView
            applications={applications}
            selectedAppId={coachAppId}
            onSelectAppId={setCoachAppId}
            sessions={coachSessions}
            onSaveSession={(session) =>
              setCoachSessions((prev) => [session, ...prev])
            }
          />
        )}

        {activeTab === "resumes" && (
          <ResumesView
            resumes={resumes}
            applications={applications}
            onAddResume={handleAddResume}
          />
        )}

        {activeTab === "insights" && (
          <InsightsView
            applications={applications}
            settings={settings}
            onUpdateSettings={(next) => {
              setSettings(next);
              showToast("Alert preferences saved");
            }}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <ApplicationModal
        isOpen={modalOpen}
        initialApp={editingApp}
        resumes={resumes}
        defaultFollowUpDays={settings.defaultFollowUpDays}
        defaultRegion={
          regionFilter === "ALL" ? settings.preferredRegion : regionFilter
        }
        onClose={() => {
          setModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApplication}
      />

      <ApplicationDetailDrawer
        app={selectedApp}
        idleThresholdDays={settings.idleThresholdDays}
        onClose={() => setSelectedAppId(null)}
        onEdit={(app) => {
          setSelectedAppId(null);
          setEditingApp(app);
          setModalOpen(true);
        }}
        onDelete={handleDeleteApplication}
        onChangeStage={handleChangeStage}
        onUpdateAppliedStatus={handleUpdateAppliedStatus}
        onLogRecruiterAction={handleLogRecruiterAction}
        onUpdateFollowUpDate={handleUpdateFollowUpDate}
        onLogTouchpoint={(appId, note) => handleMarkFollowedUp(appId, note)}
        onSaveJdAnalysis={handleSaveJdAnalysis}
        onDraftFollowUp={(app) => setDraftModalApp(app)}
        onPrepWithCoach={handlePrepWithCoach}
      />

      <FollowUpDraftModal
        app={draftModalApp}
        onClose={() => setDraftModalApp(null)}
        onMarkSent={(appId, subject) =>
          handleMarkFollowedUp(appId, `Sent follow-up: "${subject}"`)
        }
      />

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
