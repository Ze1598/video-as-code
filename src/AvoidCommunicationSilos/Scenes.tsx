import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { ACCENT, TEXT } from "./layout.ts";
import { TIMELINE, frameOfWord } from "./timeline.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b4 = TIMELINE["beat-04"];
const localFrame = (globalFrame: number) => globalFrame - b4.from;
const ITEM_1_FRAME = localFrame(frameOfWord("beat-04", "requirement"));
const ITEM_2_FRAME = localFrame(frameOfWord("beat-04", "Technical"));
const ITEM_3_FRAME = localFrame(frameOfWord("beat-04", "Follow-ups."));
const ITEM_4_FRAME = localFrame(frameOfWord("beat-04", "Alignment"));
const OUTRO_FRAME = localFrame(frameOfWord("beat-04", "Every"));

// Beat 4 — "the project had requirement sessions, technical playbacks,
// follow-ups, and alignment calls": the enumeration this beat actually is,
// shown as an actual list rather than narrated over the diagram (see the
// skill's "An enumeration"). The closing punch ("Nobody had started
// building it") settles in below once the list has landed.
export const ListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-04"].words;

  const introText = wordsToText(words.slice(0, 4));
  const items = [
    wordsToText(words.slice(4, 6)),
    wordsToText(words.slice(6, 8)),
    wordsToText(words.slice(8, 9)),
    wordsToText(words.slice(9, 11)),
  ];
  const outroText = wordsToText(words.slice(11, 24));

  const introOpacity = interpolate(frame, [0, 20, ITEM_1_FRAME - 10, ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [ITEM_1_FRAME - 10, ITEM_1_FRAME + 10], [0, 1], clamp);
  const outroOpacity = interpolate(frame, [OUTRO_FRAME, OUTRO_FRAME + 25], [0, 1], { ...clamp, easing: EASE });
  const outroShift = interpolate(frame, [OUTRO_FRAME, OUTRO_FRAME + 28], [18, 0], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}
    >
      <div
        style={{
          position: "absolute",
          maxWidth: 1200,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 38,
          lineHeight: 1.4,
          color: TEXT,
          opacity: introOpacity,
          padding: "0 150px",
        }}
      >
        {introText}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28, opacity: listOpacity }}>
        <ListRow text={items[0]} revealFrame={ITEM_1_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[1]} revealFrame={ITEM_2_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[2]} revealFrame={ITEM_3_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[3]} revealFrame={ITEM_4_FRAME} frame={frame} fontSize={34} />
      </div>

      <div
        style={{
          maxWidth: 900,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 26,
          lineHeight: 1.5,
          color: ACCENT,
          fontWeight: 700,
          opacity: outroOpacity,
          translate: `0px ${outroShift}px`,
        }}
      >
        {outroText}
      </div>
    </AbsoluteFill>
  );
};

// Beat 6 — "The meetings became the machinery that kept the communication
// silos thriving": the essay's single strongest, most quotable line, given
// its own flat, deadpan typographic treatment (no camera movement, added
// quotation marks) distinct from ordinary narration beats (see the skill's
// "A quote").
export const QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const text = wordsToText(BEATS["beat-06"].words);

  const opacity = interpolate(frame, [15, 50], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 260px" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.45,
          color: TEXT,
          opacity,
        }}
      >
        &ldquo;{text}&rdquo;
      </div>
    </AbsoluteFill>
  );
};
