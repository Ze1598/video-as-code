import test from "node:test";
import assert from "node:assert/strict";
import { buildMovie } from "../src/MeetingFailedBeforeStart/plan.ts";
import { previewBeats } from "../src/MeetingFailedBeforeStart/preview.ts";
import { frameState } from "../src/lib/essay-sdk/index.ts";

test("meeting story preserves both options and their distinct missing checks before proposing preparation", () => {
  const movie = buildMovie(previewBeats);
  const invite = movie.scenes[0];
  assert.equal(invite.transfers[0].item, "invite");
  assert.equal(invite.transfers[0].to, "client");
  const options = movie.scenes[1].visuals![0];
  const checks = movie.scenes[2].visuals![0];
  assert.equal(options.kind, "comparison");
  assert.equal(checks.kind, "comparison");
  if (options.kind !== "comparison" || checks.kind !== "comparison")
    throw Error("paired options required");
  assert.deepEqual(
    [options.left, options.right],
    ["Move the deadline", "Keep the date"],
  );
  assert.deepEqual([checks.left, checks.right], [options.left, options.right]);
  assert.deepEqual(checks.rows[1].left.text, "Check date dependencies");
  assert.deepEqual(checks.rows[1].right.text, "Check with business teams");
  const blocked = movie.scenes[3].visuals![0];
  assert.equal(blocked.kind, "process");
  if (blocked.kind !== "process") throw Error("waiting process required");
  assert.equal(blocked.initial, "prepare");
  assert.deepEqual(
    blocked.moves,
    [],
    "the story never establishes a completed decision",
  );
  // The concrete agenda starts with the missing scope, then expands its options.
  // Measure the options interval, rather than incorrectly treating the first interval as both thoughts.
  const constraint = movie.scenes[6].visuals![0];
  assert.equal(constraint.kind, "comparison");
  if (constraint.kind !== "comparison")
    throw Error("constraint explanation required");
  assert.equal(constraint.rows[0].right.text, "What will miss the deadline");
  const guidance = movie.scenes[6].visuals![1];
  assert.equal(
    constraint.end,
    guidance.start,
    "no blank interval between constraint and options",
  );
  assert.equal(guidance.kind, "comparison");
  if (guidance.kind !== "comparison") throw Error("concrete agenda required");
  assert.deepEqual(
    guidance.rows.map((r) => [r.left.text, r.right.text]),
    [
      ["Proposed full-scope date", "Features moved out"],
      ["Expected consequences", "Expected consequences"],
    ],
  );
  for (const s of movie.scenes.slice(0, -1)) {
    assert.ok(
      s.groups.length || s.visuals?.length,
      "each explanatory thought needs a visual",
    );
    assert.equal(frameState(movie, s.from + 60).caption, "");
    for (const i of s.items)
      assert.equal(
        s.topics.find((t) => t.item === i.id)?.start,
        i.revealAt ?? 0,
      );
  }
  const closing = movie.scenes[movie.scenes.length - 1];
  assert.equal(closing.textStyle, "italic");
  assert.deepEqual(closing.takeaways, [
    { text: true, start: 0, end: closing.duration },
  ]);
});

test("timing must match the approved script and silent preview never supplies invented audio", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const bad = structuredClone(previewBeats);
  bad["beat-00"].words[0].text = "Changed";
  assert.throws(() => buildMovie(bad), /Script mismatch/);
  assert.ok(buildMovie(previewBeats).scenes.every((s) => !s.audio));
  assert.equal(
    buildMovie(previewBeats, "MeetingFailedBeforeStartPaced").scenes[0].audio
      ?.src,
    "voiceover/MeetingFailedBeforeStartPaced/beat-00.mp3",
  );
});
