"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-text-primary flex items-center justify-center p-6">
      <ErrorState
        title="Application Exception Detected"
        message="A runtime error occurred in the React rendering tree. We've captured the error telemetry."
        error={error}
        reset={reset}
        homeHref="/dashboard"
      />
    </div>
  );
}
