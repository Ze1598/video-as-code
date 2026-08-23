import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { PacketMarker } from "../lib/diagram/PacketMarker.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  CONNECTOR_DRAW_DURATION,
  CONNECTOR_DRAW_START,
  CONNECTOR_PULSE_FRAMES,
  CONNECTOR_PULSE_VALUES,
  DIM_TEXT,
  LINE_ACTIVE,
  NODES,
  NodeId,
  SPOKE_IDS,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
  WRONG_LABEL_FADE_DURATION,
  WRONG_LABEL_FADE_START,
  WRONG_LABELS,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Beat 4's unresolved read on the gap, sitting above each spoke node for
// the rest of the video — the essay never claims any of these get corrected
// in the moment, only that the gap becomes visible at the Reveal.
function WrongLabel({ id, frame }: { id: NodeId; frame: number }) {
  const { x, y } = NODES[id];
  const label = WRONG_LABELS[id];
  if (!label) return null;

  const opacity = interpolate(
    frame,
    [WRONG_LABEL_FADE_START, WRONG_LABEL_FADE_START + WRONG_LABEL_FADE_DURATION],
    [0, 1],
    { ...clamp, easing: EASE },
  );

  return (
    <text
      x={x}
      y={y - 96}
      fill={DIM_TEXT}
      fontSize={20}
      fontFamily='"Helvetica Neue", Arial, sans-serif'
      textAnchor="middle"
      opacity={opacity}
    >
      {label}
    </text>
  );
}

// Beat 4's unresolved-item marker — the diamond shape (PacketMarker's own
// "in-transit/unresolved" semantic) idling above each spoke node rather
// than travelling, since nothing here ever gets delivered correctly.
function WrongMarker({ id, frame }: { id: NodeId; frame: number }) {
  const label = WRONG_LABELS[id];
  if (!label) return null;

  const { x, y } = NODES[id];
  const opacity = interpolate(
    frame,
    [WRONG_LABEL_FADE_START, WRONG_LABEL_FADE_START + WRONG_LABEL_FADE_DURATION],
    [0, 1],
    { ...clamp, easing: EASE },
  );

  return <PacketMarker x={x} y={y - 60} size={28} opacity={opacity} />;
}

// Draws from the manager toward each spoke — the true direction the
// meeting's information travels — using the pathLength=1 trick so
// dasharray/dashoffset are resolution-independent. `pulse` briefly flashes
// ACCENT + glow on top of the normal resting line at the three moments
// something is actually sent down the channel (see layout.ts).
function Connector({ id, frame }: { id: NodeId; frame: number }) {
  if (frame < CONNECTOR_DRAW_START) return null;

  const manager = NODES.manager;
  const node = NODES[id];
  const drawT = interpolate(frame, [CONNECTOR_DRAW_START, CONNECTOR_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);
  const pulse = interpolate(frame, CONNECTOR_PULSE_FRAMES, CONNECTOR_PULSE_VALUES, clamp);

  return (
    <>
      <line
        x1={manager.x}
        y1={manager.y}
        x2={node.x}
        y2={node.y}
        stroke={LINE_ACTIVE}
        strokeWidth={2.5}
        {...drawOnStyle(drawT)}
      />
      {pulse > 0 && (
        <line
          x1={manager.x}
          y1={manager.y}
          x2={node.x}
          y2={node.y}
          stroke={ACCENT}
          strokeWidth={3.5}
          opacity={pulse}
          {...drawOnStyle(drawT)}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
        />
      )}
    </>
  );
}

const NODE_IDS: NodeId[] = ["manager", "leadA", "leadB", "engineers"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={SPOKE_IDS.map((id) => (
        <WrongMarker key={id} id={id} frame={frame} />
      ))}
    >
      {SPOKE_IDS.map((id) => (
        <Connector key={id} id={id} frame={frame} />
      ))}
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} />
      ))}
      {SPOKE_IDS.map((id) => (
        <WrongLabel key={id} id={id} frame={frame} />
      ))}
    </DiagramFrame>
  );
};
