import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  COORDINATOR_DIM_START,
  COORDINATOR_HEALTH_FRAMES,
  COORDINATOR_HEALTH_VALUES,
  CONNECTOR_ANALYST_COLLEAGUE_START,
  CONNECTOR_ANALYST_IT_START,
  CONNECTOR_ANALYST_MANAGER_START,
  CONNECTOR_COORDINATOR_EMPLOYEES_START,
  CONNECTOR_DRAW_DURATION,
  CONNECTOR_EMPLOYEES_IT_START,
  DIM_TEXT,
  EMPLOYEES_IT_HEALTH_FRAMES,
  EMPLOYEES_IT_HEALTH_VALUES,
  ERROR,
  HOP_DURATION,
  LINE_ACTIVE,
  NODES,
  NodeId,
  PACKET_HOPS,
  PACKET_REJECT_FRAME,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// One fixed connector between two nodes, drawing on in the true direction
// the request/relationship first travels (see the skill's "Connectors carry
// the entire mechanism"). `health` optionally modulates opacity over time
// (the coordinator's channel going quiet, the employees/IT channel never
// quite working).
function Connector({
  from,
  to,
  startFrame,
  frame,
  color = LINE_ACTIVE,
  healthFrames,
  healthValues,
}: {
  from: NodeId;
  to: NodeId;
  startFrame: number;
  frame: number;
  color?: string;
  healthFrames?: number[];
  healthValues?: number[];
}) {
  if (frame < startFrame) return null;
  const a = NODES[from];
  const b = NODES[to];
  // Deliberately linear (no easing) — see connectorMath's drawOnStyle.
  const drawT = interpolate(frame, [startFrame, startFrame + CONNECTOR_DRAW_DURATION], [0, 1], clamp);
  const health = healthFrames && healthValues ? interpolate(frame, healthFrames, healthValues, clamp) : 1;

  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={2.5}
      opacity={health}
      {...drawOnStyle(drawT)}
    />
  );
}

// The analyst's ticket, travelling as one continuous packet along whichever
// connector is active (see layout.ts's PACKET_HOPS) — never a new
// disconnected packet per hop. Once rejected, it comes to rest at IT,
// recolored into the video's one reserved "broken" treatment.
function TicketPacket({ frame }: { frame: number }) {
  if (frame < PACKET_HOPS[0].frame - 20) return null;

  let travel = PACKET_HOPS[0];
  for (const hop of PACKET_HOPS) {
    if (hop.frame > frame) break;
    travel = hop;
  }

  const rejected = frame >= PACKET_REJECT_FRAME;
  const a = NODES[travel.from];
  const b = NODES[travel.to];
  const t = rejected ? 1 : interpolate(frame, [travel.frame, travel.frame + HOP_DURATION], [0, 1], clamp);
  const x = rejected ? NODES.it.x : a.x + (b.x - a.x) * t;
  const y = rejected ? NODES.it.y : a.y + (b.y - a.y) * t;

  return (
    <PacketMarker x={x} y={y} shape="diamond" size={30} strokeColor={rejected ? ERROR : LINE_ACTIVE} opacity={rejected ? 0.75 : 1} />
  );
}

// Small accent-colored tags keyed to a real cue, mirroring the device used
// across this format's other videos (see e.g. HowToBeUnderstood's
// EngineerTags) — a one-word state change made legible right at the node it
// happened to.
function StateTag({ id, text, startFrame, frame, color }: { id: NodeId; text: string; startFrame: number; frame: number; color: string }) {
  const opacity = interpolate(frame, [startFrame, startFrame + 16], [0, 1], { ...clamp, easing: EASE });
  if (opacity <= 0) return null;
  const { x, y } = NODES[id];
  return (
    <text x={x} y={y - 130} fill={color} fontSize={22} fontWeight={700} textAnchor="middle" fontFamily='"Helvetica Neue", Arial, sans-serif'>
      {text}
    </text>
  );
}

const NODE_IDS: NodeId[] = ["analyst", "manager", "colleague", "it", "coordinator", "employees"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const coordinatorDim = frame >= COORDINATOR_DIM_START;

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={<TicketPacket frame={frame} />}
    >
      <Connector from="analyst" to="manager" startFrame={CONNECTOR_ANALYST_MANAGER_START} frame={frame} />
      <Connector from="analyst" to="colleague" startFrame={CONNECTOR_ANALYST_COLLEAGUE_START} frame={frame} />
      <Connector from="analyst" to="it" startFrame={CONNECTOR_ANALYST_IT_START} frame={frame} />
      <Connector
        from="coordinator"
        to="employees"
        startFrame={CONNECTOR_COORDINATOR_EMPLOYEES_START}
        frame={frame}
        healthFrames={COORDINATOR_HEALTH_FRAMES}
        healthValues={COORDINATOR_HEALTH_VALUES}
      />
      <Connector
        from="employees"
        to="it"
        startFrame={CONNECTOR_EMPLOYEES_IT_START}
        frame={frame}
        color={ERROR}
        healthFrames={EMPLOYEES_IT_HEALTH_FRAMES}
        healthValues={EMPLOYEES_IT_HEALTH_VALUES}
      />

      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} dim={id === "coordinator" && coordinatorDim} />
      ))}

      <StateTag id="it" text="rejected" startFrame={PACKET_REJECT_FRAME} frame={frame} color={ERROR} />
      <StateTag id="coordinator" text="on leave" startFrame={COORDINATOR_DIM_START} frame={frame} color={DIM_TEXT} />
    </DiagramFrame>
  );
};
