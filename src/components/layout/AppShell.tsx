"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitFork,
  Target,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  Trophy,
  Sparkles,
  Shield,
  Database,
  Users,
  Brain,
  Video,
} from "lucide-react";

import { useSupabase } from "@/components/providers/SupabaseProvider";
import { SetupModal } from "@/components/layout/SetupModal";

const AI_RECOMMENDER_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Level Map (DAG)", href: "/roadmap", icon: GitFork },
  { label: "CAT Assessments", href: "/assessments/cat", icon: Target },
  { label: "Socratic Copilot", href: "/coach", icon: Brain },
];

const COLLABORATION_NAV = [
  { label: "Social Study Room", href: "/social", icon: Users },
  { label: "Study Notes", href: "/notes", icon: FileText },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, signOut } = useSupabase();

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = (fullName: string) => {
    return fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "LP";
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex min-h-screen bg-paper text-text-primary w-full font-sans antialiased selection:bg-focus/30 selection:text-focus">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-border backdrop-blur-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-6"
          )}
        >
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-focus flex items-center justify-center shadow-lg shadow-focus/25 group-hover:scale-105 transition-transform text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-text-primary flex items-center gap-1.5">
                  LearnPath <span className="text-focus text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-focus/10 border border-focus/20">AI 2.0</span>
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-surface rounded-xl transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          className={cn(
            "flex-1 py-4 space-y-4 overflow-y-auto no-scrollbar transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {isAdmin ? (
            <div className="space-y-1">
              <div className={cn("px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider", isCollapsed && "hidden")}>
                Admin
              </div>
              {[
                { label: "Admin Overview", href: "/admin", icon: Shield },
                { label: "User Management", href: "/admin/users", icon: Database },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-xl text-xs sm:text-sm transition-all duration-200 group relative",
                      isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2",
                      isActive ? "bg-focus text-white font-bold shadow-md shadow-focus/20" : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ) : (
            <>
              {/* SECTION 1: AI LEARNING PATH RECOMMENDER */}
              <div className="space-y-1">
                <div className={cn("px-3 py-1 text-[10px] font-bold text-focus uppercase tracking-wider", isCollapsed && "hidden")}>
                  AI Path Recommender
                </div>
                {AI_RECOMMENDER_NAV.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-xl text-xs sm:text-sm transition-all duration-200 group relative",
                        isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
                        isActive
                          ? "bg-focus text-white font-bold shadow-lg shadow-focus/25"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface"
                      )}
                    >
                      <item.icon
                        className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-text-secondary group-hover:text-focus")}
                      />
                      {!isCollapsed && <span>{item.label}</span>}

                      {isCollapsed && (
                        <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* SECTION 2: COLLABORATION & STUDY */}
              <div className="space-y-1 pt-2 border-t border-border">
                <div className={cn("px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider", isCollapsed && "hidden")}>
                  Collaboration & Notes
                </div>
                {COLLABORATION_NAV.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-xl text-xs sm:text-sm transition-all duration-200 group relative",
                        isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
                        isActive
                        ? "bg-focus text-white font-bold shadow-lg shadow-focus/25"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface"
                      )}
                    >
                      <item.icon
                        className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-text-secondary group-hover:text-focus")}
                      />
                      {!isCollapsed && <span>{item.label}</span>}

                      {isCollapsed && (
                        <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div
          className={cn(
            "p-3 border-t border-border space-y-1 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          <Link
            href="/settings"
            className={cn(
              "flex items-center rounded-xl text-xs sm:text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-200 group relative",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2",
              pathname === "/settings" && "bg-surface text-text-primary font-semibold border border-border"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                Settings
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-xl text-xs sm:text-sm text-text-secondary hover:text-alert hover:bg-alert/10 transition-all duration-200 group relative cursor-pointer",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-grow flex flex-col min-h-screen transition-all duration-300 ease-in-out bg-paper",
          isCollapsed ? "pl-20" : "pl-64"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-8 bg-paper/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center max-w-md w-full relative">
            <Search className="absolute left-3.5 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search skills, topics, or documentation..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border focus:outline-none focus:border-focus/50 text-xs text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/social"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-focus bg-focus/10 hover:bg-focus/20 border border-focus/20 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Live Study Room</span>
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
            </Link>

            <Link
              href="/onboarding"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-text-primary bg-surface hover:bg-surface/80 border border-border px-3 py-1.5 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-focus" />
              <span>Customize Path</span>
            </Link>

            <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-signal rounded-full ring-2 ring-paper"></span>
            </button>

            <div className="w-px h-6 bg-border"></div>

            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-surface hover:bg-surface/80 border border-border hover:border-focus/50 transition-all cursor-pointer group"
              title="Open Profile & Account Details"
            >
              <div className="w-8 h-8 rounded-full bg-focus/15 border border-focus/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <span className="text-xs font-bold text-focus">{getInitials(profile?.name || "Alex Dev")}</span>
              </div>
              <span className="text-sm font-medium text-text-primary hidden md:inline-block group-hover:text-focus transition-colors">
                {profile?.name || "Alex Dev"}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
        <SetupModal />
      </div>
    </div>
  );
}
