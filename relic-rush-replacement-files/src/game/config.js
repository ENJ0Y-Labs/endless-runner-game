// Single source of truth for gameplay tuning. Keep magic numbers out of main.js.
export const GAME_CONFIG = Object.freeze({
  title: 'Relic Rush 3D',
  laneCount: 3,
  laneX: Object.freeze([-2.46, 0, 2.46]),
  trackWidth: 7.4,

  // Speed ramps linearly with run time and is capped so late-game stays controllable.
  initialSpeed: 13,
  maximumSpeed: 25,
  speedIncreasePerSecond: 0.22,
  attractSpeed: 6, // gentle scroll behind the start screen

  relicScore: 100,
  playerZ: 2.2,

  // World streaming: rows are generated just inside the fog and recycled once behind the camera.
  spawnDistance: 120,
  despawnZ: 8,
  firstRowZ: -20,

  // Obstacle rows get closer together and double rows more likely as the run goes on.
  maxRowGap: 26,
  minRowGap: 11,
  rowGapShrinkPerSecond: 0.18,
  difficultyRampSeconds: 120,
  maxDoubleRowChance: 0.4,

  // Hit boxes (world units). Lateral checks use the runner's real x, not the target lane.
  obstacleHitX: 0.8,
  obstacleHitZ: [-0.75, 0.95], // relative to playerZ
  relicHitX: 1.0,
  relicHitZ: [-0.95, 1.0],
})
