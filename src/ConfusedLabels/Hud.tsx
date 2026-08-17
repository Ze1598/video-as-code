import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, CAPTION_TOP, DIM_TEXT, HIGHLIGHTS } from "./layout";
import { BEATS } from "./data";
import { splitSentences } from "./sentences";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// The Hook (00), Verdict split (07), Checklist (09), closing thesis (10) and
// CTA (11) all render their own dedicated full-screen scenes (see
// Scenes.tsx / index.tsx) instead of the generic caption.
const CAPTIONED_BEATS = new Set([
  "beat-01",
  "beat-02",
  "beat-03",
  "beat-04",
  "beat-05",
  "beat-06",
  "beat-08",
]);

function currentBeatId(frame: number): string | null {
  for (const id of BEAT_ORDER) {
    const t = TIMELINE[id];
    if (frame >= t.from && frame < t.from + t.duration) return id;
  }
  return null;
}

// Screen-space caption: one real sentence at a time, timed to its own real
// word timestamps. Exactly one phrase per beat (when there is one) gets
// accent emphasis; everything else stays dim.
export const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const beatId = currentBeatId(frame);
  if (!beatId || !CAPTIONED_BEATS.has(beatId)) return null;

  const t = TIMELINE[beatId];
  const local = frame - t.from;
  const sentences = splitSentences(BEATS[beatId].words);

  const toFrame = (ms: number) => Math.round((ms * FPS) / 1000);

  let index = sentences.length - 1;
  for (let i = 0; i < sentences.length; i++) {
    if (local < toFrame(sentences[i].startMs)) {
      index = Math.max(0, i - 1);
      break;
    }
  }
  const sentence = sentences[index];
  const windowStart = toFrame(sentence.startMs);
  const windowEnd = index < sentences.length - 1 ? toFrame(sentences[index + 1].startMs) : t.duration;

  const opacity = interpolate(
    local,
    [windowStart, windowStart + 14, windowEnd - 14, windowEnd],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE },
  );

  const highlight = HIGHLIGHTS[beatId];
  const splitAt = highlight ? sentence.text.indexOf(highlight) : -1;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: CAPTION_TOP,
        display: "flex",
        justifyContent: "center",
        padding: "0 220px",
      }}
    >
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 34,
          lineHeight: 1.5,
          textAlign: "center",
          color: DIM_TEXT,
          opacity,
        }}
      >
        {splitAt >= 0 ? (
          <>
            {sentence.text.slice(0, splitAt)}
            <span style={{ color: ACCENT, fontWeight: 700 }}>{highlight}</span>
            {sentence.text.slice(splitAt + highlight!.length)}
          </>
        ) : (
          sentence.text
        )}
      </div>
    </div>
  );
};
