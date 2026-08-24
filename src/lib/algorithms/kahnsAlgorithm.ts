import { SkillGap } from "@/types";

export interface TopoNodeInput {
  id: string;
  skillName: string;
  category: string;
  estimatedMinutes: number;
  prerequisites: string[]; // skillNames or IDs that must come first
  importanceWeight?: number;
}

export interface ScheduledTopoNode extends TopoNodeInput {
  targetWeek: number;
  stepOrder: number;
  phase: string;
}

/**
 * Kahn's Topological Sorting with Weekly Workload Constraints
 * Time Complexity: O(|V| + |E|)
 * Space Complexity: O(|V|)
 *
 * Sequences topics logically ensuring prerequisites are met, and allocates
 * nodes into weekly buckets based on the learner's weekly commitment.
 */
export function scheduleNodesWithKahns(
  nodes: TopoNodeInput[],
  weeklyHoursBudget: number = 10
): ScheduledTopoNode[] {
  if (!nodes || nodes.length === 0) return [];

  const weeklyMinutesBudget = Math.max(60, weeklyHoursBudget * 60);

  // 1. Build adjacency list and in-degree map
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>(); // u -> list of dependent nodes v
  const nodeMap = new Map<string, TopoNodeInput>();

  // Map skillName -> node ID for prerequisite resolution
  const nameToId = new Map<string, string>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    nameToId.set(node.skillName.toLowerCase(), node.id);
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  // Populate edges based on prerequisites
  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      const prereqId = nameToId.get(prereq.toLowerCase()) || (nodeMap.has(prereq) ? prereq : null);
      if (prereqId && prereqId !== node.id) {
        adjList.get(prereqId)?.push(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }
  }

  // 2. Initialize Queue with in-degree == 0
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  // Sort initial queue by importance weight if available
  queue.sort((a, b) => {
    const wA = nodeMap.get(a)?.importanceWeight || 1;
    const wB = nodeMap.get(b)?.importanceWeight || 1;
    return wB - wA;
  });

  const sortedNodeIds: string[] = [];

  // 3. Process Queue
  while (queue.length > 0) {
    const u = queue.shift()!;
    sortedNodeIds.push(u);

    const neighbors = adjList.get(u) || [];
    for (const v of neighbors) {
      const currentDeg = inDegree.get(v) || 0;
      inDegree.set(v, currentDeg - 1);
      if (currentDeg - 1 === 0) {
        queue.push(v);
      }
    }
  }

  // Fallback for cycle detection: include any missed nodes
  if (sortedNodeIds.length < nodes.length) {
    for (const node of nodes) {
      if (!sortedNodeIds.includes(node.id)) {
        sortedNodeIds.push(node.id);
      }
    }
  }

  // 4. Allocate into Weekly Workload Buckets
  const scheduledNodes: ScheduledTopoNode[] = [];
  let currentWeek = 1;
  let accumulatedMinutesInWeek = 0;

  for (let i = 0; i < sortedNodeIds.length; i++) {
    const nodeId = sortedNodeIds[i];
    const node = nodeMap.get(nodeId)!;
    const nodeDuration = node.estimatedMinutes || 90;

    // Check if adding this exceeds weekly budget (allow at least 1 node per week)
    if (accumulatedMinutesInWeek + nodeDuration > weeklyMinutesBudget && accumulatedMinutesInWeek > 0) {
      currentWeek += 1;
      accumulatedMinutesInWeek = 0;
    }

    accumulatedMinutesInWeek += nodeDuration;

    // Determine Phase based on week / progress
    let phase = "Phase 1: Foundations & Fundamentals";
    if (currentWeek >= 2 && currentWeek <= 3) {
      phase = "Phase 2: Core Engineering & Modeling";
    } else if (currentWeek >= 4 && currentWeek <= 5) {
      phase = "Phase 3: Advanced Architectures & Systems";
    } else if (currentWeek >= 6) {
      phase = "Phase 4: Production & Capstone Mastery";
    }

    scheduledNodes.push({
      ...node,
      targetWeek: currentWeek,
      stepOrder: i + 1,
      phase,
    });
  }

  return scheduledNodes;
}
