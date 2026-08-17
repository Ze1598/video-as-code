import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera";
import {
  ACCENT,
  DECISION_LABELS,
  DIAGRAM_SCALE,
  DIM_TEXT,
  DIVERGE_FRAMES,
  DIVERGE_VALUES,
  LINE_ACTIVE,
  NAME_LABELS,
  NODES,
  NodeId,
  OBJECT_DIVERGED,
  CENTER,
  TEXT,
  WORLD_DIM_START,
  WORLD_FADE_IN_START,
} from "./layout";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const NODE_IDS: NodeId[] = ["architect", "pm", "delivery", "engineering"];
const OUTWARD_LEFT: NodeId[] = ["architect", "delivery"];

// Deliberately linear, not eased: this drives how far apart the four object
// copies are, and the earlier "ease out" curve (used everywhere else for
// entrances) front-loads almost all of its motion into the first third of
// its range — which made the fork look complete within a few hundred
// milliseconds instead of gradually building through Beat 4 and resolving
// across Beat 5.
function divergenceT(frame: number): number {
  return interpolate(frame, DIVERGE_FRAMES, DIVERGE_VALUES, clamp);
}

function objectPosition(id: NodeId, t: number) {
  const target = OBJECT_DIVERGED[id];
  return { x: CENTER.x + (target.x - CENTER.x) * t, y: CENTER.y + (target.y - CENTER.y) * t };
}

function PersonNode({ id }: { id: NodeId }) {
  const { x, y, label } = NODES[id];
  return (
    <g>
      <circle cx={x} cy={y} r={54} fill="#1E1A15" stroke={LINE_ACTIVE} strokeWidth={2} />
      <text
        x={x}
        y={y + 92}
        fill={TEXT}
        fontSize={26}
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function PersonTags({ id, frame }: { id: NodeId; frame: number }) {
  const { x, y } = NODES[id];
  const outward = OUTWARD_LEFT.includes(id);
  const anchor = outward ? "end" : "start";
  const tx = outward ? x - 72 : x + 72;

  const name = NAME_LABELS[id];
  const decision = DECISION_LABELS[id];
  const nameOpacity = interpolate(frame, [name.frame, name.frame + 16], [0, 1], { ...clamp, easing: EASE });
  const decisionOpacity = interpolate(frame, [decision.frame, decision.frame + 16], [0, 1], {
    ...clamp,
    easing: EASE,
  });

  return (
    <g fontFamily='"Helvetica Neue", Arial, sans-serif' textAnchor={anchor}>
      <text x={tx} y={y - 10} fill={ACCENT} fontSize={24} fontWeight={700} opacity={nameOpacity}>
        &ldquo;{name.text}&rdquo;
      </text>
      <text x={tx} y={y + 22} fill={DIM_TEXT} fontSize={18} opacity={decisionOpacity}>
        {decision.text}
      </text>
    </g>
  );
}

function Connector({ id, t }: { id: NodeId; t: number }) {
  const a = NODES[id];
  const b = objectPosition(id, t);
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LINE_ACTIVE} strokeWidth={2.5} opacity={0.7} />;
}

function ObjectCopy({ id, t }: { id: NodeId; t: number }) {
  const { x, y } = objectPosition(id, t);
  const size = 46;
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      transform={`rotate(45, ${x}, ${y})`}
      fill="#1E1A15"
      stroke={ACCENT}
      strokeWidth={2.5}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
    />
  );
}

// Invisible through the Hook (nothing to show yet), fades in as Beat 1
// starts, full foreground through the one-case story, then recedes once
// Beat 7's dedicated scene takes over.
const WORLD_OPACITY_FRAMES = [
  0,
  WORLD_FADE_IN_START,
  WORLD_FADE_IN_START + 20,
  WORLD_DIM_START,
  WORLD_DIM_START + 40,
];
const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0.04];

export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const t = divergenceT(frame);
  const worldOpacity = interpolate(frame, WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES, {
    ...clamp,
    easing: EASE,
  });

  return (
    // Safe zone: uniformly scaled and anchored to the top edge, so the
    // diagram's lowest possible pixel is fixed regardless of what the camera
    // is doing — it structurally cannot render into the caption's territory
    // (see layout.ts's DIAGRAM_SCALE / CAPTION_TOP and Hud.tsx).
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${DIAGRAM_SCALE})`,
        transformOrigin: "50% 0%",
      }}
    >
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ opacity: worldOpacity }}>
        <g transform={cameraTransform(frame)}>
          {NODE_IDS.map((id) => (
            <Connector key={id} id={id} t={t} />
          ))}
          {NODE_IDS.map((id) => (
            <ObjectCopy key={id} id={id} t={t} />
          ))}
          {NODE_IDS.map((id) => (
            <PersonNode key={id} id={id} />
          ))}
          {NODE_IDS.map((id) => (
            <PersonTags key={id} id={id} frame={frame} />
          ))}
        </g>
      </svg>
    </div>
  );
};
