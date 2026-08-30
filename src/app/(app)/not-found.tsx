"use client";

import Link from "next/link";
import {
  Compass,
  House,
  MapTrifold,
  GameController,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AppNotFound() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <EmptyState
        icon={<Compass className="w-8 h-8 text-focus" weight="duotone" />}
        badgeText="404 App Route Not Found"
        title="Milestone Or View Not Found"
        description="The requested dashboard view or learning node could not be resolved in your active DAG. Please select a valid module from the roadmap."
        primaryAction={{
          label: "Return to Dashboard",
          href: "/dashboard",
          icon: <House className="w-4 h-4" weight="bold" />,
        }}
        secondaryAction={{
          label: "Open Candy Crush Roadmap",
          href: "/roadmap",
          icon: <MapTrifold className="w-4 h-4" />,
        }}
        suggestions={[
          "Open Learning Canvas",
          "Check Study Notes",
          "Join Social Study Circle",
        ]}
        onSuggestionClick={(s) => {
          if (s.includes("Canvas")) window.location.href = "/learn/lvl-1";
          if (s.includes("Notes")) window.location.href = "/notes";
          if (s.includes("Social")) window.location.href = "/social";
        }}
      />
    </div>
  );
}
