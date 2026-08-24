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
        className="!bg-zinc-700 !w-2 !h-2 !border-none opacity-0"
      />

      {/* Boss Checkpoint Header Pill */}
      {isBoss && (
        <div className="absolute -top-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-bounce">
          <Crown className="w-3.5 h-3.5" weight="fill" />
          <span>BOSS CHECKPOINT</span>
        </div>
      )}

      {/* Remediation Header Pill */}
      {isRemediation && (
        <div className="absolute -top-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-zinc-950 flex items-center gap-1 shadow-lg shadow-orange-500/30">
          <WarningCircle className="w-3.5 h-3.5" weight="bold" />
          <span>REMEDIATION LAB</span>
        </div>
      )}

      {/* Main Circular Island Badge */}
      <div
        className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 relative transition-all duration-300 ${
          isCompleted
            ? "border-emerald-500 bg-emerald-950/80 text-emerald-400 shadow-lg shadow-emerald-500/20"
            : isActive
            ? isBoss
              ? "border-amber-400 bg-amber-950/90 text-amber-300 shadow-xl shadow-amber-500/40 ring-4 ring-amber-400/20"
              : isRemediation
              ? "border-orange-500 bg-orange-950/90 text-orange-300 shadow-xl shadow-orange-500/30 ring-4 ring-orange-500/20"
              : "border-emerald-400 bg-zinc-900 text-emerald-300 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20"
            : isLocked
            ? "border-zinc-800 bg-zinc-900/90 text-zinc-600 hover:border-zinc-700"
            : "border-zinc-700 bg-zinc-900 text-zinc-300"
        }`}
      >
        {/* Node Center Icon / Level Number */}
        {isCompleted ? (
          <Check className="w-8 h-8 text-emerald-400" weight="bold" />
        ) : isLocked ? (
          <Lock className="w-6 h-6 text-zinc-600" weight="fill" />
        ) : isBoss ? (
          <Crown className="w-7 h-7 text-amber-300" weight="fill" />
        ) : isRemediation ? (
          <Sparkle className="w-7 h-7 text-orange-400" weight="fill" />
        ) : (
          <Play className="w-6 h-6 ml-0.5 text-emerald-400" weight="fill" />
        )}

        <span className="text-[11px] font-black tracking-wider uppercase font-mono mt-0.5">
          LVL {node.displayLevel}
        </span>

        {/* Pulsing Active Beacon */}
        {isActive && (
          <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-30 pointer-events-none" />
        )}
      </div>

      {/* Star Rating Badge for Completed Nodes */}
      {isCompleted && (
        <div className="flex items-center gap-0.5 -mt-2 bg-zinc-950 px-2 py-0.5 rounded-full border border-emerald-500/30 z-10">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${
                star <= (node.starsEarned || 3)
                  ? "text-amber-400 fill-amber-400"
                  : "text-zinc-700"
              }`}
              weight="fill"
            />
          ))}
        </div>
      )}

      {/* Node Description Label */}
      <div className="mt-2 flex flex-col items-center text-center max-w-[150px]">
        <span className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {node.title}
        </span>
        <span className="text-[10px] text-zinc-500 font-medium">
          Week {node.targetWeek} • {node.estimatedMinutes}m
        </span>
      </div>

      {/* Bottom Handle for outgoing dependency edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-zinc-700 !w-2 !h-2 !border-none opacity-0"
      />
    </div>
  );
});

LevelMapNode.displayName = "LevelMapNode";
