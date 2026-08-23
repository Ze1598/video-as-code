import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { frameOfWord, TIMELINE } from "./timeline.ts";
import { TEXT } from "./layout.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b10 = TIMELINE["beat-10"];
const LIST_ITEM_FRAMES = [
  frameOfWord("beat-10", "Select") - b10.from,
  frameOfWord("beat-10", "Name") - b10.from,
  frameOfWord("beat-10", "Add") - b10.from,
  frameOfWord("beat-10", "Attach") - b10.from,
  frameOfWord("beat-10", "Submit") - b10.from,
];
const LIST_START = LIST_ITEM_FRAMES[0];

// Beat 10 — the checklist the essay itself proposes: the enumeration this
// beat actually is, shown as a list rather than narrated over the diagram
// (see the skill's "An enumeration"). This intro+list wrapper stays
// per-video — only the row itself is shared (src/lib/scenes/ListRow.tsx).
export const ListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-10"].words;

  const introText = wordsToText(words.slice(0, 11));
  const items = [
    wordsToText(words.slice(11, 18)),
    wordsToText(words.slice(18, 24)),
    wordsToText(words.slice(24, 29)),
    wordsToText(words.slice(29, 35)),
    wordsToText(words.slice(35, 41)),
  ];

  const introOpacity = interpolate(
    frame,
    [0, 20, LIST_START - 20, LIST_START],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE },
  );
  const listOpacity = interpolate(frame, [LIST_START - 20, LIST_START], [0, 1], { ...clamp, easing: EASE });

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

      <div style={{ display: "flex", flexDirection: "column", gap: 26, opacity: listOpacity }}>
        {items.map((item, i) => (
          <ListRow key={item} text={item} revealFrame={LIST_ITEM_FRAMES[i]} frame={frame} fontSize={32} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
