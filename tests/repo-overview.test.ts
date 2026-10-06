import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { buildMovie } from "../src/RepoOverview/plan.ts";
import { SEGMENTS } from "../src/RepoOverview/script.ts";
import { NARRATION, AUDIO_REQUEST } from "../src/RepoOverview/audio.ts";
import { frameState, renderSvg } from "../src/lib/essay-sdk/index.ts";

const beats = Object.fromEntries(
  SEGMENTS.map((s) => {
    const words = s.sentences
      .join(" ")
      .split(/\s+/)
      .map((text, i) => ({ text, startMs: i * 500, endMs: i * 500 + 400 }));
    return [s.id, { words, durationFrames: words.length * 15 + 30 }];
  }),
);

test("overview explains both entry points, one Remotion sentence, skills and the documentation experiment", () => {
  assert.equal(SEGMENTS.length, 7);
  assert.equal(SEGMENTS.find((s) => s.id === "remotion")!.sentences.length, 1);
  assert.equal(NARRATION.modelId, "eleven_v4");
  assert.equal(AUDIO_REQUEST.voice_settings.speed, 0.92);
  assert.equal(
    (AUDIO_REQUEST.text.match(/pause for 1.25 seconds/g) ?? []).length,
    6,
  );
  const movie = buildMovie(beats);
  assert.equal(movie.fps, 30);
  assert.equal(movie.audio!.duration, movie.duration);
  for (const s of movie.scenes) {
    assert.equal(s.audio, undefined);
    if (!["remotion", "invitation"].includes(s.id))
      assert.ok(s.groups.length || s.visuals?.length);
    for (const v of s.visuals ?? [])
      if (v.kind === "process") {
        for (const [i, m] of v.moves.entries())
          assert.ok(
            (v.moves[i + 1]?.start ?? s.duration) - m.end >= 15,
            "moves settle before the next action",
          );
      }
  }
  assert.equal(movie.scenes.flatMap(s => s.narration.map(w => w.text)).join(" "), SEGMENTS.flatMap(s => s.sentences).join(" "));
  const intro = movie.scenes[0];
  assert.equal(intro.transfers[0].to, "viewer");
  assert.ok(intro.duration - intro.transfers[0].end >= 15);
  const fullSvg = movie.scenes
    .flatMap((s) =>
      (s.visuals?.map((v) => v.end - 2) ?? [s.duration - 2]).map((f) =>
        renderSvg(frameState(movie, s.from + f)),
      ),
    )
    .join("");
  for (const skill of [
    "generate-video-essay",
    "generate-essay-audio",
    "animate-recorded-audio",
  ])
    assert.ok(fullSvg.includes(skill), skill);
  assert.match(SEGMENTS[0].sentences[0], /^You /);
  assert.equal(intro.groups[0].label, "You");
  assert.equal(intro.items[0].label, "Your idea");
  assert.ok(!SEGMENTS.some(s => s.id === "support"));
  assert.equal((SEGMENTS.flatMap(s => s.sentences).join(" ").match(/Remotion/g) ?? []).length, 1);
  assert.ok(!fullSvg.includes("remotion-create") && !fullSvg.includes("remotion-render"));
  const experiment = SEGMENTS.find(s => s.id === "experiment")!.sentences.join(" ");
  assert.match(experiment, /This video was made/);
  assert.match(experiment, /custom-built Animation SDK/);
  assert.match(experiment, /ElevenLabs for a high-quality, natural-sounding voiceover/);
  assert.ok(!SEGMENTS.flatMap(s => s.sentences).join(' ').match(/part (two|2)/i));
  assert.ok(fullSvg.includes('ElevenLabs'), 'voiceover provider is also visible');
  const closing = movie.scenes[movie.scenes.length - 1];
  assert.equal(closing.textStyle, "italic");
  assert.deepEqual(closing.takeaways, [
    { text: true, start: 0, end: closing.duration },
  ]);
});

test("missing or changed narration cannot silently miscue the video", () => {
  assert.throws(() => buildMovie({}), /Missing narration/);
  const altered = structuredClone(beats);
  altered.essay.words[0].text = "Changed";
  assert.throws(() => buildMovie(altered), /Script mismatch/);
});

test("the stress test leaves every SDK source file unchanged", () => {
  const hashes = JSON.parse(
    readFileSync("src/RepoOverview/sdk-baseline.json", "utf8"),
  );
  for (const [path, hash] of Object.entries(hashes))
    assert.equal(
      createHash("sha256").update(readFileSync(path)).digest("hex"),
      hash,
      path,
    );
});

test("real narration covers one continuous movie and gives each action time to settle", async () => {
  const { movie } = await import("../src/RepoOverview/production.ts");
  const raw = JSON.parse(
    readFileSync(
      "public/voiceover/DocsAnimationPart1-take4/narration.json",
      "utf8",
    ),
  );
  assert.equal(movie.duration, Math.ceil((raw.durationMs * 30) / 1000));
  let end = 0;
  for (const s of movie.scenes) {
    assert.equal(s.from, end);
    end += s.duration;
    assert.ok(s.narration[s.narration.length - 1].endMs <= (s.duration * 1000) / 30);
    for (const v of s.visuals ?? [])
      if (v.kind === "process")
        for (const [i, m] of v.moves.entries())
          assert.ok(
            (v.moves[i + 1]?.start ?? v.end) - m.end >= 15,
            `${s.id} motion settles`,
          );
  }
});


test("opening lists the narrated features under You without interrupting the handoff", () => {
  const movie = buildMovie(beats);
  const features = movie.scenes.find(s => s.id === "opening-features");
  assert.ok(features, "the continuing first screen needs the narrated feature list");
  const previous = frameState(movie, features.from - 1);
  const next = frameState(movie, features.from);
  const ideaBefore = previous.items.find(i => i.id === "idea")!;
  const ideaAfter = next.items.find(i => i.id === "idea")!;
  assert.deepEqual([ideaAfter.x,ideaAfter.y,ideaAfter.owner],[ideaBefore.x,ideaBefore.y,ideaBefore.owner],"audience keeps the idea without a jump");
  for (const [id,label,word] of [["explanations","Explanations","explanations"],["videos","Videos","videos,"],["narration","Narration and diagrams","narration"]]) {
    const item = features.items.find(i => i.id === id)!;
    assert.ok(item, label);
    assert.equal(item.owner,"author");
    assert.equal(item.label,label);
    const at = Math.round(features.narration.find(w => w.text === word)!.startMs * 30 / 1000);
    assert.equal(item.revealAt,at);
    assert.equal(frameState(movie,features.from+at-1).items.find(i=>i.id===id)!.visible,false);
    const visible = frameState(movie,features.from+at).items.find(i=>i.id===id)!;
    assert.ok(visible.visible && visible.focused, "reveal and focus follow the spoken cue");
  }
  const end = frameState(movie,features.from+features.duration-1);
  assert.equal(end.items.filter(i=>i.owner==='author' && i.visible).length,3);
});
