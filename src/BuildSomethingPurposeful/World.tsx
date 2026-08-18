import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  CONNECTOR_DRAW_DURATION,
  HOP1_START,
  HOP2_START,
  HOP3_START,
  HOP4_START,
  HOP_DURATION,
  INSTRUCTION_DRAW_START,
  LINE_ACTIVE,
  NODES,
  NODE_IDS,
  NodeId,
  QUESTION_PACKET_SPAWN,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// A single connector, drawing in the true direction information travels
// (from -> to). Every real contact in this story happens exactly once and
// is never retracted, so once drawn it just stays solid.
function Connector({ from, to, drawStart }: { from: NodeId; to: NodeId; drawStart: number }) {
  const frame = useCurrentFrame();
  if (frame < drawStart) return null;

  const a = NODES[from];
  const b = NODES[to];
  // Linear, not eased — see connectorMath's drawOnStyle for why.
  const t = interpolate(frame, [drawStart, drawStart + CONNECTOR_DRAW_DURATION], [0, 1], clamp);

  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />;
}

const HOPS: Array<{ from: NodeId; to: NodeId; start: number }> = [
  { from: "team", to: "operations", start: HOP1_START },
  { from: "operations", to: "dept", start: HOP2_START },
  { from: "dept", to: "prod", start: HOP3_START },
  { from: "prod", to: "arch", start: HOP4_START },
];

// The one thing this diagram is actually tracking: "why does this need to
// exist / who owns it" — spawned at the team the moment the one real
// question in the essay gets asked (Beat 3), idle until the ownership hunt
// (Beat 6) drags it hop to hop across four more roles. It never resolves —
// this marker never gets the accent "delivered" treatment, because nobody
// in the story actually answers it. One continuous journey, not separate
// disconnected animations (see the skill's "info packet" guidance).
function QuestionPacket() {
  const frame = useCurrentFrame();
  if (frame < QUESTION_PACKET_SPAWN) return null;

  const spawnOpacity = interpolate(frame, [QUESTION_PACKET_SPAWN, QUESTION_PACKET_SPAWN + 20], [0, 1], {
    ...clamp,
    easing: EASE,
  });

  let x = NODES.team.x;
  let y = NODES.team.y - 90;

  for (const hop of HOPS) {
    if (frame < hop.start) break;
    const a = NODES[hop.from];
    const b = NODES[hop.to];
    const t = interpolate(frame, [hop.start, hop.start + HOP_DURATION], [0, 1], { ...clamp, easing: EASE });
    x = a.x + (b.x - a.x) * t;
    y = a.y - 90 + (b.y - a.y) * t;
  }

  return <PacketMarker x={x} y={y} size={30} opacity={spawnOpacity} />;
}

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <DiagramFrame frame={frame} worldOpacity={worldOpacity(frame)} cameraTransform={cameraTransform} overlay={<QuestionPacket />}>
      <Connector from="mgmt" to="team" drawStart={INSTRUCTION_DRAW_START} />
      {HOPS.map((hop) => (
        <Connector key={hop.to} from={hop.from} to={hop.to} drawStart={hop.start} />
      ))}
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} />
      ))}
    </DiagramFrame>
  );
};
