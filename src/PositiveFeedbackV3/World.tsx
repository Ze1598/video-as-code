import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera";
import {
  ACCENT,
  DIAGRAM_SCALE,
  DIM_TEXT,
  LINE_ACTIVE,
  NODES,
  NodeId,
  PACKET_SEG1,
  PACKET_SEG2,
  PACKET_SEG3,
  REVEAL_DRAW_END,
  REVEAL_DRAW_START,
  TEXT,
  TICKET_LABELS,
  TICKET_STREAM_END,
  TICKET_STREAM_START,
  WORLD_DIM_START,
  WORLD_FADE_IN_START,
} from "./layout";
import { TIMELINE } from "./timeline";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

function dist(a: NodeId, b: NodeId) {
  const p = NODES[a];
  const q = NODES[b];
  return Math.hypot(q.x - p.x, q.y - p.y);
}

// The circle fill is always fully opaque (never dimmed via group opacity) so
// it always cleanly occludes any connector line ending inside it.
function PersonNode({ id, dim }: { id: NodeId; dim: boolean }) {
  const { x, y, label } = NODES[id];
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={54}
        fill="#1E1A15"
        stroke={dim ? "#3A342C" : LINE_ACTIVE}
        strokeWidth={2}
      />
      <text
        x={x}
        y={y + 92}
        fill={dim ? DIM_TEXT : TEXT}
        fontSize={26}
        fontFamily='"Helvetica Neue", Arial, sans-serif'
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

function EngineerManagerConnector({ frame }: { frame: number }) {
  const opacity = interpolate(frame, [0, 30], [0, 1], clamp);
  const a = NODES.engineer;
  const b = NODES.manager;
  return (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LINE_ACTIVE} strokeWidth={2.5} opacity={opacity * 0.7} />
  );
}

function ManagerLeadershipConnector({ frame }: { frame: number }) {
  const activateFrame = TIMELINE["beat-02"].from;
  const opacity = interpolate(frame, [activateFrame - 20, activateFrame + 10], [0, 1], clamp);
  const pulse = interpolate(
    frame,
    [activateFrame, activateFrame + 20, TIMELINE["beat-02"].from + TIMELINE["beat-02"].duration],
    [1, 1.8, 1],
    clamp,
  );
  const a = NODES.manager;
  const b = NODES.leadership;
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={LINE_ACTIVE}
      strokeWidth={2.5 * pulse}
      opacity={opacity * 0.85}
    />
  );
}

// Engineer and Leadership are never in any kind of contact — not even a
// broken one — until the review. No connector exists in any form before the
// reveal; it draws in for the first time, live, exactly when the manager
// finally tells her. Draws FROM Leadership TOWARD Engineer because that's
// the real direction the information is finally traveling.
function EngineerLeadershipConnector({ frame }: { frame: number }) {
  const a = NODES.leadership;
  const b = NODES.engineer;
  const length = dist("engineer", "leadership");

  if (frame < REVEAL_DRAW_START) {
    return null;
  }

  if (frame < REVEAL_DRAW_END) {
    const drawn = interpolate(frame, [REVEAL_DRAW_START, REVEAL_DRAW_END], [0, length], {
      ...clamp,
      easing: EASE,
    });
    return (
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={ACCENT}
        strokeWidth={3.5}
        strokeDasharray={length}
        strokeDashoffset={length - drawn}
        style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
      />
    );
  }

  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={ACCENT}
      strokeWidth={3.5}
      style={{ filter: `drop-shadow(0 0 8px ${ACCENT})` }}
    />
  );
}

function packetPosition(frame: number): { x: number; y: number; visible: boolean } {
  const [seg1From, seg1To, seg1Start, seg1End] = PACKET_SEG1;
  const [seg2From, seg2To, seg2Start, seg2End] = PACKET_SEG2;
  const [seg3From, seg3To, seg3Start, seg3End] = PACKET_SEG3;

  if (frame < seg1Start) return { x: 0, y: 0, visible: false };

  const lerp = (from: NodeId, to: NodeId, t: number) => {
    const a = NODES[from];
    const b = NODES[to];
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };

  if (frame <= seg1End) {
    const t = interpolate(frame, [seg1Start, seg1End], [0, 1], { ...clamp, easing: EASE });
    return { ...lerp(seg1From, seg1To, t), visible: true };
  }
  if (frame < seg2Start) {
    return { ...NODES.manager, visible: true };
  }
  if (frame <= seg2End) {
    const t = interpolate(frame, [seg2Start, seg2End], [0, 1], { ...clamp, easing: EASE });
    return { ...lerp(seg2From, seg2To, t), visible: true };
  }
  if (frame < seg3Start) {
    return { ...NODES.leadership, visible: true };
  }
  if (frame <= seg3End) {
    const t = interpolate(frame, [seg3Start, seg3End], [0, 1], { ...clamp, easing: EASE });
    return { ...lerp(seg3From, seg3To, t), visible: true };
  }
  return { ...NODES.engineer, visible: true };
}

function InfoPacket({ frame }: { frame: number }) {
  const { x, y, visible } = packetPosition(frame);
  if (!visible) return null;
  const pulse = 1 + Math.sin(frame * 0.08) * 0.12;
  return (
    <circle cx={x} cy={y} r={11 * pulse} fill={ACCENT} style={{ filter: `drop-shadow(0 0 10px ${ACCENT})` }} />
  );
}

function TicketStream({ frame }: { frame: number }) {
  if (frame < TICKET_STREAM_START || frame > TICKET_STREAM_END) return null;
  const a = NODES.manager;
  const b = NODES.engineer;
  const cycle = 70;
  const tickets = [0, 1, 2, 3, 4];
  return (
    <>
      {tickets.map((i) => {
        const localFrame = frame - TICKET_STREAM_START;
        const t = ((localFrame + i * (cycle / tickets.length)) % cycle) / cycle;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const fade = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0], clamp);
        return (
          <g key={i} opacity={fade}>
            <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={LINE_ACTIVE} opacity={0.8} />
            <text
              x={x}
              y={y - 16}
              fill={LINE_ACTIVE}
              fontSize={16}
              fontFamily='"Helvetica Neue", Arial, sans-serif'
              textAnchor="middle"
            >
              {TICKET_LABELS[i % TICKET_LABELS.length].replace(/,$/, "")}
            </text>
          </g>
        );
      })}
    </>
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
  const engineerDim = frame >= TIMELINE["beat-03"].from && frame < REVEAL_DRAW_START;
  const worldOpacity = interpolate(frame, WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES, {
    ...clamp,
    easing: EASE,
  });

  return (
    // Safe zone: uniformly scaled and anchored to the top edge, so the
    // diagram's lowest possible pixel is fixed regardless of what the camera
    // is doing — it structurally cannot render into the caption's territory.
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
          <EngineerManagerConnector frame={frame} />
          <ManagerLeadershipConnector frame={frame} />
          <EngineerLeadershipConnector frame={frame} />
          <TicketStream frame={frame} />
          <InfoPacket frame={frame} />
          <PersonNode id="leadership" dim={false} />
          <PersonNode id="manager" dim={false} />
          <PersonNode id="engineer" dim={engineerDim} />
        </g>
      </svg>
    </div>
  );
};
