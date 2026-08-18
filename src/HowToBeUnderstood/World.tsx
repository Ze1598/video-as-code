import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  BELIEF_LABELS,
  CONCERN_LABELS,
  CONNECTOR_DRAW_DURATION,
  CONNECTOR_DRAW_START,
  CONNECTOR_HEALTH_FRAMES,
  CONNECTOR_HEALTH_VALUES,
  DIM_TEXT,
  ENGINEER_IDS,
  LINE_ACTIVE,
  NODES,
  NodeId,
  TRUE_PACKET_TRAVEL_DURATION,
  TRUE_PACKET_TRAVEL_START,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
  WRONG_PACKET_FADE_DURATION,
  WRONG_PACKET_FADE_START,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Beat 2's question tag, and Beat 6's belief tag once the world reappears —
// both anchored above the engineer's node so they never collide with the
// connector line running below.
function EngineerTags({ id, frame }: { id: NodeId; frame: number }) {
  const { x, y } = NODES[id];
  const concern = CONCERN_LABELS[id];
  const belief = BELIEF_LABELS[id];

  const concernOpacity = concern
    ? interpolate(frame, [concern.frame, concern.frame + 16], [0, 1], { ...clamp, easing: EASE })
    : 0;
  const beliefOpacity = belief
    ? interpolate(
        frame,
        [WRONG_PACKET_FADE_START, WRONG_PACKET_FADE_START + WRONG_PACKET_FADE_DURATION],
        [0, 1],
        { ...clamp, easing: EASE },
      )
    : 0;

  return (
    <g fontFamily='"Helvetica Neue", Arial, sans-serif' textAnchor="middle">
      {concern && (
        <text x={x} y={y - 130} fill={ACCENT} fontSize={22} fontWeight={700} opacity={concernOpacity}>
          &ldquo;{concern.text}&rdquo;
        </text>
      )}
      {belief && (
        <text x={x} y={y - 100} fill={DIM_TEXT} fontSize={18} opacity={beliefOpacity}>
          {belief}
        </text>
      )}
    </g>
  );
}

// Draws from the lead toward the engineer — the true direction the proposal
// travels — using the pathLength=1 trick so dasharray/dashoffset are
// resolution-independent. Health modulates opacity: solid through most of
// the video, sagging during Beat 4's repetition.
function Connector({ id, frame }: { id: NodeId; frame: number }) {
  const start = CONNECTOR_DRAW_START[id];
  if (start === null || frame < start) return null;

  const lead = NODES.lead;
  const engineer = NODES[id];
  // Deliberately linear, not eased — see connectorMath's drawOnStyle for why.
  const drawT = interpolate(frame, [start, start + CONNECTOR_DRAW_DURATION], [0, 1], clamp);
  const health = interpolate(frame, CONNECTOR_HEALTH_FRAMES, CONNECTOR_HEALTH_VALUES, clamp);

  return (
    <line
      x1={lead.x}
      y1={lead.y}
      x2={engineer.x}
      y2={engineer.y}
      stroke={LINE_ACTIVE}
      strokeWidth={2.5}
      opacity={health}
      {...drawOnStyle(drawT)}
    />
  );
}

// Beat 6 — the true proposal, finally travelling the connector, in the one
// color reserved for "delivered/reinforced."
function TruePacketLine({ id, frame }: { id: NodeId; frame: number }) {
  const progress = interpolate(
    frame,
    [TRUE_PACKET_TRAVEL_START, TRUE_PACKET_TRAVEL_START + TRUE_PACKET_TRAVEL_DURATION],
    [0, 1],
    clamp,
  );
  if (progress <= 0) return null;

  const lead = NODES.lead;
  const engineer = NODES[id];

  return (
    <line
      x1={lead.x}
      y1={lead.y}
      x2={engineer.x}
      y2={engineer.y}
      stroke={ACCENT}
      strokeWidth={3.5}
      {...drawOnStyle(progress)}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
    />
  );
}

// A fixed offset above each engineer — visible for the rest of the Reveal
// rather than dismissed, since the essay never claims the misunderstanding
// gets corrected in the moment, only that the gap becomes visible.
function WrongPacket({ id, frame }: { id: NodeId; frame: number }) {
  const opacity = interpolate(
    frame,
    [WRONG_PACKET_FADE_START, WRONG_PACKET_FADE_START + WRONG_PACKET_FADE_DURATION],
    [0, 1],
    { ...clamp, easing: EASE },
  );
  if (opacity <= 0) return null;

  const { x, y } = NODES[id];
  const py = y - 60;

  return <PacketMarker x={x} y={py} size={34} opacity={opacity} />;
}

const NODE_IDS: NodeId[] = ["lead", "eng1", "eng2", "eng3"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={ENGINEER_IDS.map((id) => (
        <WrongPacket key={id} id={id} frame={frame} />
      ))}
    >
      {ENGINEER_IDS.map((id) => (
        <Connector key={id} id={id} frame={frame} />
      ))}
      {ENGINEER_IDS.map((id) => (
        <TruePacketLine key={id} id={id} frame={frame} />
      ))}
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} />
      ))}
      {ENGINEER_IDS.map((id) => (
        <EngineerTags key={id} id={id} frame={frame} />
      ))}
    </DiagramFrame>
  );
};
