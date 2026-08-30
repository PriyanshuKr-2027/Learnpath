"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AppShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppShell Error Boundary]", error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <ErrorState
        title="App Module Error"
        message="An unexpected error occurred while loading this app section. Your active learning path progress and notes are safely saved."
        error={error}
        reset={reset}
        homeHref="/dashboard"
        backHref="/roadmap"
      />
    </div>
  );
}
