import test from "node:test";
import assert from "node:assert/strict";
import { movie, script } from "../src/ChangingTooMuchV11/plan.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

test("the opener contains the scenario only and cuts audio before the consequence", () => {
  const hook = movie.scenes[0];
  assert.equal(hook.narration[hook.narration.length - 1]?.text, "productive.");
  assert.ok((hook.audio!.duration / movie.fps) * 1000 < 6932);
  assert.ok(!hook.narration.some((w) => w.text === "behind."));
});

test("the department head hands off meeting work while migration remains with the team", () => {
  const scene = movie.scenes.find((s) => s.id === "beat-02")!;
  const transfer = scene.transfers[0];
  assert.equal(transfer.item, "meetings");
  assert.equal(transfer.to, "team");
  const start = frameState(movie, scene.from);
  assert.equal(start.items.find((i) => i.id === "migration")!.owner, "team");
  assert.equal(start.items.find((i) => i.id === "meetings")!.owner, "head");
  assert.equal(
    frameState(movie, scene.from + transfer.end).items.find(
      (i) => i.id === "meetings",
    )!.owner,
    "team",
  );
  for (let local = transfer.start; local < scene.duration; local++) {
    const state = frameState(movie, scene.from + local);
    const item = state.items.find((i) => i.id === "meetings")!;
    const cursor = state.cursors.find((c) => c.item === "meetings");
    assert.ok(cursor, "meeting focus stays visible through and after handoff");
    assert.equal(cursor.x, item.x - 24);
    assert.equal(cursor.y, item.y + 24);
  }
});

test("the uncertainty scene stages three plain questions in narrated order", () => {
  const scene = movie.scenes.find((s) => s.id === "beat-03")!;
  const state = frameState(movie, scene.from);
  assert.deepEqual(
    state.groups.map((g) => g.id),
    ["team"],
  );
  assert.deepEqual(
    state.items.map((i) => i.label),
    [
      "Which meeting?",
      "What goes in the report?",
      "When is the decision made?",
    ],
  );
  for (const item of scene.items) {
    assert.equal(
      frameState(movie, scene.from + item.revealAt! - 1).items.find(
        (i) => i.id === item.id,
      )!.visible,
      false,
    );
    assert.equal(
      frameState(movie, scene.from + item.revealAt!).items.find(
        (i) => i.id === item.id,
      )!.visible,
      true,
    );
  }
});

test("all frames stay within the same viewport, and only promoted behavior receives gold", () => {
  for (const scene of movie.scenes) {
    for (const offset of [
      0,
      Math.floor(scene.duration / 2),
      scene.duration - 1,
    ]) {
      const svg = renderSvg(frameState(movie, scene.from + offset));
      assert.doesNotMatch(svg, /transform=/);
      if (!["beat-09", "beat-10"].includes(scene.id))
        assert.doesNotMatch(svg, /#EEA530/);
    }
  }
});

test("consequences progress directly to extrapolation, without the duplicate recap or its audio", () => {
  assert.deepEqual(
    movie.scenes.map((s) => s.id),
    [
      "beat-00",
      "beat-01",
      "beat-02",
      "beat-03",
      "beat-04",
      "beat-05",
      "beat-06",
      "beat-08",
      "beat-09",
      "beat-10",
    ],
  );
  assert.ok(movie.scenes.every((s) => !s.audio?.src.includes("beat-07")));
  assert.doesNotMatch(
    script.map((s) => s.text).join(" "),
    /Nothing here required|One team had one pool/,
  );
  assert.equal(movie.duration, 8585);
});

test("the head/team relationship persists through both relevant scenes without a phase reset", () => {
  for (const id of ["beat-01", "beat-02"]) {
    const scene = movie.scenes.find((s) => s.id === id)!;
    for (let frame = 30; frame < scene.duration; frame++)
      assert.equal(
        frameState(movie, scene.from + frame).relationships.length,
        1,
      );
  }
  const scene = movie.scenes.find((s) => s.id === "beat-02")!;
  const a = frameState(movie, scene.from - 1).relationships[0];
  const b = frameState(movie, scene.from).relationships[0];
  assert.ok(Math.abs(b.dashOffset - a.dashOffset + 0.21) < 0.000001);
});

test("existing work never swaps rows during handoff, and the team reframe starts continuously", () => {
  const before = movie.scenes.find((s) => s.id === "beat-01")!;
  const handoff = movie.scenes.find((s) => s.id === "beat-02")!;
  const after = movie.scenes.find((s) => s.id === "beat-03")!;
  for (const id of ["migration", "bugs"]) {
    const a = frameState(movie, before.from + before.duration - 1).items.find(
      (i) => i.id === id,
    )!;
    const b = frameState(movie, handoff.from).items.find((i) => i.id === id)!;
    assert.deepEqual([a.x, a.y], [b.x, b.y]);
  }
  const end = frameState(movie, handoff.from + handoff.duration - 1);
  const start = frameState(movie, after.from);
  const a = end.groups.find((g) => g.id === "team")!;
  const b = start.groups.find((g) => g.id === "team")!;
  assert.equal(a.x + a.width / 2, b.x + b.width / 2);
  const settled = frameState(movie, after.from + 30);
  assert.deepEqual(
    settled.items.map((i) => i.y),
    [390, 495, 600],
  );
  assert.equal(new Set(settled.items.map(i => i.x)).size, 1);
  assert.ok(settled.items.every(i => i.x + i.width / 2 === 960));
  assert.equal(settled.items[0].width, Math.max(...settled.items.map(i => i.labelWidth)));
});

test("the middle advances through allocation, waiting and delay; only hook and CTA are text-only", () => {
  const expected = {
    "beat-04": "allocation",
    "beat-05": "process",
    "beat-06": "timeline",
    "beat-08": "comparison",
    "beat-09": "comparison",
  };
  for (const [id, kind] of Object.entries(expected)) {
    const scene = movie.scenes.find((s) => s.id === id)!;
    assert.equal(frameState(movie, scene.from + 100).visual!.kind, kind);
    assert.equal(frameState(movie, scene.from + 100).caption, "");
  }
  assert.deepEqual(
    movie.scenes
      .filter((s) => !s.groups.length && !s.visuals?.length)
      .map((s) => s.id),
    ["beat-00", "beat-10"],
  );
  const guidance = movie.scenes.find((s) => s.id === "beat-09")!;
  const comparison = frameState(movie, guidance.from).visual!;
  if (comparison.kind !== "comparison") throw Error("expected comparison");
  assert.equal(
    comparison.rightColor,
    "#EEA530",
    "guidance heading enters gold",
  );
  const allocation = movie.scenes.find((s) => s.id === "beat-04")!;
  const before = frameState(movie, allocation.from + 60).visual!;
  const after = frameState(movie, allocation.from + 260).visual!;
  if (before.kind !== "allocation" || after.kind !== "allocation")
    throw Error("expected allocation");
  assert.equal(before.units.filter((u) => u.lane === "migration").length, 6);
  assert.equal(after.units.filter((u) => u.lane === "migration").length, 2);
  const process = movie.scenes.find((s) => s.id === "beat-05")!;
  const waiting = frameState(movie, process.from + 800).visual!;
  if (waiting.kind !== "process") throw Error("expected process");
  assert.equal(waiting.token.stage, "schedule");
  assert.ok(
    waiting.token.x < waiting.stages.find((s) => s.id === "resolve")!.x,
  );
});
