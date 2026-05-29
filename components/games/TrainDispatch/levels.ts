import type { LevelConfig, Platform, TrackSegment, Switch } from "./trainTypes";

const W = 400;
const H = 360;

function buildLevel(
  level: number,
  trainSpeed: number,
  spawnInterval: number,
  maxTrains: number,
  segments: TrackSegment[],
  switches: Switch[],
  platformRects: Platform[]
): LevelConfig {
  return {
    level,
    trainSpeed,
    spawnInterval,
    maxTrains,
    platforms: platformRects.map((p) => p.id),
    segments,
    switches,
    platformRects,
  };
}

// Routing convention across ALL levels:
//   straightNext = the LEFT option  (switch indicator points up-left)
//   divertNext   = the RIGHT option (switch indicator points up-right)
// Trains spawn at the bottom-center and flow UP through a binary switch tree,
// so every platform is reachable by setting switches correctly.

const PLATFORM_Y = 36;
const PLATFORM_SIZE = 52;

function platform(id: Platform["id"], centerX: number, color: string): Platform {
  return {
    id,
    x: centerX - PLATFORM_SIZE / 2,
    y: PLATFORM_Y,
    width: PLATFORM_SIZE,
    height: PLATFORM_SIZE,
    color,
  };
}

const COLOR = {
  A: "#ff2d55",
  B: "#00f5d4",
  C: "#ffd60a",
  D: "#bf5af2",
} as const;

const SPAWN = { x: 200, y: 330 };
const PLATFORM_ENTRY_Y = PLATFORM_Y + PLATFORM_SIZE - 6; // just inside the bay

// ---------- LEVEL 1: 2 platforms, 1 switch ----------
const segmentsL1: TrackSegment[] = [
  {
    id: "trunk",
    points: [SPAWN, { x: 200, y: 180 }],
    straightNext: "toA",
    divertNext: "toB",
  },
  {
    id: "toA",
    points: [{ x: 200, y: 180 }, { x: 120, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "A",
  },
  {
    id: "toB",
    points: [{ x: 200, y: 180 }, { x: 280, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "B",
  },
];
const switchesL1: Switch[] = [
  { id: "s0", x: 200, y: 180, state: "straight", segmentId: "trunk" },
];
const platformsL1: Platform[] = [
  platform("A", 120, COLOR.A),
  platform("B", 280, COLOR.B),
];

// ---------- LEVEL 2: 3 platforms, 2 switches ----------
// S0 on trunk picks left (A/B) vs right (C). S1 on left branch picks A vs B.
const segmentsL2: TrackSegment[] = [
  {
    id: "trunk",
    points: [SPAWN, { x: 200, y: 240 }],
    straightNext: "branchL",
    divertNext: "branchR",
  },
  {
    id: "branchL",
    points: [{ x: 200, y: 240 }, { x: 110, y: 150 }],
    straightNext: "toA",
    divertNext: "toB",
  },
  {
    id: "branchR",
    points: [{ x: 200, y: 240 }, { x: 290, y: 150 }],
    straightNext: "toC",
    divertNext: "toC",
  },
  {
    id: "toA",
    points: [{ x: 110, y: 150 }, { x: 75, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "A",
  },
  {
    id: "toB",
    points: [{ x: 110, y: 150 }, { x: 165, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "B",
  },
  {
    id: "toC",
    points: [{ x: 290, y: 150 }, { x: 290, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "C",
  },
];
const switchesL2: Switch[] = [
  { id: "s0", x: 200, y: 240, state: "straight", segmentId: "trunk" },
  { id: "s1", x: 110, y: 150, state: "straight", segmentId: "branchL" },
];
const platformsL2: Platform[] = [
  platform("A", 75, COLOR.A),
  platform("B", 165, COLOR.B),
  platform("C", 290, COLOR.C),
];

// ---------- LEVEL 3/4: 4 platforms, 3 switches (full balanced tree) ----------
const segmentsTree: TrackSegment[] = [
  {
    id: "trunk",
    points: [SPAWN, { x: 200, y: 240 }],
    straightNext: "branchL",
    divertNext: "branchR",
  },
  {
    id: "branchL",
    points: [{ x: 200, y: 240 }, { x: 110, y: 150 }],
    straightNext: "toA",
    divertNext: "toB",
  },
  {
    id: "branchR",
    points: [{ x: 200, y: 240 }, { x: 290, y: 150 }],
    straightNext: "toC",
    divertNext: "toD",
  },
  {
    id: "toA",
    points: [{ x: 110, y: 150 }, { x: 75, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "A",
  },
  {
    id: "toB",
    points: [{ x: 110, y: 150 }, { x: 165, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "B",
  },
  {
    id: "toC",
    points: [{ x: 290, y: 150 }, { x: 235, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "C",
  },
  {
    id: "toD",
    points: [{ x: 290, y: 150 }, { x: 325, y: PLATFORM_ENTRY_Y }],
    straightNext: null,
    divertNext: null,
    platform: "D",
  },
];
const switchesTree: Switch[] = [
  { id: "s0", x: 200, y: 240, state: "straight", segmentId: "trunk" },
  { id: "s1", x: 110, y: 150, state: "straight", segmentId: "branchL" },
  { id: "s2", x: 290, y: 150, state: "straight", segmentId: "branchR" },
];
const platformsTree: Platform[] = [
  platform("A", 75, COLOR.A),
  platform("B", 165, COLOR.B),
  platform("C", 235, COLOR.C),
  platform("D", 325, COLOR.D),
];

export function getLevelConfig(level: number): LevelConfig {
  const capped = Math.min(level, 4);
  switch (capped) {
    case 1:
      return buildLevel(1, 0.9, 5200, 2, segmentsL1, switchesL1, platformsL1);
    case 2:
      return buildLevel(2, 1.0, 5000, 2, segmentsL2, switchesL2, platformsL2);
    case 3:
      return buildLevel(3, 1.15, 4800, 2, segmentsTree, switchesTree, platformsTree);
    default:
      return buildLevel(4, 1.35, 4200, 3, segmentsTree, switchesTree, platformsTree);
  }
}

export const CANVAS_HEIGHT = H;
export const CANVAS_WIDTH = W;
