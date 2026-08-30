"use client";

import React from "react";
import Link from "next/link";
import {
  FolderOpen,
  ArrowRight,
  ArrowsClockwise,
  Plus,
  Sparkle,
} from "@phosphor-icons/react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  badgeText?: string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  badgeText,
  title,
  description,
  primaryAction,
  secondaryAction,
  suggestions,
  onSuggestionClick,
  className = "",
  compact = false,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface/70 backdrop-blur-md text-center flex flex-col items-center justify-center transition-all ${
        compact ? "p-6 sm:p-8 space-y-3" : "p-8 sm:p-12 space-y-4"
      } ${className}`}
    >
      {/* Icon / Illustration */}
      <div className="relative">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-focus/10 border border-focus/25 text-focus flex items-center justify-center shadow-lg shadow-focus/10 transition-transform duration-300 hover:scale-105">
          {icon || <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8" weight="duotone" />}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-focus/30 animate-ping pointer-events-none" />
      </div>

      {/* Badge (Optional) */}
      {badgeText && (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/20 flex items-center gap-1">
          <Sparkle className="w-3 h-3" weight="fill" />
          {badgeText}
        </span>
      )}

      {/* Title & Description */}
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Suggestion Chips (Optional) */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-lg">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSuggestionClick?.(s)}
              className="px-3 py-1.5 rounded-xl bg-paper hover:bg-border/80 border border-border text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer text-left"
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-focus/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                {primaryAction.icon || <Plus className="w-4 h-4" weight="bold" />}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-focus/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                {primaryAction.icon || <Plus className="w-4 h-4" weight="bold" />}
                <span>{primaryAction.label}</span>
              </button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2.5 rounded-xl bg-paper hover:bg-border border border-border text-text-secondary hover:text-text-primary font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </button>
            )
          )}
        </div>
      )}

      {children}
    </div>
  );
}
