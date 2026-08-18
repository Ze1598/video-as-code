import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  DESIGN_ENGINEERING_DRAW_START,
  DESIGN_OPERATIONS_DRAW_START,
  CONNECTOR_DRAW_DURATION,
  NODES,
  NodeId,
  OPS_ENGINEERING_DRAW_START,
  OPS_ENGINEERING_DRAW_DURATION,
  LINE_ACTIVE,
  QUESTION_FADE_OUT_DURATION,
  QUESTION_FADE_OUT_START,
  QUESTION_JOURNEY,
  RESOLVED_PACKET_DURATION,
  RESOLVED_PACKET_START,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// A persistent connector that, once drawn, stays solid for the rest of the
// video — design<->operations and design<->engineering are never the
// problem, so neither ever degrades.
function PersistentConnector({ a, b, start }: { a: NodeId; b: NodeId; start: number }) {
  const frame = useCurrentFrame();
  if (frame < start) return null;

  const from = NODES[a];
  const to = NODES[b];
  // Deliberately linear (no easing) — see connectorMath's drawOnStyle.
  const t = interpolate(frame, [start, start + CONNECTOR_DRAW_DURATION], [0, 1], clamp);

  return (
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />
  );
}

// The Reveal's payoff connector: operations<->engineering, drawn once, live,
// the moment the three roles join the same call — the accent + glow
// treatment reserved for the one new piece of direct contact this whole
// video has been building toward.
function DirectConnector() {
  const frame = useCurrentFrame();
  const t = interpolate(
    frame,
    [OPS_ENGINEERING_DRAW_START, OPS_ENGINEERING_DRAW_START + OPS_ENGINEERING_DRAW_DURATION],
    [0, 1],
    clamp,
  );
  if (t <= 0) return null;

  const from = NODES.operations;
  const to = NODES.engineering;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={ACCENT}
      strokeWidth={3.5}
      {...drawOnStyle(t)}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
    />
  );
}

// The question packet's continuous journey (see layout.ts QUESTION_JOURNEY):
// engineering -> design -> operations -> design -> engineering (Beat 2's
// resolved round trip), then engineering -> design once more (Beat 3's
// question, which never continues — it arrives at Design and stays there,
// unresolved, until the Reveal makes it moot).
function QuestionPacket() {
  const frame = useCurrentFrame();

  const activeIndex = QUESTION_JOURNEY.reduce(
    (acc, hop, i) => (frame >= hop.start ? i : acc),
    -1,
  );
  if (activeIndex < 0) return null;

  const hop = QUESTION_JOURNEY[activeIndex];
  const t = interpolate(frame, [hop.start, hop.start + hop.duration], [0, 1], {
    ...clamp,
    easing: EASE,
  });
  const from = NODES[hop.from];
  const to = NODES[hop.to];
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;

  const fadeOpacity = interpolate(
    frame,
    [QUESTION_FADE_OUT_START, QUESTION_FADE_OUT_START + QUESTION_FADE_OUT_DURATION],
    [1, 0],
    clamp,
  );

  return <PacketMarker x={x} y={y} opacity={fadeOpacity} />;
}

// The resolved packet: the correction detail, finally travelling the direct
// route, in the one color reserved for "delivered/reinforced."
function ResolvedPacket() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [RESOLVED_PACKET_START, RESOLVED_PACKET_START + RESOLVED_PACKET_DURATION], [0, 1], {
    ...clamp,
    easing: EASE,
  });
  if (t <= 0) return null;

  const from = NODES.operations;
  const to = NODES.engineering;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;

  return <PacketMarker x={x} y={y} shape="circle" size={26} accent />;
}

const NODE_IDS: NodeId[] = ["design", "operations", "engineering"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const engineeringDim = frame < DESIGN_ENGINEERING_DRAW_START;

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={
        <>
          <QuestionPacket />
          <ResolvedPacket />
        </>
      }
    >
      <PersistentConnector a="design" b="operations" start={DESIGN_OPERATIONS_DRAW_START} />
      <PersistentConnector a="design" b="engineering" start={DESIGN_ENGINEERING_DRAW_START} />
      <DirectConnector />
      {NODE_IDS.map((id) => (
        <PersonNode
          key={id}
          x={NODES[id].x}
          y={NODES[id].y}
          label={NODES[id].label}
          dim={id === "engineering" ? engineeringDim : false}
        />
      ))}
    </DiagramFrame>
  );
};
