import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  CALLBACK_PULSE_CENTER,
  CALLBACK_PULSE_HALF_WIDTH,
  CONNECTOR_DRAW_DURATION,
  LINE_ACTIVE,
  NODES,
  NodeId,
  PUSHBACK_JOURNEY,
  TEAMLEAD_OTHERMANAGERS_DRAW_START,
  TEAMLEAD_TEAM_DRAW_START,
  TEAM_OPERATIONS_DRAW_START,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// A persistent connector that, once drawn, stays solid neutral for the
// rest of the video.
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

// The Reveal's callback: the ORIGINAL Team Lead <-> Other Managers
// connector (already fully drawn since Beat 1) pulses in accent, exactly
// as the narration names the double standard — not a new connector, since
// Other Managers and Operations never actually speak. Reserved accent
// treatment for the one thing this video is actually about.
function CallbackPulse() {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [
      CALLBACK_PULSE_CENTER - CALLBACK_PULSE_HALF_WIDTH,
      CALLBACK_PULSE_CENTER,
      CALLBACK_PULSE_CENTER + CALLBACK_PULSE_HALF_WIDTH * 2.5,
    ],
    [0, 1, 0],
    { ...clamp, easing: EASE },
  );
  if (opacity <= 0) return null;

  const from = NODES.teamLead;
  const to = NODES.otherManagers;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={ACCENT}
      strokeWidth={3.5}
      opacity={opacity}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
    />
  );
}

// The pushback packet: a single hop, Operations -> Team (see layout.ts
// PUSHBACK_JOURNEY) — spawns when the operations manager sends the
// collected issues back, then sits at Team, unresolved, for the rest of
// the video.
function PushbackPacket() {
  const frame = useCurrentFrame();
  const hop = PUSHBACK_JOURNEY[0];
  if (frame < hop.start) return null;

  const t = interpolate(frame, [hop.start, hop.start + hop.duration], [0, 1], { ...clamp, easing: EASE });
  const from = NODES[hop.from];
  const to = NODES[hop.to];
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;

  return <PacketMarker x={x} y={y} />;
}

const NODE_IDS: NodeId[] = ["teamLead", "otherManagers", "team", "operations"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  const dim: Record<NodeId, boolean> = {
    teamLead: false,
    otherManagers: frame < TEAMLEAD_OTHERMANAGERS_DRAW_START,
    team: frame < TEAMLEAD_TEAM_DRAW_START,
    operations: frame < TEAM_OPERATIONS_DRAW_START,
  };

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={<PushbackPacket />}
    >
      <PersistentConnector a="teamLead" b="otherManagers" start={TEAMLEAD_OTHERMANAGERS_DRAW_START} />
      <PersistentConnector a="teamLead" b="team" start={TEAMLEAD_TEAM_DRAW_START} />
      <PersistentConnector a="team" b="operations" start={TEAM_OPERATIONS_DRAW_START} />
      <CallbackPulse />
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} dim={dim[id]} />
      ))}
    </DiagramFrame>
  );
};
