import test from "node:test";
import assert from "node:assert/strict";
import { movie } from "../src/ChangingTooMuchV11/plan.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";
import {
  renderVisual,
  visualState,
  type Visual,
} from "../src/lib/essay-sdk/visuals.ts";

test("short question labels occupy one line, using the available screen width", () => {
  const scene = movie.scenes.find((s) => s.id === "beat-03")!;
  const svg = renderSvg(frameState(movie, scene.from + scene.duration - 1));
  for (const label of [
    "What goes in the report?",
    "When is the decision made?",
  ])
    assert.ok(svg.includes(`>${label}</text>`));
});
test("meeting focus is present on the first visible frame", () => {
  const scene = movie.scenes.find((s) => s.id === "beat-02")!;
  assert.ok(
    frameState(movie, scene.from).cursors.some((c) => c.item === "meetings"),
  );
});
test("allocation has only lane labels and units, no redundant title or note", () => {
  const v: Visual = {
    kind: "allocation",
    start: 0,
    end: 120,
    title: "Redundant title",
    notes: [{ text: "Redundant note", at: 0 }],
    lanes: [
      { id: "a", label: "Migration" },
      { id: "b", label: "Calendar" },
    ],
    units: 4,
    initial: "a",
    moves: [],
  };
  const svg = renderVisual(visualState(v, 60, 60), 0);
  assert.doesNotMatch(svg, /Redundant/);
  assert.match(svg, />Migration<|>Calendar</);
});
test("time axis has a right arrowhead, Time label and aligned top milestone labels", () => {
  const v: Visual = {
    kind: "timeline",
    start: 0,
    end: 120,
    plannedLabel: "Planned",
    actualLabel: "Actual",
    planned: 0.4,
    initial: 0.4,
    moves: [{ start: 30, end: 60, to: 0.8 }],
    notes: [],
  };
  const svg = renderVisual(visualState(v, 90, 60), 0);
  assert.match(svg, /data-axis-arrow="true"/);
  assert.match(svg, />Time<\/text>/);
  for (const label of ["Actual", "Planned"])
    assert.match(svg, new RegExp('y="400"[^>]*>' + label + "</text>"));
});
test("both comparison headings and rows align left, with bullets before the text", () => {
  const v: Visual = {
    kind: "comparison",
    start: 0,
    end: 120,
    left: "Case",
    right: "Guidance",
    rows: [
      {
        id: "one",
        left: { text: "Added work", at: 0 },
        right: { text: "Protect focus", at: 0, promoted: true },
      },
    ],
  };
  const state = visualState(v, 60, 60);
  const svg = renderVisual(state, 0);
  assert.doesNotMatch(svg, /text-anchor="end"/);
  if (state.kind !== "comparison") throw Error("comparison required");
  for (const c of state.cells) assert.ok(svg.includes(`d="M${c.x - 60} `));
});
test("closing CTA is italic and multi-line text is centered above the screen midpoint", () => {
  const scene = movie.scenes.find((s) => s.id === "beat-10")!;
  const svg = renderSvg(frameState(movie, scene.from + 120));
  assert.match(svg, /font-style="italic"/);
  const ys = [...svg.matchAll(/<text x="960" y="([\d.]+)"/g)].map((m) =>
    Number(m[1]),
  );
  assert.ok(ys.length > 0);
  assert.ok((Math.min(...ys) + Math.max(...ys)) / 2 < 520);
});
