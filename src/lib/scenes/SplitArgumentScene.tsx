import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { Beat } from "../timeline.ts";
import { ACCENT, DIM_TEXT, FONT, LINE_INACTIVE, TEXT } from "../palette.ts";
import { wordsToText } from "../sentences.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export type SplitArgumentSceneProps = {
  beatId: string;
  beats: Record<string, Beat>;
  /** Optional floating line above the split, fading out as the columns fade in. */
  introRange?: [number, number];
  /** LOCAL frame the intro fades out / columns begin fading in. Required if introRange is set. */
  introEndFrame?: number;
  leftLabel: string;
  leftRange: [number, number];
  rightLabel: string;
  rightRange: [number, number];
  /** LOCAL frame the left column starts revealing. Defaults to 15 — the left
   * column is normally the beat's own first words (real timestamp 0), not
   * anchored to a mid-sentence cue, so this rarely needs overriding. */
  leftStartFrame?: number;
  /** LOCAL frame the right column ("the mistake") starts revealing —
   * anchor to the real word marking the pivot, e.g.
   * `frameOfWord(beatId, "mistake") - timeline[beatId].from`. */
  rightStartFrame: number;
  /** Optional supporting detail below the split, smaller/dimmer, its own real timing. */
  footnoteRange?: [number, number];
  footnoteStartFrame?: number;
};

// Preserve what was legitimate, isolate the actual mistake — the Balanced
// Counterweight beat becomes a literal two-zone split (see the skill's
// "Match technique to content"). Both column labels sit on the SAME top
// edge (`alignItems: "flex-start"`, not `"center"`) and both bodies share
// one font weight, differing only by color — found and fixed this session:
// centering the row vertically makes whichever column has the shorter body
// text float its label higher once real (unequal-length) text fills it in,
// and mismatched weight+color reads as two unrelated styles instead of one
// system with color doing the distinguishing work.
export const SplitArgumentScene: React.FC<SplitArgumentSceneProps> = ({
  beatId,
  beats,
  introRange,
  introEndFrame,
  leftLabel,
  leftRange,
  rightLabel,
  rightRange,
  leftStartFrame = 15,
  rightStartFrame,
  footnoteRange,
  footnoteStartFrame,
}) => {
  const frame = useCurrentFrame();
  const words = beats[beatId].words;

  const introText = introRange ? wordsToText(words.slice(...introRange)) : null;
  const leftText = wordsToText(words.slice(...leftRange));
  const rightText = wordsToText(words.slice(...rightRange));
  const footnoteText = footnoteRange ? wordsToText(words.slice(...footnoteRange)) : null;

  const introOpacity = introRange
    ? interpolate(
        frame,
        [0, 20, (introEndFrame ?? leftStartFrame) - 6, introEndFrame ?? leftStartFrame],
        [0, 1, 1, 0],
        { ...clamp, easing: EASE },
      )
    : 0;

  const leftOpacity = interpolate(frame, [leftStartFrame, leftStartFrame + 25], [0, 1], clamp);
  const leftShift = interpolate(frame, [leftStartFrame, leftStartFrame + 29], [26, 0], {
    ...clamp,
    easing: EASE,
  });

  const rightOpacity = interpolate(frame, [rightStartFrame, rightStartFrame + 28], [0, 1], clamp);
  const rightShift = interpolate(frame, [rightStartFrame, rightStartFrame + 32], [26, 0], {
    ...clamp,
    easing: EASE,
  });

  const dividerHeight = interpolate(frame, [rightStartFrame, rightStartFrame + 40], [0, 220], {
    ...clamp,
    easing: EASE,
  });

  const footnoteOpacity =
    footnoteRange && footnoteStartFrame !== undefined
      ? interpolate(frame, [footnoteStartFrame, footnoteStartFrame + 33], [0, 1], clamp)
      : 0;
  const footnoteShift =
    footnoteRange && footnoteStartFrame !== undefined
      ? interpolate(frame, [footnoteStartFrame, footnoteStartFrame + 36], [18, 0], {
          ...clamp,
          easing: EASE,
        })
      : 0;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: "0 150px",
      }}
    >
      {introText && (
        <div
          style={{
            position: "absolute",
            maxWidth: 1300,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 38,
            lineHeight: 1.4,
            color: TEXT,
            opacity: introOpacity,
            padding: "0 120px",
          }}
        >
          {introText}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 70 }}>
        <div style={{ flex: 1, textAlign: "right", opacity: leftOpacity, translate: `${leftShift}px 0px` }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: DIM_TEXT,
              marginBottom: 14,
            }}
          >
            {leftLabel}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, lineHeight: 1.4, color: TEXT }}>
            {leftText}
          </div>
        </div>

        <div style={{ width: 2, height: dividerHeight, backgroundColor: LINE_INACTIVE }} />

        <div style={{ flex: 1, opacity: rightOpacity, translate: `${-rightShift}px 0px` }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 14,
            }}
          >
            {rightLabel}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, lineHeight: 1.4, color: ACCENT }}>
            {rightText}
          </div>
        </div>
      </div>

      {footnoteText && (
        <div
          style={{
            maxWidth: 1100,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 24,
            lineHeight: 1.6,
            color: DIM_TEXT,
            opacity: footnoteOpacity,
            translate: `0px ${footnoteShift}px`,
          }}
        >
          {footnoteText}
        </div>
      )}
    </AbsoluteFill>
  );
};
