"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Star,
  Lock,
  Play,
  Check,
  Crown,
  WarningCircle,
  Sparkle,
} from "@phosphor-icons/react";
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
          <Crown className="w-3.5 h-3.5" weight="fill" />
          <span>BOSS CHECKPOINT</span>
        </div>
      )}

      {/* Remediation Header Pill */}
      {isRemediation && (
        <div className="absolute -top-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-alert text-white flex items-center gap-1 shadow-lg shadow-alert/30">
          <WarningCircle className="w-3.5 h-3.5" weight="bold" />
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
          <Check className="w-8 h-8 text-signal" weight="bold" />
        ) : isLocked ? (
          <Lock className="w-6 h-6 text-text-secondary" weight="fill" />
        ) : isBoss ? (
          <Crown className="w-7 h-7 text-warning" weight="fill" />
        ) : isRemediation ? (
          <Sparkle className="w-7 h-7 text-alert" weight="fill" />
        ) : (
          <Play className="w-6 h-6 ml-0.5 text-focus" weight="fill" />
        )}

        <span className="text-[11px] font-black tracking-wider uppercase font-mono mt-0.5">
          LVL {node.displayLevel}
        </span>

        {/* Pulsing Active Beacon */}
        {isActive && (
          <span className="absolute -inset-1 rounded-full border border-focus animate-ping opacity-30 pointer-events-none" />
        )}
      </div>

      {/* Star Rating Badge for Completed Nodes */}
      {isCompleted && (
        <div className="flex items-center gap-0.5 -mt-2 bg-paper px-2 py-0.5 rounded-full border border-signal/30 z-10">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= (node.starsEarned || 3)
                  ? "text-warning fill-warning"
                  : "text-border"
              }`}
              weight="fill"
            />
          ))}
        </div>
      )}

      {/* Node Description Label */}
      <div className="mt-2 flex flex-col items-center text-center max-w-[150px]">
        <span className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-focus transition-colors">
          {node.title}
        </span>
        <span className="text-[10px] text-text-secondary font-medium">
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
