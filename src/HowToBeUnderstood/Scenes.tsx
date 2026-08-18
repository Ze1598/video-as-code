import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { wordsToText } from "../lib/sentences.ts";
import { TEXT } from "./layout.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const LIST_ITEM_FRAMES = [541, 851, 1149];

// Beat 5 — "Misunderstandings": the three different, wrong versions of the
// proposal each engineer independently landed on, revealed one at a time on
// their own real timing — the enumeration this beat actually is, shown as
// a list rather than narrated over the diagram. This intro+list wrapper
// stays per-video (see src/lib/scenes/ListRow.tsx) — only the row itself is
// shared.
export const ListScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-05"].words;

  const introText = wordsToText(words.slice(0, 21));
  const items = [
    wordsToText(words.slice(21, 30)),
    wordsToText(words.slice(30, 37)),
    wordsToText(words.slice(37, 51)),
  ];

  const introOpacity = interpolate(frame, [0, 20, 525, 545], [0, 1, 1, 0], { ...clamp, easing: EASE });
  const listOpacity = interpolate(frame, [525, 545], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

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
        {items.map((item, i) => (
          <ListRow key={item} text={item} revealFrame={LIST_ITEM_FRAMES[i]} frame={frame} fontSize={34} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
