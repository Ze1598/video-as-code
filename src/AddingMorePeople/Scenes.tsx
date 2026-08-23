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
const B4_ITEM_1_FRAME = localFrame4(frameOfWord("beat-04", "in"));
const B4_ITEM_2_FRAME = localFrame4(frameOfWord("beat-04", "kept"));
const B4_ITEM_3_FRAME = localFrame4(frameOfWord("beat-04", "every", "start", 1));

// Beat 4 — the three separate ways the team was burning time (status
// meetings that produced nothing, repeated incident investigations,
// stakeholder-declared urgency), shown as an actual list rather than
// narrated over the diagram (see the skill's "An enumeration"). Trailing
// commas on items 2 and 3 are swapped for periods — cosmetic normalization
// for a mid-sentence clause becoming its own line, not a changed word.
export const WasteListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-04"].words;

  const introText = wordsToText(words.slice(0, 9));
  const items = [
    wordsToText(words.slice(9, 18)),
    wordsToText(words.slice(19, 27)).replace(/,$/, "."),
    wordsToText(words.slice(38, 54)).replace(/,$/, "."),
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
        <ListRow text={items[0]} revealFrame={B4_ITEM_1_FRAME} frame={frame} fontSize={32} maxWidth={1100} />
        <ListRow text={items[1]} revealFrame={B4_ITEM_2_FRAME} frame={frame} fontSize={32} maxWidth={1100} />
        <ListRow text={items[2]} revealFrame={B4_ITEM_3_FRAME} frame={frame} fontSize={32} maxWidth={1100} />
      </div>
    </AbsoluteFill>
  );
};
