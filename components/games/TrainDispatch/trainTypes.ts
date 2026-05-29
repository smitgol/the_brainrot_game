export type PlatformId = "A" | "B" | "C" | "D";
export type SwitchState = "straight" | "divert";

export interface Point {
  x: number;
  y: number;
}

export interface TrackSegment {
  id: string;
  points: Point[];
  straightNext: string | null;
  divertNext: string | null;
  platform?: PlatformId;
}

export interface Switch {
  id: string;
  x: number;
  y: number;
  state: SwitchState;
  segmentId: string;
}

export interface Platform {
  id: PlatformId;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Train {
  id: string;
  color: string;
  destination: PlatformId;
  segmentId: string;
  pointIndex: number;
  x: number;
  y: number;
  speed: number;
  spawnTime: number;
}

export interface LevelConfig {
  level: number;
  trainSpeed: number;
  spawnInterval: number;
  maxTrains: number;
  platforms: PlatformId[];
  segments: TrackSegment[];
  switches: Switch[];
  platformRects: Platform[];
}

export const TRAIN_COLORS = ["#ff2d55", "#00f5d4", "#ffd60a", "#bf5af2"];
