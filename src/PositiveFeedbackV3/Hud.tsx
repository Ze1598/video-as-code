import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  ACCENT,
  CAPTION_TOP,
  DIM_TEXT,
  HIGHLIGHTS,
  LINE_INACTIVE,
  MONTHS_FILL_END,
  MONTHS_FILL_START,
  WORLD_DIM_START,
} from "./layout";
import { BEATS } from "./data";
import { splitSentences } from "./sentences";
import { BEAT_ORDER, FPS, TIMELINE } from "./timeline";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// The Hook (00), Verdict split (07), Reinforcement list (08), closing thesis
// (10) and CTA (11) all render their own dedicated full-screen scenes
// instead of the generic caption.
const CAPTIONED_BEATS = new Set(["beat-01", "beat-02", "beat-03", "beat-04", "beat-05", "beat-06", "beat-09"]);

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

  const isQuote = sentence.text === "You're doing fine.";
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
          fontSize: isQuote ? 40 : 34,
          fontStyle: isQuote ? "italic" : "normal",
          lineHeight: 1.5,
          textAlign: "center",
          color: DIM_TEXT,
          opacity,
        }}
      >
        {isQuote ? (
          <>&ldquo;{sentence.text}&rdquo;</>
        ) : splitAt >= 0 ? (
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

// HUD timeline bar: fills across the silent months (Beats 4-5) and completes
// exactly as the review (Beat 6) begins, then fades once the diagram itself
// starts receding (Beat 7's verdict scene doesn't need it anymore).
export const MonthsBar: React.FC = () => {
  const frame = useCurrentFrame();
  const fillT = interpolate(frame, [MONTHS_FILL_START, MONTHS_FILL_END], [0, 1], clamp);
  const barOpacity = interpolate(
    frame,
    [MONTHS_FILL_START - 20, MONTHS_FILL_START, WORLD_DIM_START, WORLD_DIM_START + 40],
    [0, 1, 1, 0],
    clamp,
  );

  if (barOpacity <= 0) return null;

  const barWidth = 900;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: 70,
        opacity: barOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
          letterSpacing: 2,
          color: DIM_TEXT,
          textTransform: "uppercase",
        }}
      >
        Ten months
      </div>
      <div style={{ width: barWidth, height: 4, backgroundColor: LINE_INACTIVE, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${fillT * 100}%`,
            backgroundColor: ACCENT,
          }}
        />
      </div>
    </div>
  );
};
