import { interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  CONNECTOR_DRAW_DURATION,
  CONTESTED_SLOT,
  FIRSTLEAD_LOST_AT,
  LINE_ACTIVE,
  LINE_INACTIVE,
  MANAGER_FIRSTLEAD_DRAW_START,
  MANAGER_SECONDLEAD_DRAW_START,
  NODES,
  NodeId,
  PACKET1_SPAWN,
  PACKET1_TRAVEL_DURATION,
  PACKET1_TRAVEL_START,
  PACKET2_SPAWN,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Manager <-> First Lead: draws on with her claim (Beat 1), then dims from
// FIRSTLEAD_LOST_AT — the relationship persists, it just stopped being the
// claim that won (see the skill's "Node occlusion": dim only ever changes
// stroke color, never fill opacity).
function ManagerFirstLeadConnector() {
  const frame = useCurrentFrame();
  if (frame < MANAGER_FIRSTLEAD_DRAW_START) return null;

  const from = NODES.manager;
  const to = NODES.firstLead;
  const t = interpolate(frame, [MANAGER_FIRSTLEAD_DRAW_START, MANAGER_FIRSTLEAD_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);
  const dimmed = frame >= FIRSTLEAD_LOST_AT;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={dimmed ? LINE_INACTIVE : LINE_ACTIVE}
      strokeWidth={2.5}
      {...drawOnStyle(t)}
    />
  );
}

// Manager <-> Second Lead: draws on with his claim (Beat 2), then switches
// to the accent+glow treatment from PACKET1_TRAVEL_START — the one thing
// this stretch of the video is actually about (the decision that got
// made), reserved accordingly.
function ManagerSecondLeadConnector() {
  const frame = useCurrentFrame();
  if (frame < MANAGER_SECONDLEAD_DRAW_START) return null;

  const from = NODES.manager;
  const to = NODES.secondLead;
  const t = interpolate(frame, [MANAGER_SECONDLEAD_DRAW_START, MANAGER_SECONDLEAD_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);
  const won = frame >= PACKET1_TRAVEL_START;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={won ? ACCENT : LINE_ACTIVE}
      strokeWidth={won ? 3.5 : 2.5}
      style={won ? { filter: `drop-shadow(0 0 6px ${ACCENT})` } : undefined}
      {...drawOnStyle(t)}
    />
  );
}

// The first contested resource (the engineer): spawns unresolved at Beat 3
// (both claims exist, neither is granted yet), sits in the contested slot
// above Manager, then travels to Second Lead exactly as "won the engineer"
// lands in Beat 5 — becoming the delivered/accent circle marker.
function EngineerPacket() {
  const frame = useCurrentFrame();
  if (frame < PACKET1_SPAWN) return null;

  if (frame < PACKET1_TRAVEL_START) {
    return <PacketMarker x={CONTESTED_SLOT.x} y={CONTESTED_SLOT.y} shape="diamond" />;
  }

  const t = interpolate(frame, [PACKET1_TRAVEL_START, PACKET1_TRAVEL_START + PACKET1_TRAVEL_DURATION], [0, 1], clamp);
  const to = NODES.secondLead;
  const x = CONTESTED_SLOT.x + (to.x - CONTESTED_SLOT.x) * t;
  const y = CONTESTED_SLOT.y + (to.y - CONTESTED_SLOT.y) * t;

  return <PacketMarker x={x} y={y} shape={t >= 1 ? "circle" : "diamond"} accent={t >= 1} />;
}

// The second contested resource (a different specialist, Beat 6): the SAME
// shape recurring — a fresh diamond in the same contested slot, left
// deliberately unresolved, since this beat's point is the pattern
// repeating, not who wins this round.
function SpecialistPacket() {
  const frame = useCurrentFrame();
  if (frame < PACKET2_SPAWN) return null;

  return <PacketMarker x={CONTESTED_SLOT.x} y={CONTESTED_SLOT.y} shape="diamond" />;
}

const NODE_IDS: NodeId[] = ["manager", "firstLead", "secondLead"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  const dim: Record<NodeId, boolean> = {
    manager: false,
    firstLead: frame < MANAGER_FIRSTLEAD_DRAW_START || frame >= FIRSTLEAD_LOST_AT,
    secondLead: frame < MANAGER_SECONDLEAD_DRAW_START,
  };

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={
        <>
          <EngineerPacket />
          <SpecialistPacket />
        </>
      }
    >
      <ManagerFirstLeadConnector />
      <ManagerSecondLeadConnector />
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} dim={dim[id]} />
      ))}
    </DiagramFrame>
  );
};
