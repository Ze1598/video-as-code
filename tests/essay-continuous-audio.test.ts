import { test } from "node:test";
import assert from "node:assert/strict";
import { compileEssay, type Scene } from "../src/lib/essay-sdk/index.ts";
import { continuousNarrationTimeline } from "../scripts/lib/essay-audio.ts";

const scene = (id: string): Scene => ({ id, duration: 60, narration: [], groups: [], items: [], transfers: [], topics: [], takeaways: [] });

test("one continuous audio track spans visual scene changes without scene audio sequences", () => {
  const audio = { src: "voiceover/full/narration.mp3", duration: 120 };
  const movie = compileEssay({ fps: 60, scenes: [scene("first"), scene("second")], audio });
  assert.deepEqual(movie.audio, audio);
  assert.deepEqual(movie.scenes.map((item) => item.from), [0, 60]);
  assert.ok(movie.scenes.every((item) => !item.audio));
  assert.equal(movie.duration, 120);
});

test("continuous narration keeps absolute timing without accumulated scene rounding or inserted gaps", () => {
  const narration = { modelId: "eleven_v4" as const, voiceSettings: { stability: 0.35, similarity_boost: 0.75, style: 0.45, speed: 0.92 }, pausePlan: { internalSentenceMs: 250, laterSceneLeadMs: 500, sceneHoldMs: 750, finalHoldMs: 750, phrasingBpm: 92 }, segments: [{ id: "first", sentences: ["First."] }, { id: "second", sentences: ["Second."] }, { id: "third", sentences: ["Third."] }] };
  const words = [{ text: "First.", startMs: 0, endMs: 333 }, { text: "Second.", startMs: 1600, endMs: 1901 }, { text: "Third.", startMs: 3200, endMs: 3601 }];
  const timeline = continuousNarrationTimeline(narration, words, 4400, 60, 750);
  assert.equal(timeline.duration, 264);
  assert.equal(timeline.beats.second.from, 65);
  assert.equal(timeline.beats.third.from, 160);
  for (const [index, beat] of Object.values(timeline.beats).entries()) {
    assert.ok(Math.abs(beat.from * 1000 / 60 + beat.words[0].startMs - words[index].startMs) < 0.001);
  }
  assert.equal(Object.values(timeline.beats).reduce((sum, beat) => sum + beat.durationFrames, 0), 264);
  const briefWord = continuousNarrationTimeline(narration, [{ text: "First.", startMs: 0, endMs: 333 }, { text: "Second.", startMs: 1001, endMs: 1007 }, { text: "Third.", startMs: 2200, endMs: 2500 }], 3000, 60, 750);
  assert.equal(briefWord.beats.second.from, 60, "boundary must precede the next word even when that word lasts less than a frame");
  assert.equal(briefWord.beats.second.words[0].startMs, 1);
  assert.equal(briefWord.beats.second.words[0].endMs, 7);
});

test("continuous audio refuses duplicate scene playback and tracks outside the movie", () => {
  assert.throws(() => compileEssay({ fps: 60, scenes: [{ ...scene("first"), audio: { src: "beat.mp3", duration: 60 } }], audio: { src: "full.mp3", duration: 60 } }), /continuous/);
  assert.throws(() => compileEssay({ fps: 60, scenes: [scene("first")], audio: { src: "full.mp3", duration: 61 } }), /audio/);
});
