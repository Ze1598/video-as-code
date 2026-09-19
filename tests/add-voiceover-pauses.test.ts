import test from "node:test";
import assert from "node:assert/strict";
import { addPausesToTiming, sentenceBoundaryIndexes } from "../scripts/add-voiceover-pauses.ts";

const timing = {
  text: "First sentence. Second sentence! Final words.",
  durationMs: 2400,
  words: [
    { text: "First", startMs: 0, endMs: 300 },
    { text: "sentence.", startMs: 350, endMs: 700 },
    { text: "Second", startMs: 850, endMs: 1150 },
    { text: "sentence!", startMs: 1200, endMs: 1550 },
    { text: "Final", startMs: 1750, endMs: 2000 },
    { text: "words.", startMs: 2050, endMs: 2400 },
  ],
};

test("sentenceBoundaryIndexes excludes the final sentence boundary", () => {
  assert.deepEqual(sentenceBoundaryIndexes(timing.words), [1, 3]);
});

test("addPausesToTiming shifts lead-in and every later sentence without changing text", () => {
  const shifted = addPausesToTiming(timing, 500, 250);
  assert.equal(shifted.text, timing.text);
  assert.equal(shifted.durationMs, 3400);
  assert.deepEqual(shifted.words, [
    { text: "First", startMs: 500, endMs: 800 },
    { text: "sentence.", startMs: 850, endMs: 1200 },
    { text: "Second", startMs: 1600, endMs: 1900 },
    { text: "sentence!", startMs: 1950, endMs: 2300 },
    { text: "Final", startMs: 2750, endMs: 3000 },
    { text: "words.", startMs: 3050, endMs: 3400 },
  ]);
});
