"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  WarningOctagon,
  ArrowsClockwise,
  ArrowLeft,
  House,
  CaretDown,
  CaretUp,
  Bug,
  Lifebuoy,
} from "@phosphor-icons/react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | { message?: string; digest?: string; stack?: string };
  reset?: () => void;
  homeHref?: string;
  backHref?: string;
  showSupportLink?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something Went Wrong",
  message = "An unexpected error occurred while loading this view. You can try refreshing the component or returning to your dashboard.",
  error,
  reset,
  homeHref = "/dashboard",
  backHref,
  showSupportLink = true,
  className = "",
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`rounded-3xl border border-alert/30 bg-surface/80 backdrop-blur-md p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-2xl shadow-alert/5 max-w-2xl mx-auto my-8 ${className}`}
    >
      {/* Alert Icon with Pulse */}
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-alert/15 border border-alert/30 text-alert flex items-center justify-center shadow-lg shadow-alert/20">
          <WarningOctagon className="w-8 h-8" weight="duotone" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-alert animate-ping pointer-events-none" />
      </div>

      {/* Title & Message */}
      <div className="space-y-2 max-w-lg mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-alert/10 text-alert border border-alert/25 inline-block">
          Runtime Exception
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {message}
        </p>
      </div>

      {/* Technical Error Details Accordion */}
      {error && (
        <div className="w-full max-w-lg text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2 px-3 rounded-xl bg-paper hover:bg-border/60 border border-border text-xs text-text-secondary flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-mono">
              <Bug className="w-3.5 h-3.5 text-alert" />
              Technical Error Details {(error as any)?.digest ? `(ID: ${String((error as any).digest).slice(0, 8)})` : ""}
            </span>
            {showDetails ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
          </button>


          {showDetails && (
            <div className="mt-2 p-3.5 rounded-xl bg-zinc-950 border border-alert/20 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-48 leading-relaxed">
              <p className="text-alert font-bold">{error.message || "Unknown error details"}</p>
              {error.stack && (
                <pre className="mt-2 text-zinc-500 text-[10px] whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {reset && (
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-focus/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowsClockwise className="w-4 h-4" weight="bold" />
            <span>Try Again</span>
          </button>
        )}

        {backHref && (
          <Link
            href={backHref}
            className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Link>
        )}

        {homeHref && (
          <Link
            href={homeHref}
            className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <House className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {showSupportLink && (
        <p className="text-[11px] text-text-secondary pt-2">
          Persistent issue? Check your connection or restart the dev session.
        </p>
      )}
    </div>
  );
}
