import { interpolate } from "remotion";
import type { WordTiming } from "../../../lib/essay-sdk/sentences.ts";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export function narratedHighlightProgress(
  words: WordTiming[],
  sentenceText: string,
  highlight: string | undefined,
  frame: number,
  fps: number,
): number {
  if (!highlight) return 0;
  const highlightSplitAt = sentenceText.indexOf(highlight);
  if (highlightSplitAt < 0) return 0;

  let cursor = 0;
  const highlightWord = words.find((word) => {
    const wordStart = cursor;
    const wordEnd = wordStart + word.text.length;
    cursor = wordEnd + 1;
    return highlightSplitAt >= wordStart && highlightSplitAt < wordEnd;
  });
  if (!highlightWord) return 0;

  const cueFrame = Math.round((highlightWord.startMs * fps) / 1000);
  return interpolate(frame, [cueFrame, cueFrame + 8], [0, 1], clamp);
}
