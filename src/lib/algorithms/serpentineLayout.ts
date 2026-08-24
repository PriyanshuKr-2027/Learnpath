export interface Coordinate {
  x: number;
  y: number;
}

export interface SerpentineLayoutConfig {
  centerX?: number;
  amplitude?: number;      // horizontal wave amplitude in px
  verticalSpacing?: number;// vertical px between steps
  frequency?: number;      // sine wave frequency
  remediationOffsetX?: number;
}

/**
 * Calculates smooth Candy Crush RPG S-Curve coordinates for React Flow level nodes.
 * Creates an organic, winding pathway with predictable bounds and zero overlapping nodes.
 */
export function generateSerpentineCoordinates(
  totalNodes: number,
  config: SerpentineLayoutConfig = {}
): Coordinate[] {
  const {
    centerX = 350,
    amplitude = 180,
    verticalSpacing = 160,
    frequency = 0.85,
  } = config;

  const coordinates: Coordinate[] = [];

  for (let i = 0; i < totalNodes; i++) {
    // S-curve sinusoidal meandering
    const angle = i * frequency;
    const x = Math.round(centerX + Math.sin(angle) * amplitude);
    const y = Math.round(i * verticalSpacing + 60);

    coordinates.push({ x, y });
  }

  return coordinates;
}

/**
 * Calculates distinct offset coordinates for dynamically injected remediation sub-levels
 * (e.g. Level 5.1 for mistake 1, Level 5.2 for mistake 2, Level 5.3 for mistake 3).
 * Staggers sub-levels cleanly along a side branch so they never collide.
 */
export function calculateRemediationCoordinate(
  parentCoord: Coordinate,
  remediationIndex: number = 1
): Coordinate {
  // If parent is on the left side of canvas, branch right (+X); otherwise branch left (-X)
  const isRightBranch = parentCoord.x <= 350;
  const offsetX = isRightBranch ? 220 : -220;
  const offsetY = (remediationIndex - 1) * 130 + 50;

  return {
    x: Math.round(parentCoord.x + offsetX),
    y: Math.round(parentCoord.y + offsetY),
  };
}
