"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  GameController,
  Target,
  Note,
  Gear,
  SignOut,
  MagnifyingGlass,
  Bell,
  CaretDown,
  List,
  Trophy,
  Sparkle,
  Shield,
  Database,
  PlusCircle,
} from "@phosphor-icons/react";

import { useSupabase } from "@/components/providers/SupabaseProvider";
import { SetupModal } from "@/components/layout/SetupModal";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "Level Map (DAG)", href: "/roadmap", icon: GameController },
  { label: "CAT Assessments", href: "/assessments/cat", icon: Target },
  { label: "Study Notes", href: "/notes", icon: Note },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "New Goal Wizard", href: "/onboarding", icon: PlusCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile, signOut } = useSupabase();

  const handleLogout = async () => {
    await signOut();
  };

  // Compute initials from name
  const getInitials = (fullName: string) => {
    return fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "LP";
  };

  const navItems = profile.role === "admin"
    ? [
        { label: "Admin Overview", href: "/admin", icon: Shield },
        { label: "Admin Content", href: "/admin/days", icon: Database },
      ]
    : NAV_ITEMS;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 w-full font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-950/95 border-r border-zinc-800 text-zinc-100 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-zinc-800/80 transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-between px-6"
          )}
        >
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkle className="w-4 h-4 text-zinc-950" weight="fill" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-zinc-100 flex items-center gap-1">
                  LearnPath <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI 2.0</span>
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <nav
          className={cn(
            "flex-1 py-6 space-y-1.5 overflow-visible transition-all duration-300",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl text-sm transition-all duration-200 group relative",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/25"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <item.icon
                  weight={isActive ? "fill" : "bold"}
                  className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-zinc-950" : "text-zinc-400 group-hover:text-emerald-400")}
                />
                {!isCollapsed && <span>{item.label}</span>}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "p-4 border-t border-zinc-800/80 space-y-1.5 transition-all duration-300",
            isCollapsed ? "px-2" : "p-4"
          )}
        >
          <Link
            href="/settings"
            className={cn(
              "flex items-center rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all duration-200 group relative",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2",
              pathname === "/settings" && "bg-zinc-800 text-zinc-100 font-semibold"
            )}
          >
            <Gear weight={pathname === "/settings" ? "fill" : "bold"} className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                Settings
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-xl text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group relative cursor-pointer",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2"
            )}
          >
            <SignOut weight="bold" className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-2xl">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-grow flex flex-col min-h-screen transition-all duration-300 ease-in-out bg-zinc-950",
          isCollapsed ? "pl-20" : "pl-64"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80">
          <div className="flex items-center max-w-md w-full relative">
            <MagnifyingGlass className="absolute left-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search skills, lectures, or documentation..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 focus:outline-none focus:border-emerald-500/50 text-xs text-zinc-100 placeholder:text-zinc-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Sparkle className="w-3.5 h-3.5" />
              <span>Customize Path</span>
            </Link>

            <button className="relative p-2 text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-zinc-950"></span>
            </button>

            <div className="w-px h-6 bg-zinc-800"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">{getInitials(profile?.name || "Alex Dev")}</span>
              </div>
              <span className="text-sm font-medium text-zinc-200 hidden md:inline-block">
                {profile?.name || "Alex Dev"}
              </span>
            </div>
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
