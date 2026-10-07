import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { SEGMENTS } from "../src/DocsAnimationPart2/script.ts";
import { buildMovie } from "../src/DocsAnimationPart2/plan.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";
const beats = Object.fromEntries(
  SEGMENTS.map((s) => ({
    id: s.id,
    words: s.sentences
      .join(" ")
      .split(/\s+/)
      .map((text, i) => ({ text, startMs: i * 500, endMs: i * 500 + 400 })),
  })).map((s) => [
    s.id,
    { words: s.words, durationFrames: s.words.length * 15 + 30 },
  ]),
);
const movie = () => buildMovie(beats);

test("the complete four-stage macro appears first and stays spatially identical in each chapter reminder", () => {
  const m = movie();
  const macro = m.scenes[0].visuals![0];
  assert.equal(m.scenes[0].id, "overview");
  assert.equal(macro.kind, "process");
  if (macro.kind !== "process") throw Error("Expected macro process");
  assert.deepEqual(
    macro.stages.map((s) => s.label),
    ["Source material", "Understand", "Plan & approve", "Produce & deliver"],
  );
  assert.ok(macro.stages.every((s) => s.at === 0));
  assert.deepEqual(
    macro.moves.map((m) => m.to),
    ["understand", "plan", "produce"],
  );
  for (const [id, initial] of [
    ["source", "source"],
    ["understand", "understand"],
    ["planning", "plan"],
    ["produce", "produce"],
  ]) {
    const s = m.scenes.find((s) => s.id === id)!;
    const v = s.visuals![0];
    assert.equal(v.kind, "process");
    if (v.kind !== "process") throw Error("Expected process");
    assert.deepEqual(v.stages, macro.stages);
    assert.equal(v.initial, initial);
    assert.equal(v.end, s.visuals![1].start);
  }
});

test("the explanation separates inputs, approval, SDK responsibilities, setup and delivery without an outro", () => {
  const m = movie();
  assert.equal(
    m.scenes.map((s) => s.narration.map((w) => w.text).join(" ")).join(" "),
    SEGMENTS.flatMap((s) => s.sentences).join(" "),
  );
  assert.ok(
    m.scenes.findIndex((s) => s.id === "approval") <
      m.scenes.findIndex((s) => s.id === "produce"),
  );
  assert.equal(m.scenes[m.scenes.length - 1].id, "delivery");
  assert.ok(m.scenes.every((s) => s.groups.length || s.visuals?.length));
  assert.ok(
    m.scenes.every((s) => s.textStyle !== "italic" && s.audio === undefined),
  );
  const svg = m.scenes
    .flatMap((s) =>
      (s.visuals?.map((v) => v.end - 2) ?? [s.duration - 2]).map((f) =>
        renderSvg(frameState(m, s.from + f)),
      ),
    )
    .join("");
  for (const label of [
    "npm install",
    "generate-video-essay",
    "animate-recorded-audio",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
    "TypeScript plan",
    "SVG visuals",
    ".agents/skills",
    "src/lib/essay-sdk",
    "npm run dev",
    "npx remotion render",
    "Delivered MP4",
  ])
    assert.ok(svg.includes(label), label);
  assert.equal(m.audio!.duration, m.duration);
});

test("SDK and prior media stay unchanged", () => {
  const hashes = JSON.parse(
    readFileSync("src/DocsAnimationPart2/sdk-baseline.json", "utf8"),
  );
  for (const [p, h] of Object.entries(hashes))
    assert.equal(
      createHash("sha256").update(readFileSync(p)).digest("hex"),
      h,
      p,
    );
});

test("production refuses a missing or changed narration", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const altered = structuredClone(beats);
  altered.source.words[0].text = "Wrong";
  assert.throws(() => buildMovie(altered), /Script mismatch/);
});

test("real narration covers one continuous track and leaves readable settled states", async () => {
  const { movie: m } = await import("../src/DocsAnimationPart2/production.ts");
  const raw = JSON.parse(
    readFileSync(
      "public/voiceover/DocsAnimationPart2-take1/narration.json",
      "utf8",
    ),
  );
  assert.equal(m.duration, Math.ceil((raw.durationMs * 30) / 1000));
  let end = 0;
  for (const s of m.scenes) {
    assert.equal(s.from, end);
    end += s.duration;
    assert.ok(
      s.narration[s.narration.length - 1].endMs <= (s.duration * 1000) / 30,
    );
    for (const v of s.visuals ?? [])
      if (v.kind === "process")
        for (const [i, move] of v.moves.entries()) {
          assert.ok(
            move.end - move.start >= 9,
            `${s.id}: movement lasts at least 0.3 seconds`,
          );
          assert.ok(
            (v.moves[i + 1]?.start ?? v.end) - move.end >= 15,
            `${s.id}: movement settles`,
          );
        }
    for (const t of s.transfers) assert.ok(s.duration - t.end >= 15);
  }
});
