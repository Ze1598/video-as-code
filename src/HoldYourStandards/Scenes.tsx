import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { TEXT } from "./layout.ts";
import { TIMELINE, frameOfWord } from "./timeline.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b3 = TIMELINE["beat-03"];
const localFrame3 = (globalFrame: number) => globalFrame - b3.from;
const B3_ITEM_1_FRAME = localFrame3(frameOfWord("beat-03", "Error"));
const B3_ITEM_2_FRAME = localFrame3(frameOfWord("beat-03", "Navigation"));
const B3_ITEM_3_FRAME = localFrame3(frameOfWord("beat-03", "One"));
const B3_ITEM_4_FRAME = localFrame3(frameOfWord("beat-03", "Several"));

// Beat 3 — "Error messages didn't explain what went wrong. Navigation
// changed between screens. One common edge case broke the approval flow.
// Several pages looked unfinished...": the enumeration this beat actually
// is, shown as an actual list rather than narrated over the diagram (see
// the skill's "An enumeration").
export const ProblemsListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-03"].words;

  const introText = wordsToText(words.slice(0, 4));
  const items = [
    wordsToText(words.slice(4, 11)),
    wordsToText(words.slice(11, 15)),
    wordsToText(words.slice(15, 23)),
    wordsToText(words.slice(23, 33)),
  ];

  const introOpacity = interpolate(frame, [0, 20, B3_ITEM_1_FRAME - 10, B3_ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [B3_ITEM_1_FRAME - 10, B3_ITEM_1_FRAME + 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <ListRow text={items[0]} revealFrame={B3_ITEM_1_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[1]} revealFrame={B3_ITEM_2_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[2]} revealFrame={B3_ITEM_3_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[3]} revealFrame={B3_ITEM_4_FRAME} frame={frame} fontSize={34} />
      </div>
    </AbsoluteFill>
  );
};

const b9 = TIMELINE["beat-09"];
const localFrame9 = (globalFrame: number) => globalFrame - b9.from;
const B9_ITEM_1_FRAME = localFrame9(frameOfWord("beat-09", "unclear"));
const B9_ITEM_2_FRAME = localFrame9(frameOfWord("beat-09", "Broken"));
const B9_ITEM_3_FRAME = localFrame9(frameOfWord("beat-09", "Refinement"));

// Beat 9 — "unclear errors were acceptable... Broken edge cases could
// wait... Refinement ended when the deadline arrived": the lesson the
// approval itself taught, structurally echoing Beat 3's list of what
// actually broke — this time it's what the team learned was acceptable.
export const LessonListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-09"].words;

  const introText = wordsToText(words.slice(0, 14));
  const items = [
    wordsToText(words.slice(14, 23)),
    wordsToText(words.slice(23, 28)),
    wordsToText(words.slice(28, 34)),
  ];

  const introOpacity = interpolate(frame, [0, 20, B9_ITEM_1_FRAME - 10, B9_ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [B9_ITEM_1_FRAME - 10, B9_ITEM_1_FRAME + 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
        <ListRow text={items[0]} revealFrame={B9_ITEM_1_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[1]} revealFrame={B9_ITEM_2_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[2]} revealFrame={B9_ITEM_3_FRAME} frame={frame} fontSize={34} />
      </div>
    </AbsoluteFill>
  );
};

// Beat 7 — "They held his team to the standard he advertised.": the
// essay's turn, given its own flat, deadpan typographic treatment (no
// camera movement, added quotation marks) distinct from ordinary
// narration beats (see the skill's "A quote").
export const QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const text = wordsToText(BEATS["beat-07"].words);

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
