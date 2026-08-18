import { Easing, interpolate } from "remotion";
import { splitSentences, type WordTiming } from "../sentences";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export type SentenceCycleResult = {
  text: string;
  opacity: number;
  /** Index into `text` where `highlight` starts, or -1 if absent/not in the current sentence. */
  highlightSplitAt: number;
};

// One real sentence at a time, timed to its own real word timestamps —
// shared by the bottom-band caption and LongFormScene, the two places this
// format shows narration one sentence at a time rather than a static block.
// `frame` must already be LOCAL to the beat (0 at the beat's own first
// word): the caption computes this by subtracting TIMELINE[beatId].from
// from the global frame (the diagram/caption layer isn't Sequence-wrapped
// per beat); LongFormScene gets it for free from useCurrentFrame() since it
// IS wrapped in its own per-beat <Sequence>.
export function sentenceCycle(
  words: WordTiming[],
  frame: number,
  beatDurationFrames: number,
  fps: number,
  highlight?: string,
): SentenceCycleResult {
  const sentences = splitSentences(words);
  const toFrame = (ms: number) => Math.round((ms * fps) / 1000);

  let index = sentences.length - 1;
  for (let i = 0; i < sentences.length; i++) {
    if (frame < toFrame(sentences[i].startMs)) {
      index = Math.max(0, i - 1);
      break;
    }
  }
  const sentence = sentences[index];
  const windowStart = toFrame(sentence.startMs);
  const windowEnd =
    index < sentences.length - 1 ? toFrame(sentences[index + 1].startMs) : beatDurationFrames;

  const opacity = interpolate(
    frame,
    [windowStart, windowStart + 14, windowEnd - 14, windowEnd],
    [0, 1, 1, 0],
    { ...clamp, easing: EASE },
  );

  const highlightSplitAt = highlight ? sentence.text.indexOf(highlight) : -1;

  return { text: sentence.text, opacity, highlightSplitAt };
}

export type HighlightedTextProps = {
  result: SentenceCycleResult;
  highlight?: string;
  accentColor: string;
};

// Renders a sentenceCycle() result, splitting out the highlighted substring
// (if present in the CURRENT sentence) into its own accent-colored span.
export const HighlightedText: React.FC<HighlightedTextProps> = ({ result, highlight, accentColor }) => {
  const { text, highlightSplitAt } = result;
  if (highlightSplitAt < 0 || !highlight) return <>{text}</>;

  return (
    <>
      {text.slice(0, highlightSplitAt)}
      <span style={{ color: accentColor, fontWeight: 700 }}>{highlight}</span>
      {text.slice(highlightSplitAt + highlight.length)}
    </>
  );
};
