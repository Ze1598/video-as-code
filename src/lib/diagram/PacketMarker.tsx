import { ACCENT, LINE_ACTIVE } from "../palette.ts";

export type PacketMarkerProps = {
  x: number;
  y: number;
  /** "diamond" for an in-transit/unresolved item (the courier/stuck-question
   * shape used across every video so far); "circle" for a delivered/
   * resolved one. */
  shape?: "diamond" | "circle";
  size?: number;
  fill?: string;
  strokeColor?: string;
  strokeWidth?: number;
  /** The "delivered/reinforced" treatment reserved for the one thing a
   * given video is actually about — fill/stroke in ACCENT plus a glow,
   * matching the reveal-moment connector treatment. */
  accent?: boolean;
  opacity?: number;
};

// The diamond/circle marker every video so far hand-rolled independently
// (HowToBeUnderstood's WrongPacket, AvoidCommunicationSilos's question/
// resolved packets, HoldYourStandards's pushback packet) — extracted once
// three copies existed, the same threshold that produced src/lib in the
// first place. Always render this via DiagramFrame's `overlay` prop, never
// inline in `children` — see the skill's "Node occlusion".
export const PacketMarker: React.FC<PacketMarkerProps> = ({
  x,
  y,
  shape = "diamond",
  size = 30,
  fill = "#1E1A15",
  strokeColor = LINE_ACTIVE,
  strokeWidth = 2,
  accent = false,
  opacity = 1,
}) => {
  const resolvedFill = accent ? ACCENT : fill;
  const resolvedStroke = accent ? ACCENT : strokeColor;
  const style = accent ? { filter: `drop-shadow(0 0 6px ${ACCENT})` } : undefined;

  if (shape === "circle") {
    return (
      <circle
        cx={x}
        cy={y}
        r={size / 2}
        fill={resolvedFill}
        stroke={accent ? undefined : resolvedStroke}
        strokeWidth={accent ? undefined : strokeWidth}
        opacity={opacity}
        style={style}
      />
    );
  }

  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      transform={`rotate(45, ${x}, ${y})`}
      fill={resolvedFill}
      stroke={resolvedStroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      style={style}
    />
  );
};
