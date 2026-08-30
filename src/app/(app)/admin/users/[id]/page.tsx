"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CaretLeft, 
  CheckCircle, 
  Shield, 
  CalendarBlank, 
  BookOpen, 
  MagnifyingGlass, 
  ChatCircle,
  GameController,
  Trophy,
} from "@phosphor-icons/react";
import { getUserProgressList } from "@/lib/store";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { mockStore } from "@/lib/services/mockStore";

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const userId = resolvedParams.id;

  const { supabase, isMockMode } = useSupabase();

  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const userList = getUserProgressList();
    const foundUser = userList.find((u: any) => u.id === userId);
    setUser(foundUser || null);
    setLoading(false);
  }, [userId]);

  const activePath = mockStore.getLearningPath();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-400">
        <span>Loading Learner Telemetry...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
        >
          <CaretLeft className="w-4 h-4" />
          <span>Back to Admin Directory</span>
        </Link>

        <div className="p-8 sm:p-12 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto">
            <MagnifyingGlass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 inline-block">
              User Record Not Found
            </span>
            <h2 className="text-xl font-bold text-white">Learner ID #{userId} Not Found</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              This learner account does not exist in the database or may have been deleted.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all"
            >
              <CaretLeft className="w-4 h-4" weight="bold" />
              <span>Return to User Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
      >
        <CaretLeft className="w-4 h-4" />
        <span>Back to Admin Overview</span>
      </Link>

      {/* User Header */}
      <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-2xl border border-zinc-700" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              {user.name}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {user.role}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
            <span className="text-sm font-mono font-bold text-emerald-400 block">{user.percentage}%</span>
            <span className="text-[10px] text-zinc-500">Readiness</span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
            <span className="text-sm font-mono font-bold text-amber-400 block">{user.solvedCount}</span>
            <span className="text-[10px] text-zinc-500">Milestones</span>
          </div>
        </div>
      </div>

      {/* Learning Path Levels Roster */}
      {activePath ? (
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <GameController className="w-5 h-5 text-emerald-400" />
            Assigned Candy Crush DAG Path ({activePath.levels.length} Levels)
          </h2>

          <div className="space-y-2">
            {activePath.levels.map((lvl) => (
              <div
                key={lvl.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                    LVL {lvl.displayLevel}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">{lvl.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{lvl.skillName} * Week {lvl.targetWeek}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                    lvl.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : lvl.status === "active"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                  }`}
                >
                  {lvl.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 text-center text-xs text-zinc-500">
          No active learning path configured for this learner.
        </div>
      )}

    </div>
  );
}
