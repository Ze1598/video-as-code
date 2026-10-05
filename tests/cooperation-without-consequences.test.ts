import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NARRATION, AUDIO_REQUEST } from "../src/CooperationWithoutConsequences/audio.ts";

test("cooperation narration preserves words and the canonical complete pause budget", () => {
  const defaults = JSON.parse(readFileSync(".agents/skills/generate-essay-audio/assets/narration-defaults.json", "utf8"));
  assert.equal(AUDIO_REQUEST.model_id, defaults.modelId);
  assert.deepEqual(AUDIO_REQUEST.voice_settings, defaults.voiceSettings);
  assert.deepEqual(NARRATION.pausePlan, defaults.pausePlan);
  const spoken = NARRATION.segments.map(s => s.sentences.join(" ")).join(" ");
  assert.equal(AUDIO_REQUEST.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim(), spoken);
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 0\.25 seconds\]/g)?.length, NARRATION.segments.reduce((n, s) => n + s.sentences.length - 1, 0));
  assert.equal(AUDIO_REQUEST.text.match(/\[pause for 1\.25 seconds\]/g)?.length, NARRATION.segments.length - 1);
  assert.ok(AUDIO_REQUEST.text.endsWith("[pause for 0.75 seconds]"));
  const review = readFileSync("src/CooperationWithoutConsequences/SCRIPT.md", "utf8");
  for (const s of NARRATION.segments) assert.ok(review.includes(s.sentences.join(" ")));
});

test("the adaptation distinguishes inability from a repeated pattern and leaves a path back", () => {
  const spoken = NARRATION.segments.map(s => s.sentences.join(" ")).join(" ");
  for (const phrase of ["A genuine inability to help", "a pattern of taking without contributing", "Start by helping", "return the help you receive", "let a return to cooperation rebuild it"]) assert.ok(spoken.includes(phrase), phrase);
  assert.ok(!NARRATION.segments[0].sentences.join(" ").includes("refused"), "hook establishes the agreement before its consequence");
});
