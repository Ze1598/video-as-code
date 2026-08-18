import { interpolate, useCurrentFrame } from "remotion";
import { cameraTransformFactory } from "../Camera";
import { DiagramFrame } from "../diagram/DiagramFrame";
import { PersonNode } from "../diagram/PersonNode";
import { drawOnStyle } from "../diagram/connectorMath";
import { LINE_ACTIVE } from "../palette";
import { TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline";

const ALPHA = { x: 700, y: 540 };
const BETA = { x: 1220, y: 540 };
const WIDE = { x: 960, y: 540, zoom: 0.9 };

const cameraTransform = cameraTransformFactory(
  [0, TOTAL_DURATION],
  [WIDE.x, WIDE.x],
  [WIDE.y, WIDE.y],
  [WIDE.zoom, WIDE.zoom],
);

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const drawStart = frameOfWord("diagram", "Beta");
const drawDuration = 40;

const WORLD_OPACITY_FRAMES = [
  TIMELINE.diagram.from - 10,
  TIMELINE.diagram.from + 10,
  TIMELINE.diagram.from + TIMELINE.diagram.duration - 10,
  TIMELINE.diagram.from + TIMELINE.diagram.duration + 10,
];
const WORLD_OPACITY_VALUES = [0, 1, 1, 0];

// Exercises DiagramFrame (safe zone), PersonNode (occlusion-safe node), and
// the connectorMath draw-on primitive together — the smoke test for
// everything src/lib/diagram exports.
export const DemoWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const worldOpacity = interpolate(frame, WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES, clamp);

  const t = interpolate(frame, [drawStart, drawStart + drawDuration], [0, 1], clamp);

  return (
    <DiagramFrame frame={frame} worldOpacity={worldOpacity} cameraTransform={cameraTransform}>
      {frame >= drawStart && (
        <line x1={ALPHA.x} y1={ALPHA.y} x2={BETA.x} y2={BETA.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />
      )}
      <PersonNode x={ALPHA.x} y={ALPHA.y} label="Alpha" />
      <PersonNode x={BETA.x} y={BETA.y} label="Beta" dim />
    </DiagramFrame>
  );
};
