import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BEATS } from "./data.ts";
import { FPS, frameOfWord, TIMELINE } from "./timeline.ts";
import { ACCENT, HIGHLIGHTS, TEXT } from "./layout.ts";
import { wordsToText } from "../lib/sentences.ts";
import { ListRow } from "../lib/scenes/ListRow.tsx";
import { HighlightedText, sentenceCycle } from "../lib/scenes/useSentenceCycle.tsx";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const FONT = '"Helvetica Neue", Arial, sans-serif';

const b9 = TIMELINE["beat-09"];
const LIST_ITEM_FRAMES = [
  frameOfWord("beat-09", "Who") - b9.from,
  frameOfWord("beat-09", "What", "start", 0) - b9.from,
  frameOfWord("beat-09", "What", "start", 1) - b9.from,
];
const OUTRO_START = frameOfWord("beat-09", "The", "start", 0) - b9.from;

// Beat 9 — the essay's own operational close: an enumeration (the three
// questions) followed by its own thesis paragraph. The enumeration becomes
// an actual list (see the skill's "An enumeration"); the paragraph that
// follows is pure reflective narration, so it reuses the same
// sentence-at-a-time treatment as LongFormScene rather than a second
// custom layout — gated to start only once the list has fully handed off,
// otherwise its own sentence-cycling would render "Who is this for?" a
// second time underneath the list.
export const ThreeQuestionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const words = BEATS["beat-09"].words;

  const introText = wordsToText(words.slice(0, 6));
  const items = [wordsToText(words.slice(6, 10)), wordsToText(words.slice(10, 15)), wordsToText(words.slice(15, 20))];

  const introOpacity = interpolate(
    frame,
    [0, 20, LIST_ITEM_FRAMES[0] - 20, LIST_ITEM_FRAMES[0]],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE },
  );
  const listOpacity = interpolate(
    frame,
    [LIST_ITEM_FRAMES[0] - 20, LIST_ITEM_FRAMES[0], OUTRO_START - 20, OUTRO_START],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE },
  );

  const cycle = sentenceCycle(words, frame, b9.duration, FPS, HIGHLIGHTS["beat-09"]);
  const outroOpacity = frame < OUTRO_START ? 0 : cycle.opacity;

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
          <ListRow key={item} text={item} revealFrame={LIST_ITEM_FRAMES[i]} frame={frame} fontSize={36} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          maxWidth: 1300,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 44,
          lineHeight: 1.5,
          color: TEXT,
          opacity: outroOpacity,
          padding: "0 220px",
        }}
      >
        <HighlightedText result={cycle} highlight={HIGHLIGHTS["beat-09"]} accentColor={ACCENT} />
      </div>
    </AbsoluteFill>
  );
};
