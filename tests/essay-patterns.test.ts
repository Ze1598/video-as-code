import test from "node:test";
import assert from "node:assert/strict";
import {
  compileEssay,
  frameState,
  renderSvg,
  type Scene,
} from "../src/lib/essay-sdk/index.ts";
import type { Visual } from "../src/lib/essay-sdk/visuals.ts";

const scene = (visual: Visual): Scene => ({
  id: "example",
  duration: 600,
  narration: [
    { text: "Spoken explanation, not a subtitle.", startMs: 0, endMs: 8000 },
  ],
  groups: [],
  items: [],
  topics: [],
  transfers: [],
  takeaways: [],
  visuals: [visual],
});
const comparison: Visual = {
  kind: "comparison",
  start: 0,
  end: 600,
  title: "Choose the intervention",
  left: "What happened",
  right: "Better approach",
  rows: [
    {
      id: "one",
      left: { text: "Push harder", at: 30 },
      right: { text: "Find the obstacle", at: 120, promoted: true },
    },
    {
      id: "two",
      left: { text: "Assume motivation", at: 180 },
      right: { text: "Clarify expectations", at: 240, promoted: true },
    },
  ],
};
const allocation: Visual = {
  kind: "allocation",
  start: 0,
  end: 600,
  title: "Same available time",
  lanes: [
    { id: "report", label: "Client report" },
    { id: "demo", label: "Prospect demo" },
  ],
  units: 4,
  initial: "report",
  moves: [{ units: [2, 3], to: "demo", start: 120, end: 180 }],
  notes: [],
};
const process: Visual = {
  kind: "process",
  start: 0,
  end: 600,
  title: "Request access",
  stages: [
    { id: "request", label: "Request", at: 0 },
    { id: "approval", label: "Approval", at: 60 },
    { id: "access", label: "Access", at: 0 },
  ],
  token: "License request",
  initial: "request",
  moves: [
    { to: "approval", start: 90, end: 150 },
    { to: "request", start: 300, end: 360 },
    { to: "access", start: 420, end: 480 },
  ],
  notes: [{ text: "Approval missing", at: 180 }],
};
const timeline: Visual = {
  kind: "timeline",
  start: 0,
  end: 600,
  title: "Delivery slips",
  plannedLabel: "Planned",
  actualLabel: "Actual",
  planned: 0.65,
  initial: 0.65,
  moves: [{ start: 90, end: 180, to: 0.9 }],
  notes: [],
};

test("paired rows reveal independently, stay aligned and accent only explicit guidance", () => {
  const movie = compileEssay({ fps: 60, scenes: [scene(comparison)] });
  const first = frameState(movie, 60);
  assert.equal(first.caption, "");
  assert.equal(first.visual!.kind, "comparison");
  if (first.visual!.kind !== "comparison") throw Error("wrong pattern");
  assert.equal(first.visual!.cells.filter((c) => c.visible).length, 1);
  const state = frameState(movie, 280).visual!;
  if (state.kind !== "comparison") throw Error("wrong pattern");
  assert.equal(state.cells[0].y, state.cells[1].y);
  assert.equal(state.cells[2].y, state.cells[3].y);
  assert.ok(
    state.cells
      .filter((c) => c.side === "left")
      .every((c) => c.color === "#D4D3D2"),
  );
  assert.ok(
    state.cells
      .filter((c) => c.side === "right")
      .every((c) => c.color === "#EEA530"),
  );
  assert.doesNotMatch(
    renderSvg(frameState(movie, 280)),
    /Spoken explanation|opacity=|<rect[^>]*data-panel/,
  );
});

test("allocation conserves identifiable units every frame and never duplicates a transfer", () => {
  const movie = compileEssay({ fps: 60, scenes: [scene(allocation)] });
  for (let f = 0; f < 600; f++) {
    const state = frameState(movie, f).visual!;
    if (state.kind !== "allocation") throw Error("wrong pattern");
    assert.equal(state.units.length, 4);
    assert.equal(new Set(state.units.map((u) => u.id)).size, 4);
    assert.ok(state.units.every((u) => u.x >= 650 && u.x + u.width <= 1680));
  }
  const end = frameState(movie, 180).visual!;
  if (end.kind !== "allocation") throw Error("wrong pattern");
  assert.deepEqual(
    end.units.map((u) => u.lane),
    ["report", "report", "demo", "demo"],
  );
  const start = frameState(movie, 0).visual!;
  if (start.kind !== "allocation") throw Error("wrong pattern");
  assert.equal(
    end.units[2].x,
    start.units[2].x,
    "reallocation preserves the unit column",
  );
});

test("process can wait, return for rework and resume without changing stage positions", () => {
  const movie = compileEssay({ fps: 60, scenes: [scene(process)] });
  const get = (f: number) => {
    const v = frameState(movie, f).visual!;
    if (v.kind !== "process") throw Error("wrong pattern");
    return v;
  };
  assert.equal(get(59).stages[1].visible, false);
  assert.equal(get(60).stages[1].visible, true);
  assert.equal(get(160).token.x, get(299).token.x);
  assert.ok(get(330).token.x < get(300).token.x);
  assert.equal(get(360).token.stage, "request");
  assert.equal(get(480).token.stage, "access");
  assert.deepEqual(
    get(0).stages.map((s) => s.x),
    get(500).stages.map((s) => s.x),
  );
});

test("timeline keeps the commitment fixed while the actual delivery moves later", () => {
  const movie = compileEssay({ fps: 60, scenes: [scene(timeline)] });
  const get = (f: number) => {
    const v = frameState(movie, f).visual!;
    if (v.kind !== "timeline") throw Error("wrong pattern");
    return v;
  };
  assert.equal(get(0).plannedX, get(0).actualX);
  assert.equal(get(0).actualVisible, false);
  assert.equal(get(180).actualVisible, true);
  assert.equal(get(180).plannedX, get(0).plannedX);
  assert.ok(get(180).actualX > get(180).plannedX);
});

test("process and milestone views omit decorative narration; comparison uses split headings and dash bullets", () => {
  const draw = (v: Visual, f = 300) =>
    renderSvg(frameState(compileEssay({ fps: 60, scenes: [scene(v)] }), f));
  const flow = draw(process);
  assert.doesNotMatch(flow, /Request access|Approval missing/);
  const time = draw(timeline);
  assert.doesNotMatch(time, /Delivery slips/);
  assert.match(time, /data-time-axis/);
  assert.match(time, /data-planned-milestone/);
  assert.match(time, /data-actual-milestone[^>]*stroke-dasharray/);
  assert.doesNotMatch(draw(timeline, 0), /data-actual-milestone/);
  const split = draw(comparison);
  assert.match(split, /data-divider/);
  assert.equal((split.match(/data-bullet=/g) ?? []).length, 4);
  assert.match(split, /WHAT HAPPENED/);
  assert.doesNotMatch(split, /Choose the intervention/);
});

test("visual bounds, references and conflicting motion fail before rendering", () => {
  const bad = structuredClone(allocation);
  if (bad.kind !== "allocation") throw Error("fixture");
  bad.moves.push({ units: [2], to: "demo", start: 140, end: 200 });
  assert.throws(
    () => compileEssay({ fps: 60, scenes: [scene(bad)] }),
    /overlap/,
  );
  bad.moves = [{ units: [8], to: "demo", start: 10, end: 20 }];
  assert.throws(() => compileEssay({ fps: 60, scenes: [scene(bad)] }), /unit/);
  const stages = structuredClone(process);
  if (stages.kind !== "process") throw Error("fixture");
  stages.moves[0].to = "missing";
  assert.throws(
    () => compileEssay({ fps: 60, scenes: [scene(stages)] }),
    /stage/,
  );
  const duplicate = scene(comparison);
  duplicate.visuals!.push(allocation);
  assert.throws(
    () => compileEssay({ fps: 60, scenes: [duplicate] }),
    /overlap/,
  );
});

test("the same patterns serve different essays without video-specific render code", () => {
  for (const [left, right] of [
    ["Win the argument", "Expose the problem"],
    ["Word of mouth", "Instructions at the task"],
    ["More people", "Find the constraint"],
  ]) {
    const v = structuredClone(comparison);
    v.left = left;
    v.right = right;
    const svg = renderSvg(
      frameState(compileEssay({ fps: 60, scenes: [scene(v)] }), 300),
    );
    assert.ok(
      svg.includes(left.toUpperCase()) && svg.includes(right.toUpperCase()),
    );
  }
});
