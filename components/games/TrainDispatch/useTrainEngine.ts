"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { calculateTrainDeliveryScore, distance, lerp } from "@/lib/gameLogic";
import { getLevelConfig } from "./levels";
import type {
  LevelConfig,
  PlatformId,
  Switch,
  Train,
  TrackSegment,
} from "./trainTypes";
import { TRAIN_COLORS } from "./trainTypes";

export interface TrainEngineState {
  score: number;
  lives: number;
  level: number;
  streak: number;
  gameOver: boolean;
  crashed: boolean;
  delivered: boolean;
  deliveryPoints: number;
  leveledUp: boolean;
}

export interface TrainEngineSnapshot {
  trains: Train[];
  switches: Switch[];
  platforms: LevelConfig["platformRects"];
  segments: TrackSegment[];
}

export interface UseTrainEngineReturn extends TrainEngineState, TrainEngineSnapshot {
  started: boolean;
  start: () => void;
  toggleSwitch: (id: string) => void;
  resetCrashFlag: () => void;
  resetDeliveryFlag: () => void;
  resetLevelUpFlag: () => void;
}

let trainIdCounter = 0;

function cloneSwitches(switches: Switch[]): Switch[] {
  return switches.map((s) => ({ ...s }));
}

function getSegmentMap(segments: TrackSegment[]) {
  return new Map(segments.map((s) => [s.id, s]));
}

function spawnTrain(
  config: LevelConfig,
  platforms: PlatformId[]
): Train {
  const destination =
    platforms[Math.floor(Math.random() * platforms.length)];
  const color = TRAIN_COLORS[trainIdCounter % TRAIN_COLORS.length];
  const segment = config.segments[0];
  const start = segment.points[0];

  trainIdCounter += 1;

  return {
    id: `train-${trainIdCounter}`,
    color,
    destination,
    segmentId: segment.id,
    pointIndex: 0,
    x: start.x,
    y: start.y,
    speed: config.trainSpeed,
    spawnTime: performance.now(),
  };
}

export function useTrainEngine(): UseTrainEngineReturn {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [deliveryPoints, setDeliveryPoints] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [started, setStarted] = useState(false);
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  const configRef = useRef(getLevelConfig(1));
  const trainsRef = useRef<Train[]>([]);
  const switchesRef = useRef<Switch[]>(cloneSwitches(configRef.current.switches));
  const segmentMapRef = useRef(getSegmentMap(configRef.current.segments));
  const lastSpawnRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const streakRef = useRef(0);
  const levelRef = useRef(1);
  const livesRef = useRef(3);
  const gameOverRef = useRef(false);
  const startedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const now = performance.now();
    // Give the player a ~1.2s grace before the first train appears.
    lastSpawnRef.current = now - configRef.current.spawnInterval + 1200;
    startedRef.current = true;
    setStarted(true);
  }, []);

  const applyLevel = useCallback((newLevel: number) => {
    levelRef.current = newLevel;
    configRef.current = getLevelConfig(newLevel);
    segmentMapRef.current = getSegmentMap(configRef.current.segments);
    switchesRef.current = cloneSwitches(configRef.current.switches);
    trainsRef.current = [];
    setLevel(newLevel);
  }, []);

  const handleCrash = useCallback(() => {
    if (gameOverRef.current) return;

    setCrashed(true);
    livesRef.current -= 1;
    setLives(livesRef.current);
    streakRef.current = 0;
    setStreak(0);
    pausedUntilRef.current = performance.now() + 800;
    trainsRef.current = [];

    if (livesRef.current <= 0) {
      gameOverRef.current = true;
      setGameOver(true);
    }
  }, []);

  const advanceTrain = useCallback(
    (train: Train, delta: number) => {
      const segment = segmentMapRef.current.get(train.segmentId);
      if (!segment) return;

      const nextIndex = train.pointIndex + 1;
      if (nextIndex >= segment.points.length) {
        if (segment.platform) {
          if (segment.platform === train.destination) {
            const elapsed = (performance.now() - train.spawnTime) / 1000;
            const bonus = Math.max(0, 10 - elapsed);
            const points = calculateTrainDeliveryScore(bonus);
            setScore((s) => s + points);
            setDeliveryPoints(points);
            setDelivered(true);
            streakRef.current += 1;
            setStreak(streakRef.current);

            if (streakRef.current >= 3) {
              const nextLevel = Math.min(4, levelRef.current + 1);
              if (nextLevel !== levelRef.current) {
                applyLevel(nextLevel);
                setLeveledUp(true);
              }
              streakRef.current = 0;
              setStreak(0);
            }
          } else {
            handleCrash();
          }
          trainsRef.current = trainsRef.current.filter((t) => t.id !== train.id);
          return;
        }

        const sw = switchesRef.current.find((s) => s.segmentId === segment.id);
        const nextId =
          sw?.state === "divert" ? segment.divertNext : segment.straightNext;

        if (!nextId) {
          handleCrash();
          trainsRef.current = trainsRef.current.filter((t) => t.id !== train.id);
          return;
        }

        train.segmentId = nextId;
        train.pointIndex = 0;
        const nextSeg = segmentMapRef.current.get(nextId);
        if (nextSeg) {
          train.x = nextSeg.points[0].x;
          train.y = nextSeg.points[0].y;
        }
        return;
      }

      // Move from the train's CURRENT position toward the next waypoint.
      const to = segment.points[nextIndex];
      const remaining = distance(train.x, train.y, to.x, to.y);
      const move = train.speed * delta * 60;

      if (remaining <= move || remaining < 2) {
        train.x = to.x;
        train.y = to.y;
        train.pointIndex = nextIndex;
        return;
      }

      const t = move / remaining;
      train.x = lerp(train.x, to.x, t);
      train.y = lerp(train.y, to.y, t);
    },
    [applyLevel, handleCrash]
  );

  const checkCollisions = useCallback(() => {
    const trains = trainsRef.current;
    for (let i = 0; i < trains.length; i++) {
      for (let j = i + 1; j < trains.length; j++) {
        const a = trains[i];
        const b = trains[j];
        if (a.segmentId === b.segmentId && distance(a.x, a.y, b.x, b.y) < 20) {
          handleCrash();
          return;
        }
      }
    }
  }, [handleCrash]);

  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      // Clamp delta so a backgrounded tab / long frame can't teleport trains.
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (startedRef.current && !gameOverRef.current && now >= pausedUntilRef.current) {
        const config = configRef.current;

        if (
          now - lastSpawnRef.current > config.spawnInterval &&
          trainsRef.current.length < config.maxTrains
        ) {
          trainsRef.current = [
            ...trainsRef.current,
            spawnTrain(config, config.platforms),
          ];
          lastSpawnRef.current = now;
        }

        for (const train of trainsRef.current) {
          advanceTrain(train, delta);
        }

        checkCollisions();
      }

      forceRender();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [advanceTrain, checkCollisions]);

  const toggleSwitch = useCallback((id: string) => {
    switchesRef.current = switchesRef.current.map((s) =>
      s.id === id
        ? { ...s, state: s.state === "straight" ? "divert" : "straight" }
        : s
    );
    forceRender();
  }, []);

  return {
    trains: trainsRef.current,
    switches: switchesRef.current,
    platforms: configRef.current.platformRects,
    segments: configRef.current.segments,
    score,
    lives,
    level,
    streak,
    gameOver,
    crashed,
    delivered,
    deliveryPoints,
    leveledUp,
    started,
    start,
    toggleSwitch,
    resetCrashFlag: () => setCrashed(false),
    resetDeliveryFlag: () => setDelivered(false),
    resetLevelUpFlag: () => setLeveledUp(false),
  };
}
