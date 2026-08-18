import { ACCENT, DIM_TEXT, FONT, LINE_ACTIVE, LINE_INACTIVE, TEXT } from "../palette";

export type PersonNodeProps = {
  x: number;
  y: number;
  label: string;
  /** Reads as "currently out of the loop" — changes stroke/text color only. */
  dim?: boolean;
  radius?: number;
  fontSize?: number;
  fill?: string;
  strokeColor?: string;
  dimStrokeColor?: string;
  textColor?: string;
  dimTextColor?: string;
  accent?: boolean;
};

// Connector lines terminate at node centers and rely on the node's circle
// being drawn afterward, fully opaque, to visually clip the line at the
// circle's edge (see the skill's "Node occlusion"). `fill` is therefore
// ALWAYS opacity 1 here, unconditionally — `dim` only ever swaps
// `stroke`/text `fill`, so a future video can't reintroduce the occlusion
// bug by wrapping this in a group-level opacity. If a node needs to look
// dimmed, pass `dim`, don't wrap this component in `<g opacity={...}>`.
export const PersonNode: React.FC<PersonNodeProps> = ({
  x,
  y,
  label,
  dim = false,
  radius = 54,
  fontSize = 26,
  fill = "#1E1A15",
  strokeColor = LINE_ACTIVE,
  dimStrokeColor = LINE_INACTIVE,
  textColor = TEXT,
  dimTextColor = DIM_TEXT,
  accent = false,
}) => {
  const stroke = accent ? ACCENT : dim ? dimStrokeColor : strokeColor;
  const labelColor = dim ? dimTextColor : textColor;

  return (
    <g>
      <circle cx={x} cy={y} r={radius} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={x}
        y={y + radius + 38}
        fill={labelColor}
        fontSize={fontSize}
        fontFamily={FONT}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};
