import test from "node:test";
import assert from "node:assert/strict";
import { buildMovie } from "../src/DidntRepeatPriority/plan.ts";
import { previewBeats } from "../src/DidntRepeatPriority/preview.ts";
import { frameState } from "../src/lib/essay-sdk/index.ts";

test("priority story separates understanding architecture from knowing what to deliver", () => {
  const movie = buildMovie(previewBeats);
  assert.equal(movie.scenes.length, 9);
  const research = movie.scenes[2].visuals![0];
  assert.equal(research.kind, "process");
  if (research.kind !== "process") throw Error("research process required");
  assert.equal(research.initial, "story");
  assert.deepEqual(
    research.moves.map((m) => m.to),
    ["research", "possibilities"],
  );
  assert.ok(
    research.stages.some((s) => s.id === "working"),
    "working feature remains a visible unreached destination",
  );
  const outcome = movie.scenes[3].visuals![0];
  assert.equal(outcome.kind, "comparison");
  if (outcome.kind !== "comparison") throw Error("outcome comparison required");
  assert.equal(outcome.rows[0].right.text, "Little working software");
  assert.ok(!outcome.rows[0].right.promoted, "failure is neutral");
  const scope = movie.scenes[5].visuals![0];
  assert.equal(scope.kind, "comparison");
  if (scope.kind !== "comparison")
    throw Error("architecture versus scope required");
  assert.deepEqual(
    scope.rows.map((r) => r.right.text),
    ["How far to take a feature", "Which possibilities to ignore"],
  );
  assert.deepEqual(
    movie.scenes[6].items.map((i) => i.label),
    ["Expected output", "How far to take the feature", "What to leave out"],
  );
  for (const s of movie.scenes.slice(0, -1)) {
    assert.ok(
      s.groups.length || s.visuals?.length,
      "every explanatory scene has a visual",
    );
    assert.equal(frameState(movie, s.from + 60).caption, "");
    for (const i of s.items)
      assert.equal(
        s.topics.find((t) => t.item === i.id)?.start,
        i.revealAt ?? 0,
      );
  }
  const cta = movie.scenes[movie.scenes.length - 1];
  assert.equal(cta.textStyle, "italic");
  assert.deepEqual(cta.takeaways, [
    { text: true, start: 0, end: cta.duration },
  ]);
  assert.doesNotMatch(
    movie.scenes.map((s) => s.narration.map((w) => w.text).join(" ")).join(" "),
    /three times/,
    "rhetorical rework warning is not presented as a measured multiplier",
  );
});

test("production requires exact spoken words while review uses explicitly estimated silent timing", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const bad = structuredClone(previewBeats);
  bad["beat-00"].words[0].text = "Wrong";
  assert.throws(() => buildMovie(bad), /Script mismatch/);
  assert.ok(buildMovie(previewBeats).scenes.every((s) => !s.audio));
  assert.equal(
    buildMovie(previewBeats, "DidntRepeatPriorityPaced").scenes[0].audio?.src,
    "voiceover/DidntRepeatPriorityPaced/beat-00.mp3",
  );
});
