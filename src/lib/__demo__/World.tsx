import { interpolate, useCurrentFrame } from "remotion";
import { cameraTransformFactory } from "../Camera.ts";
import { DiagramFrame } from "../diagram/DiagramFrame.tsx";
import { PersonNode } from "../diagram/PersonNode.tsx";
import { PacketMarker } from "../diagram/PacketMarker.tsx";
import { drawOnStyle } from "../diagram/connectorMath.ts";
import { opacityFactory } from "../keyframes.ts";
import { LINE_ACTIVE } from "../palette.ts";
import { TIMELINE, TOTAL_DURATION, frameOfWord } from "./timeline.ts";

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
// A packet that idles exactly at Beta's center once the connector arrives —
// the exact scenario that made a hand-rolled packet invisible in a real
// video (see the skill's "Node occlusion"): this only stays visible
// because it's rendered via DiagramFrame's `overlay` prop below, not
// alongside the nodes in `children`. If a future change moved it back into
// `children`, this composition would render it invisibly, which is exactly
// what this smoke test exists to catch.
const packetArrive = drawStart + drawDuration;

const worldOpacity = opacityFactory(
  [
    TIMELINE.diagram.from - 10,
    TIMELINE.diagram.from + 10,
    TIMELINE.diagram.from + TIMELINE.diagram.duration - 10,
    TIMELINE.diagram.from + TIMELINE.diagram.duration + 10,
  ],
  [0, 1, 1, 0],
);

// Exercises DiagramFrame (safe zone + overlay z-order), PersonNode
// (occlusion-safe node), PacketMarker, and the connectorMath draw-on
// primitive together — the smoke test for everything src/lib/diagram
// exports.
export const DemoWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [drawStart, drawStart + drawDuration], [0, 1], clamp);

  return (
    <DiagramFrame
      frame={frame}
      worldOpacity={worldOpacity(frame)}
      cameraTransform={cameraTransform}
      overlay={frame >= packetArrive && <PacketMarker x={BETA.x} y={BETA.y} />}
    >
      {frame >= drawStart && (
        <line x1={ALPHA.x} y1={ALPHA.y} x2={BETA.x} y2={BETA.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />
      )}
      <PersonNode x={ALPHA.x} y={ALPHA.y} label="Alpha" />
      <PersonNode x={BETA.x} y={BETA.y} label="Beta" dim />
    </DiagramFrame>
  );
};
