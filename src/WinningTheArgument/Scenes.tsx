import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { TEXT } from "./layout.ts";
import { TIMELINE, frameOfWord } from "./timeline.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b4 = TIMELINE["beat-04"];
const localFrame4 = (globalFrame: number) => globalFrame - b4.from;
const B4_ITEM_1_FRAME = localFrame4(frameOfWord("beat-04", "who"));
const B4_ITEM_2_FRAME = localFrame4(frameOfWord("beat-04", "Who", "start", 0));
const B4_ITEM_3_FRAME = localFrame4(frameOfWord("beat-04", "Who", "start", 1));

// Beat 4 — "who received approval first. Who communicated their needs. Who
// failed to check the resource plan.": the exact moment the argument's
// topic drifted from the real trade-off to procedural blame, shown as an
// actual list rather than narrated over the diagram (see the skill's "An
// enumeration").
export const ArgumentDriftListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-04"].words;

  const introText = wordsToText(words.slice(0, 10));
  const items = [
    wordsToText(words.slice(10, 14)),
    wordsToText(words.slice(14, 18)),
    wordsToText(words.slice(18, 25)),
  ];

  const introOpacity = interpolate(frame, [0, 20, B4_ITEM_1_FRAME - 10, B4_ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [B4_ITEM_1_FRAME - 10, B4_ITEM_1_FRAME + 10], [0, 1], clamp);

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
        <ListRow text={items[0]} revealFrame={B4_ITEM_1_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[1]} revealFrame={B4_ITEM_2_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[2]} revealFrame={B4_ITEM_3_FRAME} frame={frame} fontSize={34} />
      </div>
    </AbsoluteFill>
  );
};

// Beat 8 — the manager's interrupting question, given its own flat,
// deadpan typographic treatment (no camera movement, added quotation
// marks) distinct from ordinary narration beats (see the skill's "A
// quote"). Only the actual quoted words render here (from "what" on) —
// the beat's opening clause ("The manager needed to interrupt the debate
// with a different question:") is attribution, not part of the quote
// itself, and stays out of the quote-mark typography.
const QUOTE_START = BEATS["beat-08"].words.findIndex((w) => w.text === "what");

export const QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const quoteWords = BEATS["beat-08"].words.slice(QUOTE_START);
  // Cosmetic capitalization of the first word — the source sentence has it
  // lowercase mid-clause; this display stands alone as its own sentence.
  const text = wordsToText(quoteWords).replace(/^./, (c) => c.toUpperCase());

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
