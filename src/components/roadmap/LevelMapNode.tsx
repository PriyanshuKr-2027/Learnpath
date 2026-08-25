"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Star,
  Lock,
  Play,
  Check,
  Crown,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { LevelNode } from "@/types";

export interface LevelMapNodeData extends LevelNode {
  onSelectNode: (node: LevelNode) => void;
}

export const LevelMapNode = memo(({ data }: { data: any }) => {
  const node = data as LevelMapNodeData;
  const isCompleted = node.status === "completed";
  const isActive = node.status === "active";
  const isLocked = node.status === "locked";
  const isRemediation = node.isRemediation;
  const isBoss = node.isBossCheckpoint;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    node.onSelectNode?.(node);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
        isActive ? "scale-105" : "hover:scale-105"
      }`}
    >
      {/* Top Handle for incoming dependency edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border !w-2 !h-2 !border-none opacity-0"
      />

      {/* Boss Checkpoint Header Pill */}
      {isBoss && (
        <div className="absolute -top-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning text-paper flex items-center gap-1 shadow-lg shadow-warning/30 animate-bounce">
          <Crown className="w-3 h-3" />
          <span>BOSS CHECKPOINT</span>
        </div>
      )}

      {/* Remediation Header Pill */}
      {isRemediation && (
        <div className="absolute -top-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-alert text-white flex items-center gap-1 shadow-lg shadow-alert/30">
          <AlertCircle className="w-3 h-3" />
          <span>REMEDIATION LAB</span>
        </div>
      )}

      {/* Main Circular Island Badge */}
      <div
        className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 relative transition-all duration-300 ${
          isCompleted
            ? "border-signal bg-signal/15 text-signal shadow-lg shadow-signal/20"
            : isActive
            ? isBoss
              ? "border-warning bg-warning/15 text-warning shadow-xl shadow-warning/40 ring-4 ring-warning/20"
              : isRemediation
              ? "border-alert bg-alert/15 text-alert shadow-xl shadow-alert/30 ring-4 ring-alert/20"
              : "border-focus bg-focus/15 text-focus shadow-xl shadow-focus/30 ring-4 ring-focus/20"
            : isLocked
            ? "border-border bg-surface text-text-secondary hover:border-border/80"
            : "border-border bg-surface text-text-primary"
        }`}
      >
        {/* Node Center Icon / Level Number */}
        {isCompleted ? (
          <Check className="w-7 h-7 text-signal stroke-[3]" />
        ) : isLocked ? (
          <Lock className="w-5 h-5 text-text-secondary" />
        ) : isBoss ? (
          <Crown className="w-6 h-6 text-warning" />
        ) : isRemediation ? (
          <Sparkles className="w-6 h-6 text-alert" />
        ) : (
          <Play className="w-6 h-6 ml-0.5 text-focus fill-focus" />
        )}

        <span className="text-[11px] font-black tracking-wider uppercase font-mono mt-0.5">
          LVL {node.displayLevel}
        </span>

        {/* Pulsing Active Beacon */}
        {isActive && (
          <span className="absolute -inset-1 rounded-full border border-focus animate-ping opacity-30 pointer-events-none" />
        )}
      </div>

      {/* Star Mastery Tier for completed levels */}
      {isCompleted && (
        <div className="flex items-center gap-0.5 mt-1 bg-surface px-2 py-0.5 rounded-full border border-border shadow-sm">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-2.5 h-2.5 ${
                star <= (node.starsEarned || 3)
                  ? "text-warning fill-warning"
                  : "text-text-secondary/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Level Title & Estimated Time */}
      <div className="mt-1.5 flex flex-col items-center max-w-[140px] text-center">
        <span className="text-xs font-semibold text-text-primary group-hover:text-focus transition-colors line-clamp-1">
          {node.title}
        </span>
        <span className="text-[10px] text-text-secondary font-mono">
          Week {node.targetWeek} • {node.estimatedMinutes}m
        </span>
      </div>

      {/* Bottom Handle for outgoing dependency edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border !w-2 !h-2 !border-none opacity-0"
      />
    </div>
  );
});

LevelMapNode.displayName = "LevelMapNode";
