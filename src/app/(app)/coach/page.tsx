"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { SocraticCopilotSidecar } from "@/components/canvas/SocraticCopilotSidecar";

export default function CoachPage() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto pb-8 text-text-primary">
      {/* 24/7 Socratic AI Copilot Expanded */}
      <div className="w-full h-[760px] sm:h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-border">
        <SocraticCopilotSidecar
          level={{
            title: "Applied Business Statistics",
            skillName: "Applied Business Statistics",
          }}
        />
      </div>

      {/* Navigation CTA */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-text-secondary">
          CogniPath Pedagogical AI Engine &bull; Kahn&apos;s DAG &bull; 1-PL Rasch IRT
        </span>
        <Link
          href="/roadmap"
          className="px-6 py-3 rounded-2xl bg-focus hover:bg-focus/90 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-focus/25 transition-all"
        >
          <span>Return to Candy Crush DAG Map</span>
          <ArrowRight className="w-4 h-4" weight="bold" />
        </Link>
      </div>
    </div>
  );
}

