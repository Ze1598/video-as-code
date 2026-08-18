import { Easing, interpolate } from "remotion";
import { ACCENT, FONT, TEXT } from "../palette";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export type ListRowProps = {
  text: string;
  /** LOCAL frame this row starts revealing — anchor to the item's own real
   * first-word start: `frameOfWord(beatId, firstWordOfItem) -
   * timeline[beatId].from`. */
  revealFrame: number;
  frame: number;
  fontSize?: number;
  maxWidth?: number;
};

// One row of an enumeration scene: a growing tick + the item's real text,
// revealed on its own real timing (see the skill's "An enumeration"). The
// surrounding intro/list wrapper stays per-video — some enumeration beats
// layer an extra header + follow-on paragraph that others don't, so that
// wrapper isn't uniform enough to force into a shared component; this row is.
export const ListRow: React.FC<ListRowProps> = ({ text, revealFrame, frame, fontSize = 36, maxWidth = 900 }) => {
  const opacity = interpolate(frame, [revealFrame, revealFrame + 18], [0, 1], { ...clamp, easing: EASE });
  const tickWidth = interpolate(frame, [revealFrame, revealFrame + 18], [0, 40], { ...clamp, easing: EASE });
  const shift = interpolate(frame, [revealFrame, revealFrame + 22], [18, 0], { ...clamp, easing: EASE });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity, translate: `${shift}px 0px` }}>
      <div style={{ width: tickWidth, height: 3, backgroundColor: ACCENT }} />
      <div style={{ fontFamily: FONT, fontSize, color: TEXT, maxWidth }}>{text}</div>
    </div>
  );
};
