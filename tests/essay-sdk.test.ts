import test from "node:test";
import assert from "node:assert/strict";
import {
  compileEssay,
  frameState,
  renderSvg,
} from "../src/lib/essay-sdk/index.ts";
import type { EssayPlan } from "../src/lib/essay-sdk/index.ts";

// Requirements fixture: an individual assigns additional work to an existing
// team, then the next scene explains its competing demands in a new layout.
const plan: EssayPlan = {
  fps: 60,
  scenes: [
    {
      id: "handoff",
      duration: 240,
      narration: [],
      groups: [
        { id: "leader", label: "Leader", members: 1 },
        { id: "team", label: "Team", members: 3 },
      ],
      items: [
        { id: "migration", label: "Migration", kind: "work", owner: "team" },
        { id: "meetings", label: "Meetings", kind: "process", owner: "leader" },
      ],
      transfers: [{ item: "meetings", to: "team", start: 60, end: 120 }],
      topics: [{ group: "team", item: "meetings", start: 120, end: 210 }],
      takeaways: [],
    },
    {
      id: "demands",
      duration: 180,
      narration: [],
      groups: [{ id: "team", label: "Team", members: 3 }],
      items: [
        { id: "migration", label: "Migration", kind: "work", owner: "team" },
        { id: "bugs", label: "Bugs", kind: "issue", owner: "team" },
        { id: "meetings", label: "Meetings", kind: "process", owner: "team" },
      ],
      transfers: [],
      topics: [],
      takeaways: [{ item: "migration", start: 0, end: 180 }],
    },
  ],
};

test("handoff moves one existing work item, preserves existing work and settles inside its destination", () => {
  const movie = compileEssay(plan);
  const before = frameState(movie, 59);
  const during = frameState(movie, 90);
  const after = frameState(movie, 120);
  const item = (state: typeof before, id: string) =>
    state.items.find((i) => i.id === id)!;
  assert.equal(before.items.length, 2);
  assert.equal(during.items.length, 2);
  assert.equal(after.items.length, 2);
  assert.ok(item(during, "meetings").x > item(before, "meetings").x);
  assert.ok(item(during, "meetings").x < item(after, "meetings").x);
  for (const property of [
    "x",
    "y",
    "width",
    "height",
    "owner",
    "label",
  ] as const) {
    assert.equal(
      item(before, "migration")[property],
      item(after, "migration")[property],
    );
  }
  assert.ok(item(after, "migration").opacity >= 0.6);
  const group = after.groups.find((g) => g.id === "team")!;
  const target = item(after, "meetings");
  assert.ok(
    target.x >= group.x && target.x + target.width <= group.x + group.width,
  );
  assert.ok(
    target.y >= group.y && target.y + target.height <= group.y + group.height,
  );
});

test("scene replacement is atomic, keeps a fixed viewport and never carries old emphasis", () => {
  const movie = compileEssay(plan);
  assert.equal(frameState(movie, 239).sceneId, "handoff");
  const next = frameState(movie, 240);
  assert.equal(next.sceneId, "demands");
  assert.equal(next.groups.length, 1);
  assert.equal(next.items.length, 3);
  assert.equal(next.items.find((i) => i.id === "migration")!.color, "#EEA530");
  assert.ok(next.edges.every((e) => !e.active));
  assert.match(renderSvg(next), /viewBox="0 0 1920 1080"/);
  assert.doesNotMatch(renderSvg(next), /scale\(|translate\(/);
});

test("narration focus emphasizes the item without adding an ownership line", () => {
  const movie = compileEssay(plan);
  const a = frameState(movie, 140).items.find((e) => e.id === "meetings")!;
  assert.equal(a.color, "#D4D3D2");
  assert.equal(a.focused, true);
  assert.equal(
    frameState(movie, 210).items.find((e) => e.id === "meetings")!.focused,
    false,
  );
  assert.equal(frameState(movie, 140).edges.length, 0);
  assert.doesNotMatch(renderSvg(frameState(movie, 140)), /marker-end/);
});

test("every settled frame keeps labels and work inside the visual safe area without item overlap", () => {
  const movie = compileEssay(plan);
  for (const frame of [0, 59, 120, 239, 240, 419]) {
    const state = frameState(movie, frame);
    for (const item of state.items) {
      assert.ok(item.x >= 120 && item.x + item.width <= 1800);
      assert.ok(item.y >= 100 && item.y + item.height <= 790);
    }
    for (let i = 0; i < state.items.length; i++)
      for (const b of state.items.slice(i + 1)) {
        const a = state.items[i];
        assert.ok(
          a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y,
        );
      }
  }
});

test("invalid relationships and insufficient layout capacity fail before rendering", () => {
  const invalid = structuredClone(plan);
  invalid.scenes[0].items[0].owner = "missing";
  assert.throws(() => compileEssay(invalid), /owner/);
  const crowded = structuredClone(plan);
  crowded.scenes[0].groups[0].members = 30;
  assert.throws(() => compileEssay(crowded), /members/);
  const late = structuredClone(plan);
  late.scenes[0].transfers[0].end = 239;
  assert.throws(() => compileEssay(late), /settle/);
});

test("the transferred card never covers existing work while travelling", () => {
  const movie = compileEssay(plan);
  for (let frame = 60; frame <= 120; frame++) {
    const state = frameState(movie, frame);
    const a = state.items.find((i) => i.id === "migration")!;
    const b = state.items.find((i) => i.id === "meetings")!;
    assert.ok(
      a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y,
      `work obscured at ${frame}`,
    );
  }
});

test("people and work remain identifiable without visible containers or category headings", () => {
  const svg = renderSvg(frameState(compileEssay(plan), 0));
  assert.equal((svg.match(/data-person=/g) ?? []).length, 4);
  assert.equal((svg.match(/data-group=/g) ?? []).length, 2);
  assert.match(svg, /data-item="migration"/);
  assert.match(svg, /data-item="meetings"/);
  assert.doesNotMatch(
    svg,
    /<rect data-group=|<rect data-item=|>WORK<|>PROCESS</,
  );
});

test("single-team demands are a compact vertical list without item icons", () => {
  const state = frameState(compileEssay(plan), 250);
  assert.ok(state.items.every((i) => i.width <= 600 && i.height <= 120));
  assert.equal(new Set(state.items.map((i) => i.x)).size, 1);
  assert.ok(
    state.items[0].y < state.items[1].y && state.items[1].y < state.items[2].y,
  );
  for (const block of renderSvg(state).matchAll(
    /<g data-item="[^"]+">([\s\S]*?)<\/g>/g,
  ))
    assert.doesNotMatch(block[1], /<path|<circle|<rect/);
  assert.equal(state.edges.length, 0);
});

test("focus moves a dashed cursor without changing any text appearance or row position", () => {
  const data = structuredClone(plan);
  data.scenes[1].takeaways = [];
  data.scenes[1].topics = [
    { group: "team", item: "migration", start: 0, end: 90 },
    { group: "team", item: "bugs", start: 90, end: 150 },
  ];
  const movie = compileEssay(data);
  const first = frameState(movie, 280);
  const second = frameState(movie, 360);
  assert.equal(first.cursors.length, 1);
  assert.equal(second.cursors.length, 1);
  assert.ok(second.cursors[0].y > first.cursors[0].y);
  assert.equal(frameState(movie, 400).cursors.length, 0);
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(
      [first.items[i].x, first.items[i].y],
      [second.items[i].x, second.items[i].y],
    );
    assert.equal(first.items[i].opacity, 1);
    assert.equal(second.items[i].opacity, 1);
  }
  const svg = renderSvg(second);
  assert.match(svg, /data-cursor="bugs"/);
  assert.match(svg, /stroke-dasharray="6 6"/);
  assert.doesNotMatch(svg, /opacity=|font-weight="600"/);
});

test("actor relationships are bounded moving dashed strokes, not persistent connectors", () => {
  const data = structuredClone(plan);
  data.scenes[0].relationships = [
    { from: "leader", to: "team", start: 10, end: 50 },
  ];
  const movie = compileEssay(data);
  assert.equal(frameState(movie, 9).relationships.length, 0);
  const a = frameState(movie, 20).relationships[0];
  const b = frameState(movie, 30).relationships[0];
  assert.ok(a.x1 > 600 && a.x2 < 1250);
  assert.notEqual(a.dashOffset, b.dashOffset);
  assert.equal(frameState(movie, 50).relationships.length, 0);
  data.scenes[0].relationships[0].to = "missing";
  assert.throws(() => compileEssay(data), /relationship/);
});

test("kinetic sentence entrances settle without changing text color or opacity", () => {
  const data = structuredClone(plan);
  data.scenes[0].narration = [
    { text: "A complete thought.", startMs: 500, endMs: 2000 },
  ];
  data.scenes[0].textMotion = "rise";
  Object.assign(data.scenes[0], {
    groups: [],
    items: [],
    transfers: [],
    topics: [],
  });
  const movie = compileEssay(data);
  assert.equal(frameState(movie, 29).caption, "");
  assert.ok(
    frameState(movie, 30).captionOffset > frameState(movie, 40).captionOffset,
  );
  assert.ok(
    frameState(movie, 48).captionOffset > 0,
    "entrance continues past the old 0.3s duration",
  );
  assert.equal(
    frameState(movie, 57).captionOffset,
    0,
    "settles at 0.45s, 50% longer",
  );
  assert.equal(frameState(movie, 60).captionOffset, 0);
  assert.doesNotMatch(renderSvg(frameState(movie, 40)), /opacity=/);
});

test("explanatory visuals never render narration subtitles but text-only scenes do", () => {
  const data = structuredClone(plan);
  data.scenes[0].narration = [
    { text: "Narration accompanies the visual.", startMs: 0, endMs: 2000 },
  ];
  const state = frameState(compileEssay(data), 60);
  assert.equal(state.caption, "");
  assert.doesNotMatch(renderSvg(state), /Narration accompanies/);
  Object.assign(data.scenes[0], {
    groups: [],
    items: [],
    transfers: [],
    topics: [],
  });
  assert.match(
    renderSvg(frameState(compileEssay(data), 60)),
    /Narration accompanies/,
  );
});

test("all dashed cues move at 30% of the previous speed, continuously across seconds", () => {
  const data = structuredClone(plan);
  data.scenes[0].relationships = [
    { from: "leader", to: "team", start: 0, end: 240 },
  ];
  data.scenes[0].topics[0].connection = true;
  const movie = compileEssay(data);
  const a = frameState(movie, 140);
  const b = frameState(movie, 200);
  for (const key of ["relationships", "cursors", "edges"] as const) {
    assert.ok(
      Math.abs(a[key][0].dashOffset - b[key][0].dashOffset - 12.6) < 0.000001,
    );
  }
  assert.ok(
    Math.abs(
      frameState(movie, 60).relationships[0].dashOffset -
        frameState(movie, 59).relationships[0].dashOffset +
        0.21,
    ) < 0.000001,
  );
});

test("the entire CTA is gold on entry, including text wrapped across lines", () => {
  const data = structuredClone(plan);
  Object.assign(data.scenes[0], {
    groups: [],
    items: [],
    transfers: [],
    topics: [],
    narration: [
      {
        text: "What will you change to help your team finish the main quest before adding another side quest?",
        startMs: 0,
        endMs: 2000,
      },
    ],
    takeaways: [{ text: true, start: 0, end: 240 }],
    textMotion: "rise",
  });
  const svg = renderSvg(frameState(compileEssay(data), 0));
  const lines = [...svg.matchAll(/<text[^>]*>/g)].map((m) => m[0]);
  assert.ok(lines.length > 1);
  assert.ok(lines.every((line) => line.includes('fill="#EEA530"')));
});

test("a connection needs explicit narrative purpose and exists only for that interval", () => {
  const explicit = structuredClone(plan);
  explicit.scenes[0].topics[0].connection = true;
  const movie = compileEssay(explicit);
  assert.equal(frameState(movie, 119).edges.length, 0);
  assert.equal(frameState(movie, 140).edges.length, 1);
  assert.equal(frameState(movie, 210).edges.length, 0);
});

test("staged list entries reserve their rows, enter at their cue and settle without moving earlier rows", () => {
  const data = structuredClone(plan);
  data.scenes[1].items[1].revealAt = 60;
  const movie = compileEssay(data);
  assert.equal(
    frameState(movie, 299).items.find((i) => i.id === "bugs")!.visible,
    false,
  );
  const entering = frameState(movie, 300).items.find((i) => i.id === "bugs")!;
  const settled = frameState(movie, 330).items.find((i) => i.id === "bugs")!;
  assert.equal(entering.visible, true);
  assert.ok(entering.textOffset > 0);
  assert.equal(settled.textOffset, 0);
  assert.equal(entering.y, settled.y);
  assert.doesNotMatch(renderSvg(frameState(movie, 299)), /data-item="bugs"/);
});

test("a focus cursor stays attached to its item throughout a physical handoff", () => {
  const data = structuredClone(plan);
  data.scenes[0].topics = [
    { group: "leader", item: "meetings", start: 0, end: 240 },
  ];
  const movie = compileEssay(data);
  for (let f = 0; f < 240; f++) {
    const state = frameState(movie, f),
      item = state.items.find((i) => i.id === "meetings")!;
    const cursor = state.cursors.find((c) => c.item === "meetings");
    assert.ok(cursor, `missing focus at ${f}`);
    assert.equal(cursor.x, item.x - 24);
    assert.equal(cursor.y, item.y + 24);
  }
});
