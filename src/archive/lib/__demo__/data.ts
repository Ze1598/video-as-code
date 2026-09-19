import type { Beat, WordTiming } from "../timeline.ts";

// Synthetic placeholder data for src/lib's smoke-test composition — NOT real
// narration, so hand-generated word timings are fine here (unlike an actual
// video, where every word timestamp must come from real ElevenLabs audio).
// Each word gets a flat ~320ms slot; good enough to exercise sentence
// cycling, reveal cues, and camera/connector timing without needing a real
// audio file.
function fakeWords(text: string): WordTiming[] {
  const words = text.split(" ");
  let cursor = 0;
  return words.map((w) => {
    const durationMs = 260 + w.length * 30;
    const word = { text: w, startMs: cursor, endMs: cursor + durationMs };
    cursor += durationMs + 90;
    return word;
  });
}

function fakeBeat(id: string, text: string): Beat {
  const words = fakeWords(text);
  return { id, durationMs: words[words.length - 1].endMs, words };
}

export const DEMO_BEATS: Record<string, Beat> = {
  hook: fakeBeat("hook", "This is a demo hook line. It sets up curiosity without giving anything away."),
  diagram: fakeBeat("diagram", "Alpha reaches out to Beta under conditions that are real."),
  list: fakeBeat(
    "list",
    "Here is what changed: One thing happened first. Another thing happened next. A third thing happened last.",
  ),
  split: fakeBeat(
    "split",
    "The right call was made here, the mistake was somewhere else entirely, and this is the supporting detail underneath.",
  ),
  longform: fakeBeat(
    "longform",
    "This is reflective long form text. It stands alone on screen. Nothing else competes for attention here.",
  ),
  cta: fakeBeat("cta", "Have you seen this exact pattern before?"),
};
