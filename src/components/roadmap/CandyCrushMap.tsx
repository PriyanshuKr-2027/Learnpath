"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Search, Sparkles, Navigation, MousePointer, Hand, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { LearningPath, LevelNode } from "@/types";
import { LevelMapNode } from "@/components/roadmap/LevelMapNode";

interface CandyCrushMapProps {
  path: LearningPath;
  onSelectNode: (node: LevelNode) => void;
}

const nodeTypes: NodeTypes = {
  levelNode: LevelMapNode as any,
};

function CandyCrushMapInner({ path, onSelectNode }: CandyCrushMapProps) {
  const { setCenter, zoomIn, zoomOut, fitView } = useReactFlow();

  // Mode state: 'scroll' (lets page scroll naturally) vs 'interactive' (full canvas pan/zoom)
  const [mapMode, setMapMode] = useState<"interactive" | "scroll">("interactive");

  // In-map search state
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [selectedLockedNodeId, setSelectedLockedNodeId] = useState<string | null>(null);

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return path.levels.filter(
      (lvl) =>
        lvl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lvl.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `level ${lvl.displayLevel}`.includes(searchQuery.toLowerCase())
    );
  }, [path.levels, searchQuery]);

  // Handle search select
  const handleSelectSearchResult = (lvl: LevelNode) => {
    setHighlightedNodeId(lvl.id);
    setSearchQuery("");
    if (lvl.coordinates) {
      setCenter(lvl.coordinates.x + 40, lvl.coordinates.y + 40, { zoom: 1.05, duration: 800 });
    }
  };

  // Compute prerequisite ancestor level IDs for highlighting
  const prerequisiteEdgeIds = useMemo(() => {
    if (!selectedLockedNodeId) return new Set<string>();

    const highlightedEdges = new Set<string>();
    const visitedNodes = new Set<string>();
    const queue = [selectedLockedNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visitedNodes.has(current)) continue;
      visitedNodes.add(current);

      // Find all incoming edges to current
      path.edges.forEach((edge) => {
        if (edge.target === current) {
          highlightedEdges.add(edge.id);
          queue.push(edge.source);
        }
      });
    }

    return highlightedEdges;
  }, [selectedLockedNodeId, path.edges]);

  // Intercept node selection to update locked prerequisite paths
  const handleNodeClick = useCallback(
    (node: LevelNode) => {
      if (node.status === "locked") {
        setSelectedLockedNodeId(node.id);
      } else {
        setSelectedLockedNodeId(null);
      }
      setHighlightedNodeId(node.id);
      onSelectNode(node);
    },
    [onSelectNode]
  );

  // Convert domain levels to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return path.levels.map((lvl) => ({
      id: lvl.id,
      type: "levelNode",
      position: lvl.coordinates || { x: 350, y: 100 },
      data: {
        ...lvl,
        onSelectNode: handleNodeClick,
        isHighlighted: lvl.id === highlightedNodeId,
        isPrerequisiteHighlighted: selectedLockedNodeId
          ? path.edges.some((e) => e.target === selectedLockedNodeId && e.source === lvl.id)
          : false,
      },
    }));
  }, [path.levels, handleNodeClick, highlightedNodeId, selectedLockedNodeId, path.edges]);

  // Convert domain edges to styled React Flow edges with prerequisite illumination
  const edges: Edge[] = useMemo(() => {
    return path.edges.map((edge) => {
      const isRemediation = edge.isRemediationEdge;
      const isPrereqHighlighted = prerequisiteEdgeIds.has(edge.id);

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: isRemediation || isPrereqHighlighted,
        style: {
          stroke: isPrereqHighlighted
            ? "#F59E0B"
            : isRemediation
            ? "#E2533D"
            : "#3DDC84",
          strokeWidth: isPrereqHighlighted ? 4 : isRemediation ? 3 : 2.5,
          strokeDasharray: isRemediation ? "5 5" : undefined,
          filter: isPrereqHighlighted ? "drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isPrereqHighlighted ? "#F59E0B" : isRemediation ? "#E2533D" : "#3DDC84",
        },
      };
    });
  }, [path.edges, prerequisiteEdgeIds]);

  return (
    <div className="w-full h-[540px] lg:h-[580px] max-h-[calc(100vh-200px)] min-h-[420px] rounded-3xl border border-border bg-paper relative overflow-hidden shadow-2xl">
      {/* Background Top Overlay Gradient */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-paper to-transparent pointer-events-none z-10" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Legend Pill */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-surface/90 border border-border backdrop-blur-md text-xs shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5 text-text-primary">
            <span className="w-3 h-3 rounded-full bg-signal shadow-sm" />
            <span className="text-[11px] font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-primary ml-2">
            <span className="w-3 h-3 rounded-full bg-focus animate-pulse ring-2 ring-focus/30" />
            <span className="text-[11px] font-medium">Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-primary ml-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-[11px] font-medium">Boss Checkpoint</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-primary ml-2">
            <span className="w-3 h-3 rounded-full bg-alert" />
            <span className="text-[11px] font-medium">Remediation</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary ml-2">
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="text-[11px] font-medium">Locked</span>
          </div>
        </div>

        {/* Right: In-Map Search & Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* In-Map Search Input */}
          <div className="relative">
            <div className="flex items-center bg-surface/95 border border-border rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 text-text-secondary mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Find node or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-text-secondary hover:text-text-primary cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Matches */}
            {searchMatches.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 max-h-56 overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl p-1.5 z-50 divide-y divide-border/40">
                {searchMatches.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(lvl)}
                    className="w-full px-3 py-2 text-left hover:bg-paper rounded-xl transition-colors text-xs flex flex-col gap-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary font-mono">Level {lvl.displayLevel}</span>
                      <span className="text-[10px] text-text-secondary font-mono">Week {lvl.targetWeek}</span>
                    </div>
                    <span className="text-text-secondary font-medium truncate">{lvl.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Touchpad Mode Toggle (Scroll Page vs Interactive Map) */}
          <div className="flex items-center p-1 rounded-2xl bg-surface/95 border border-border backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => setMapMode("interactive")}
              className={`p-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === "interactive"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Interactive Map Mode: Pan and zoom freely on canvas"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Map Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setMapMode("scroll")}
              className={`p-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === "scroll"
                  ? "bg-focus text-white shadow-md shadow-focus/25"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              title="Scroll Page Mode: Safely scroll past map without canvas zoom trapping"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Page Scroll</span>
            </button>
          </div>

          {/* Quick Zoom Bar */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-surface/95 border border-border backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => zoomIn({ duration: 300 })}
              className="p-1.5 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => zoomOut({ duration: 300 })}
              className="p-1.5 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fitView({ padding: 0.25, duration: 600 })}
              className="p-1.5 rounded-xl hover:bg-paper text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              title="Fit Entire Map"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Prerequisite Toast */}
      {selectedLockedNodeId && (
        <div className="absolute bottom-4 left-4 z-20 px-3.5 py-2 rounded-xl bg-surface/95 border border-border backdrop-blur-md shadow-lg text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <Navigation className="w-3.5 h-3.5 text-focus shrink-0" />
          <span className="text-text-primary text-[11px] font-medium">
            Prerequisite: Complete upstream highlighted milestone first
          </span>
          <button
            type="button"
            onClick={() => setSelectedLockedNodeId(null)}
            className="text-text-secondary hover:text-text-primary p-0.5 cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.5}
        maxZoom={1.3}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        panOnDrag={mapMode === "interactive"}
        zoomOnScroll={false}
        zoomOnPinch={true}
        preventScrolling={mapMode === "interactive"}
        className="touch-pan-y"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#14B8A622"
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

export function CandyCrushMap(props: CandyCrushMapProps) {
  return (
    <ReactFlowProvider>
      <CandyCrushMapInner {...props} />
    </ReactFlowProvider>
  );
}
