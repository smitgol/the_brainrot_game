"use client";

import { Stage, Layer, Line, Rect, Text, Circle, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { TrainEngineSnapshot } from "./useTrainEngine";
import { CANVAS_HEIGHT } from "./levels";

interface TrainCanvasProps extends TrainEngineSnapshot {
  width: number;
  onToggleSwitch: (id: string) => void;
  shake?: boolean;
}

export function TrainCanvas({
  width,
  trains,
  switches,
  platforms,
  segments,
  onToggleSwitch,
  shake = false,
}: TrainCanvasProps) {
  const scale = width / 400;
  const height = CANVAS_HEIGHT * scale;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[12px] border border-border bg-surface ${shake ? "crash-shake" : ""}`}
      style={{ touchAction: "manipulation" }}
    >
      <Stage width={width} height={height} scaleX={scale} scaleY={scale}>
        <Layer>
          {segments.map((seg) => (
            <Line
              key={seg.id}
              points={seg.points.flatMap((p) => [p.x, p.y])}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={6}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {platforms.map((p) => (
            <Group key={p.id}>
              <Rect
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                fill={p.color}
                opacity={0.35}
                cornerRadius={4}
              />
              <Text
                x={p.x}
                y={p.y + p.height / 2 - 8}
                width={p.width}
                text={p.id}
                align="center"
                fontSize={18}
                fontStyle="bold"
                fill="#fff"
              />
            </Group>
          ))}

          {switches.map((sw) => (
            <SwitchNode
              key={sw.id}
              x={sw.x}
              y={sw.y}
              active={sw.state === "divert"}
              onToggle={() => onToggleSwitch(sw.id)}
            />
          ))}

          {trains.map((train) => (
            <Group key={train.id} x={train.x - 14} y={train.y - 10}>
              <Rect
                width={28}
                height={20}
                fill={train.color}
                cornerRadius={3}
              />
              <Text
                x={0}
                y={2}
                width={28}
                text={train.destination}
                align="center"
                fontSize={12}
                fontStyle="bold"
                fill="#0a0a0f"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

function SwitchNode({
  x,
  y,
  active,
  onToggle,
}: {
  x: number;
  y: number;
  active: boolean;
  onToggle: () => void;
}) {
  // Fire once on mouse (mousedown) and once on touch (touchstart).
  // Binding both avoids the desktop "nothing happens" bug and the
  // mobile double-toggle bug caused by onTap + onTouchStart firing together.
  const handle = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    e.evt?.preventDefault?.();
    onToggle();
  };

  // Gentle pulse so switches are easy to notice (re-rendered every frame).
  const phase = (Date.now() % 1400) / 1400;
  const wave = Math.sin(phase * Math.PI * 2);
  const pulseRadius = 22 + wave * 3;
  const pulseOpacity = 0.4 + (wave + 1) * 0.12;

  // straight = up-left, divert = up-right (matches level routing convention).
  const indicator = active
    ? [x, y, x + 13, y - 13]
    : [x, y, x - 13, y - 13];
  const tipX = active ? x + 13 : x - 13;

  return (
    <Group>
      <Circle
        x={x}
        y={y}
        radius={pulseRadius}
        stroke="#ffd60a"
        strokeWidth={1}
        opacity={pulseOpacity}
        listening={false}
      />
      <Circle
        x={x}
        y={y}
        radius={15}
        fill="#1a1a26"
        stroke="#ffd60a"
        strokeWidth={2}
        listening={false}
      />
      <Line
        points={indicator}
        stroke="#ffd60a"
        strokeWidth={3}
        lineCap="round"
        listening={false}
      />
      <Circle x={tipX} y={y - 13} radius={3} fill="#ffd60a" listening={false} />
      {/* Large transparent hit target on top (>=44px) */}
      <Circle
        x={x}
        y={y}
        radius={28}
        fill="transparent"
        onMouseDown={handle}
        onTouchStart={handle}
      />
    </Group>
  );
}
