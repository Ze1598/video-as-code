import test from "node:test";
import assert from "node:assert/strict";
import { buildMovie } from "../src/ChangeBrightSpot/plan.ts";
import { previewBeats } from "../src/ChangeBrightSpot/preview.ts";
import { frameState } from "../src/lib/essay-sdk/index.ts";

test("bright spot explanation follows the reader feedback loop before proposing a trial", () => {
  const movie = buildMovie(previewBeats);
  const loop = movie.scenes.find((s) => s.id === "beat-02")!.visuals![0];
  assert.equal(loop.kind, "process");
  if (loop.kind !== "process") throw Error("feedback process required");
  assert.equal(loop.initial, "author");
  assert.deepEqual(
    loop.moves.map((m) => m.to),
    ["reader", "author", "reader"],
  );
  assert.ok(
    loop.moves[1].start > loop.moves[0].end,
    "reader has time to expose a gap",
  );
  assert.ok(
    loop.moves[2].start > loop.moves[1].end,
    "author has time to revise",
  );
  const support = movie.scenes.find((s) => s.id === "beat-03")!;
  assert.deepEqual(
    support.items.map((i) => i.label),
    ["A reader who needs it", "Feedback on the gaps", "Time to revise"],
  );
  const cost = movie.scenes.find((s) => s.id === "beat-07")!;
  assert.match(cost.narration.map((w) => w.text).join(" "), /working late/);
  assert.ok(cost.visuals?.length, "hidden cost has an explanatory visual");
  const trial = movie.scenes.find((s) => s.id === "beat-08")!;
  assert.ok(
    trial.narration
      .map((w) => w.text)
      .join(" ")
      .includes("another team"),
  );
  for (const scene of movie.scenes.slice(0, -1)) {
    assert.ok(
      scene.groups.length || scene.visuals?.length,
      scene.id + " needs a visual",
    );
    assert.equal(frameState(movie, scene.from + 60).caption, "");
    for (const item of scene.items) {
      assert.equal(
        scene.topics.find((t) => t.item === item.id)?.start,
        item.revealAt ?? 0,
        "focus begins with entry",
      );
    }
  }
  const last = movie.scenes[movie.scenes.length - 1];
  assert.equal(last.textStyle, "italic");
  assert.deepEqual(last.takeaways, [
    { text: true, start: 0, end: last.duration },
  ]);
});

test("narration must match the exact script and production binds real audio only when supplied", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const altered = structuredClone(previewBeats);
  altered["beat-00"].words[0].text = "Changed";
  assert.throws(() => buildMovie(altered), /Script mismatch/);
  assert.ok(buildMovie(previewBeats).scenes.every((s) => !s.audio));
  const production = buildMovie(previewBeats, "ChangeBrightSpotPaced");
  assert.equal(
    production.scenes[0].audio?.src,
    "voiceover/ChangeBrightSpotPaced/beat-00.mp3",
  );
});
