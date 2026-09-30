import test from "node:test";
import assert from "node:assert/strict";
import { buildMovie } from "../src/DontWaitWeeklyReview/plan.ts";
import { previewBeats } from "../src/DontWaitWeeklyReview/preview.ts";
import { frameState } from "../src/lib/essay-sdk/index.ts";

test("weekly review story shows accumulating blocked work before delay and adaptive cadence", () => {
  const movie = buildMovie(previewBeats);
  const monday = movie.scenes[2],
    tuesday = movie.scenes[3];
  assert.deepEqual(monday.groups, tuesday.groups);
  assert.equal(monday.items[0].id, tuesday.items[0].id);
  assert.deepEqual(
    tuesday.items.map((i) => i.label),
    ["Which system changes?", "Monday fix waits", "Tuesday dependency waits"],
  );
  assert.ok(tuesday.items[2].revealAt! > 0);
  const position = (scene: typeof monday, local: number) => {
    const item = frameState(movie, scene.from + local).items.find(
      (i) => i.id === "monday",
    )!;
    return [
      item.textAnchor === "middle"
        ? item.x + item.width / 2 - item.labelWidth / 2
        : item.x,
      item.y,
    ];
  };
  assert.deepEqual(
    position(monday, monday.duration - 1),
    position(tuesday, 0),
    "Monday work must not jump when Tuesday dependency is introduced",
  );
  const outcome = movie.scenes[4].visuals!;
  assert.deepEqual(
    outcome.map((v) => v.kind),
    ["process", "timeline"],
  );
  const cadence = movie.scenes[6].visuals![0];
  assert.equal(cadence.kind, "comparison");
  if (cadence.kind !== "comparison") throw Error("comparison required");
  assert.deepEqual(
    cadence.rows.map((r) => [r.left.text, r.right.text]),
    [
      ["Changes each day", "Stable for a week"],
      ["Daily review", "Weekly review"],
    ],
  );
  for (const s of movie.scenes.slice(0, -1)) {
    assert.ok(
      s.groups.length || s.visuals?.length,
      `${s.id} needs explanation`,
    );
    assert.equal(frameState(movie, s.from + 60).caption, "");
    for (const i of s.items.filter((i) => i.revealAt !== undefined))
      assert.equal(s.topics.find((t) => t.item === i.id)?.start, i.revealAt);
  }
  const final = movie.scenes[movie.scenes.length - 1];
  assert.equal(final.textStyle, "italic");
  assert.deepEqual(final.takeaways, [
    { text: true, start: 0, end: final.duration },
  ]);
});

test("production requires matching timed narration; previews contain no audio", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const altered = structuredClone(previewBeats);
  altered["beat-00"].words[0].text = "Wrong";
  assert.throws(() => buildMovie(altered), /Script mismatch/);
  assert.ok(buildMovie(previewBeats).scenes.every((s) => !s.audio));
  assert.equal(
    buildMovie(previewBeats, "DontWaitWeeklyReviewPaced").scenes[0].audio?.src,
    "voiceover/DontWaitWeeklyReviewPaced/beat-00.mp3",
  );
});
