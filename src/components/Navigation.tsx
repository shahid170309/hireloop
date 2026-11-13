import { BarChart3, BriefcaseBusiness, FileText, Mic, Plus } from "lucide-react";
import { NavTab } from "../types/hireloop";

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewApp: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; mobileLabel: string; icon: typeof BriefcaseBusiness }[] = [
  { id: "pipeline", label: "Pipeline", mobileLabel: "Pipeline", icon: BriefcaseBusiness },
  { id: "coach", label: "AI Coach", mobileLabel: "Coach", icon: Mic },
  { id: "resumes", label: "Resumes", mobileLabel: "Resumes", icon: FileText },
  { id: "insights", label: "Insights", mobileLabel: "Insights", icon: BarChart3 },
];

export function Navigation({ activeTab, onSelectTab, onOpenNewApp }: NavigationProps) {
  return (
    <>
      {/* Top Navigation Bar (Desktop 3-zone contract + Compact Mobile Bar) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => onSelectTab("pipeline")}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded-lg"
          >
            <span className="w-7 h-7 rounded-lg bg-[#4338CA] text-white inline-flex items-center justify-center text-xs font-bold">
              HL
            </span>
            <span>HireLoop</span>
          </button>

          {/* Zone 2: Single-line Navigation Links (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA] rounded-md ${
                    isActive
                      ? "text-[#4338CA] font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#4338CA] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenNewApp}
              className="inline-flex items-center justify-center gap-1.5 h-10 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4338CA]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors focus-visible:outline-none ${
                  isActive ? "text-[#4338CA]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[11px] font-medium whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
