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
 * Calculates the offset coordinate for an injected remediation level (e.g. Level 5.1).
 * Places it alongside the checkpoint node so it appears as a distinct remedial side-quest.
 */
export function calculateRemediationCoordinate(
  parentCoord: Coordinate,
  remediationIndex: number = 1
): Coordinate {
  const isRightSide = parentCoord.x < 350;
  const offsetX = isRightSide ? 200 : -200;
  const offsetY = 70 * remediationIndex;

  return {
    x: parentCoord.x + offsetX,
    y: parentCoord.y + offsetY,
  };
}
