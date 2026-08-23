import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { TEXT } from "./layout.ts";
import { TIMELINE, frameOfWord } from "./timeline.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b10 = TIMELINE["beat-10"];
const localFrame10 = (globalFrame: number) => globalFrame - b10.from;
const ITEM_1_FRAME = localFrame10(frameOfWord("beat-10", "If"));
const ITEM_2_FRAME = localFrame10(frameOfWord("beat-10", "If", "start", 1));

// Beat 10 — "finish this sentence: the one thing I need you to know is" —
// the operational close, given the essay's own two-item test as an actual
// list rather than narrated over the diagram (see the skill's "An
// enumeration").
export const ListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-10"].words;

  const introText = wordsToText(words.slice(0, 23));
  const items = [wordsToText(words.slice(23, 43)), wordsToText(words.slice(43, 60))];

  const introOpacity = interpolate(frame, [0, 20, ITEM_1_FRAME - 10, ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [ITEM_1_FRAME - 10, ITEM_1_FRAME + 10], [0, 1], clamp);

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

      <div style={{ display: "flex", flexDirection: "column", gap: 30, opacity: listOpacity }}>
        <ListRow text={items[0]} revealFrame={ITEM_1_FRAME} frame={frame} fontSize={32} maxWidth={1100} />
        <ListRow text={items[1]} revealFrame={ITEM_2_FRAME} frame={frame} fontSize={32} maxWidth={1100} />
      </div>
    </AbsoluteFill>
  );
};

// Beat 7 — "Key change needed for this week: stop feature development
// today and work on the release defects.": the fix, given its own flat,
// deadpan typographic treatment (no camera movement, added quotation
// marks) distinct from ordinary narration beats (see the skill's "A
// quote").
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
