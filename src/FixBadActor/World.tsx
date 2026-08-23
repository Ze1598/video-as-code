import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  COLLEAGUES_BREAK_CUE,
  COLLEAGUES_DRAW_START,
  CONNECTOR_DRAW_DURATION,
  LEADERSHIP_DRAW_START,
  LINE_ACTIVE,
  LINE_INACTIVE,
  MANAGER_DRAW_START,
  NODES,
  NodeId,
  REVEAL_ACCENT_CUE,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// The feedback path: present throughout, stays plain neutral even as it
// repeats — the video's visual argument is that this connector never gets
// reinforced, no matter how many times it's used.
function ManagerConnector() {
  const frame = useCurrentFrame();
  if (frame < MANAGER_DRAW_START) return null;

  const from = NODES.developer;
  const to = NODES.manager;
  const t = interpolate(frame, [MANAGER_DRAW_START, MANAGER_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);

  return (
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />
  );
}

// The collaboration path: genuinely present from Beat 1, then visibly
// breaks at Beat 6 ("other developers stopped approaching him") — fades
// from a solid active line to a dim, dashed one exactly on that cue.
function ColleaguesConnector() {
  const frame = useCurrentFrame();
  if (frame < COLLEAGUES_DRAW_START) return null;

  const from = NODES.developer;
  const to = NODES.colleagues;
  const t = interpolate(
    frame,
    [COLLEAGUES_DRAW_START, COLLEAGUES_DRAW_START + CONNECTOR_DRAW_DURATION],
    [0, 1],
    clamp,
  );
  const brokenOpacity = interpolate(frame, [COLLEAGUES_BREAK_CUE, COLLEAGUES_BREAK_CUE + 30], [0, 1], {
    ...clamp,
    easing: EASE,
  });
  const activeOpacity = 1 - brokenOpacity;

  return (
    <>
      {activeOpacity > 0 && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={LINE_ACTIVE}
          strokeWidth={2.5}
          opacity={activeOpacity}
          {...drawOnStyle(t)}
        />
      )}
      {brokenOpacity > 0 && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={LINE_INACTIVE}
          strokeWidth={2}
          strokeDasharray="10 10"
          opacity={brokenOpacity}
        />
      )}
    </>
  );
}

// The reward path: draws plain at Beat 3, then gains a permanent accent +
// glow overlay exactly as the Mechanism Reveal names it ("...your
// environment keeps rewarding."). Not a transient pulse — Developer and
// Leadership have a real, ongoing channel (his numbers, reported upward),
// so this is that same connector being reinforced, permanently, the moment
// the essay says so. Reserved accent treatment for the one thing this video
// is actually about.
function LeadershipConnector() {
  const frame = useCurrentFrame();
  if (frame < LEADERSHIP_DRAW_START) return null;

  const from = NODES.developer;
  const to = NODES.leadership;
  const t = interpolate(
    frame,
    [LEADERSHIP_DRAW_START, LEADERSHIP_DRAW_START + CONNECTOR_DRAW_DURATION],
    [0, 1],
    clamp,
  );
  const accentOpacity = interpolate(frame, [REVEAL_ACCENT_CUE - 24, REVEAL_ACCENT_CUE], [0, 1], {
    ...clamp,
    easing: EASE,
  });

  return (
    <>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />
      {accentOpacity > 0 && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={ACCENT}
          strokeWidth={3.5}
          opacity={accentOpacity}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
        />
      )}
    </>
  );
}

const NODE_IDS: NodeId[] = ["developer", "manager", "leadership", "colleagues"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  const dim: Record<NodeId, boolean> = {
    developer: false,
    manager: frame < MANAGER_DRAW_START,
    leadership: frame < LEADERSHIP_DRAW_START,
    colleagues: frame < COLLEAGUES_DRAW_START,
  };

  return (
    <DiagramFrame frame={frame} worldOpacity={worldOpacity(frame)} cameraTransform={cameraTransform}>
      <ManagerConnector />
      <ColleaguesConnector />
      <LeadershipConnector />
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} dim={dim[id]} />
      ))}
    </DiagramFrame>
  );
};
