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
        animated: isRemediation,
        style: {
          stroke: isRemediation ? "#E2533D" : "#3DDC84",
          strokeWidth: isRemediation ? 3 : 2.5,
          strokeDasharray: isRemediation ? "5 5" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isRemediation ? "#E2533D" : "#3DDC84",
        },
      };
    });
  }, [path.edges]);

  return (
    <div className="w-full h-[720px] rounded-3xl border border-border bg-paper relative overflow-hidden shadow-2xl">
      {/* Background Top Overlay Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-paper to-transparent pointer-events-none z-10" />

      {/* Legend Card */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-surface/90 border border-border backdrop-blur-md text-xs shadow-lg">
        <div className="flex items-center gap-1.5 text-text-primary">
          <span className="w-3 h-3 rounded-full bg-signal shadow-sm" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-primary ml-2">
          <span className="w-3 h-3 rounded-full bg-focus animate-pulse ring-2 ring-focus/30" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-primary ml-2">
          <span className="w-3 h-3 rounded-full bg-warning" />
          <span>Boss Level</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-primary ml-2">
          <span className="w-3 h-3 rounded-full bg-alert" />
          <span>Remediation</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary ml-2">
          <span className="w-3 h-3 rounded-full bg-border" />
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
          color="#14B8A622"
        />
        <Controls
          showInteractive={false}
          className="!bg-surface !border-border !text-text-primary !rounded-xl overflow-hidden shadow-xl"
        />
        <MiniMap
          nodeColor={(n: any) => {
            const data = n.data as LevelNode;
            if (data?.status === "completed") return "#10B981";
            if (data?.isBossCheckpoint) return "#F59E0B";
            if (data?.isRemediation) return "#EF4444";
            if (data?.status === "active") return "#14B8A6";
            return "#1F242F";
          }}
          maskColor="rgba(10, 10, 11, 0.75)"
          className="!bg-surface/90 !border-border !rounded-2xl overflow-hidden shadow-xl"
        />
      </ReactFlow>
    </div>
  );
}
