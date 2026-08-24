"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LearningPath, LevelNode } from "@/types";
import { LevelMapNode } from "@/components/roadmap/LevelMapNode";

interface CandyCrushMapProps {
  path: LearningPath;
  onSelectNode: (node: LevelNode) => void;
}

const nodeTypes: NodeTypes = {
  levelNode: LevelMapNode as any,
};

export function CandyCrushMap({ path, onSelectNode }: CandyCrushMapProps) {
  // Convert domain levels to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return path.levels.map((lvl) => ({
      id: lvl.id,
      type: "levelNode",
      position: lvl.coordinates || { x: 350, y: 100 },
      data: {
        ...lvl,
        onSelectNode,
      },
    }));
  }, [path.levels, onSelectNode]);

  // Convert domain edges to styled React Flow edges
  const edges: Edge[] = useMemo(() => {
    return path.edges.map((edge) => {
      const isRemediation = edge.isRemediationEdge;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: isRemediation ? "#f97316" : "#10b981",
          strokeWidth: isRemediation ? 3 : 2.5,
          strokeDasharray: isRemediation ? "6 6" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isRemediation ? "#f97316" : "#10b981",
          width: 14,
          height: 14,
        },
      };
    });
  }, [path.edges]);

  return (
    <div className="w-full h-[720px] rounded-3xl border border-zinc-800 bg-zinc-950/80 relative overflow-hidden shadow-2xl">
      {/* Background Top Overlay Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none z-10" />

      {/* Legend Card */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs shadow-lg">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300 ml-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-400/30" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300 ml-2">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>👑 Boss Level</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300 ml-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span>🟠 Remediation</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400 ml-2">
          <span className="w-3 h-3 rounded-full bg-zinc-700" />
          <span>Locked</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        className="touch-pan-y"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#27272a"
        />
        <Controls
          showInteractive={false}
          className="!bg-zinc-900 !border-zinc-800 !text-zinc-100 !rounded-xl overflow-hidden shadow-xl !fill-zinc-300"
        />
        <MiniMap
          nodeColor={(n: any) => {
            const data = n.data as LevelNode;
            if (data?.status === "completed") return "#10b981";
            if (data?.isBossCheckpoint) return "#f59e0b";
            if (data?.isRemediation) return "#f97316";
            if (data?.status === "active") return "#34d399";
            return "#3f3f46";
          }}
          maskColor="rgba(9, 9, 11, 0.75)"
          className="!bg-zinc-900/90 !border-zinc-800 !rounded-2xl overflow-hidden shadow-xl"
        />
      </ReactFlow>
    </div>
  );
}
