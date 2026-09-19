export type WordTiming = { text: string; startMs: number; endMs: number };
export type Beat = { id: string; durationMs: number; words: WordTiming[] };
export type TimelineEntry = { from: number; duration: number };

// Every beat's duration is its real ElevenLabs speech length (from data.ts,
// never hand-typed) plus a deliberate hold — long enough to read as a
// breath, not a rounding error. Weight each beat's hold by what it's doing
// (short/plain beats at the low end, a pivot line or the Mechanism Reveal at
// the high end, ~2.5s for the closing CTA) rather than hand-summing a
// cumulative frame table — that table silently goes stale the moment the
// audio changes (a re-generation, a different voice, a script edit), and a
// hand-summed table has no way to notice.
export function buildTimeline(
  beatOrder: string[],
  beats: Record<string, Beat>,
  holdSeconds: Record<string, number>,
  fps: number,
): Record<string, TimelineEntry> {
  const timeline: Record<string, TimelineEntry> = {};
  let cursor = 0;
  for (const id of beatOrder) {
    const speechFrames = Math.round((beats[id].durationMs * fps) / 1000);
    const holdFrames = Math.round(holdSeconds[id] * fps);
    const duration = speechFrames + holdFrames;
    timeline[id] = { from: cursor, duration };
    cursor += duration;
  }
  return timeline;
}

export function totalDuration(beatOrder: string[], timeline: Record<string, TimelineEntry>): number {
  const lastId = beatOrder[beatOrder.length - 1];
  return timeline[lastId].from + timeline[lastId].duration;
}

// Converts a beat-local ElevenLabs word timestamp into a global frame number,
// by matching the word's text within that beat's real word list. This is how
// every visual state change (connector draw-on, packet travel, camera cue
// points) is anchored to real speech instead of a guessed frame — never call
// this with a frame number you made up.
export function frameOfWordFactory(
  beats: Record<string, Beat>,
  timeline: Record<string, TimelineEntry>,
  fps: number,
) {
  return function frameOfWord(
    beatId: string,
    wordText: string,
    edge: "start" | "end" = "start",
    occurrence = 0,
  ): number {
    const beat = beats[beatId];
    const matches = beat.words.filter((w) => w.text === wordText);
    const word = matches[occurrence];
    if (!word) {
      throw new Error(`Word "${wordText}" (occurrence ${occurrence}) not found in ${beatId}`);
    }
    const localMs = edge === "start" ? word.startMs : word.endMs;
    const localFrame = Math.round((localMs * fps) / 1000);
    return timeline[beatId].from + localFrame;
  };
}
