import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { TEXT } from "./layout.ts";
import { TIMELINE, frameOfWord } from "./timeline.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

// Beat 5 — "So the feedback changed nothing.": the essay's own mid-video
// turn, given its own flat, deadpan typographic treatment (no camera
// movement, added quotation marks) distinct from ordinary narration beats
// (see the skill's "A quote").
export const QuoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const text = wordsToText(BEATS["beat-05"].words);

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

const b12 = TIMELINE["beat-12"];
const localFrame12 = (globalFrame: number) => globalFrame - b12.from;
const B12_ITEM_1_FRAME = localFrame12(frameOfWord("beat-12", "useful"));
const B12_ITEM_2_FRAME = localFrame12(frameOfWord("beat-12", "Knowledge"));
const B12_ITEM_3_FRAME = localFrame12(frameOfWord("beat-12", "Quality."));
const B12_ITEM_4_FRAME = localFrame12(frameOfWord("beat-12", "Shared"));
const B12_ITEM_5_FRAME = localFrame12(frameOfWord("beat-12", "Removing"));
const B12_FOOTER_FRAME = localFrame12(frameOfWord("beat-12", "Not"));

// Beat 12 — "Performance should include the work that actually makes a team
// effective: useful reviews. Knowledge transfer. Quality. Shared delivery.
// Removing blockers.": the enumeration this beat actually is, shown as an
// actual list rather than narrated over the graph (see the skill's "An
// enumeration"), closing on the essay's own "not a bloated scorecard" line
// once every item has landed.
export const ScorecardListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-12"].words;

  const introText = wordsToText(words.slice(0, 11));
  const items = [
    wordsToText(words.slice(11, 13)),
    wordsToText(words.slice(13, 15)),
    wordsToText(words.slice(15, 16)),
    wordsToText(words.slice(16, 18)),
    wordsToText(words.slice(18, 20)),
  ];
  const footerText = wordsToText(words.slice(20, 44));

  const introOpacity = interpolate(frame, [0, 20, B12_ITEM_1_FRAME - 10, B12_ITEM_1_FRAME], [0, 1, 1, 0], {
    ...clamp,
    easing: EASE,
  });
  const listOpacity = interpolate(frame, [B12_ITEM_1_FRAME - 10, B12_ITEM_1_FRAME + 10], [0, 1], clamp);
  const footerOpacity = interpolate(frame, [B12_FOOTER_FRAME, B12_FOOTER_FRAME + 25], [0, 1], clamp);
  const footerShift = interpolate(frame, [B12_FOOTER_FRAME, B12_FOOTER_FRAME + 28], [18, 0], {
    ...clamp,
    easing: EASE,
  });

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

      <div style={{ display: "flex", flexDirection: "column", gap: 26, opacity: listOpacity }}>
        <ListRow text={items[0]} revealFrame={B12_ITEM_1_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[1]} revealFrame={B12_ITEM_2_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[2]} revealFrame={B12_ITEM_3_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[3]} revealFrame={B12_ITEM_4_FRAME} frame={frame} fontSize={34} />
        <ListRow text={items[4]} revealFrame={B12_ITEM_5_FRAME} frame={frame} fontSize={34} />
      </div>

      <div
        style={{
          maxWidth: 1100,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 24,
          lineHeight: 1.6,
          color: TEXT,
          opacity: footerOpacity,
          translate: `0px ${footerShift}px`,
          padding: "0 220px",
        }}
      >
        {footerText}
      </div>
    </AbsoluteFill>
  );
};
