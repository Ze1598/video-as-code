import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// scripts/generate-voiceover.ts is the ONE deterministic voiceover script
// (see the skill's "Audio & timing pipeline") — it takes a video name and
// reads that video's own SLIDES from src/<VideoName>/script.ts, rather than
// being a separate hand-written script per video. This exercises the real
// CLI end to end: argv handling, the dynamic per-video import, and the
// real generateVoiceover() wiring (mocked network, same technique as
// tests/elevenlabs-wiring.test.ts) without spending money.

const REPO_ROOT = join(import.meta.dirname, "..");
const SCRIPT = join(REPO_ROOT, "scripts", "generate-voiceover.ts");

test("generate-voiceover.ts: exits non-zero with no video name argument", () => {
  assert.throws(() => execFileSync("node", ["--experimental-strip-types", SCRIPT], { stdio: "pipe" }));
});

test("generate-voiceover.ts: reads SLIDES from src/<VideoName>/script.ts and calls generateVoiceover correctly", async () => {
  // A throwaway fixture video under the REAL src/ tree — the CLI's dynamic
  // import path is relative to the script's own location, not the test's
  // cwd, so this can't be redirected to a tmpdir the way other tests'
  // fixtures are. Never point this at a real video name: with fetch
  // mocked, generateVoiceover still WRITES real files to
  // public/voiceover/<VideoName>/, which would corrupt a real video's
  // actual ElevenLabs audio/timing data if this ran against it.
  const FIXTURE_VIDEO = "GenerateVoiceoverCliFixture";
  const fixtureSrcDir = join(REPO_ROOT, "src", FIXTURE_VIDEO);
  const fixtureOutDir = join(REPO_ROOT, "public", "voiceover", FIXTURE_VIDEO);

  mkdirSync(fixtureSrcDir, { recursive: true });
  writeFileSync(
    join(fixtureSrcDir, "script.ts"),
    `export const SLIDES = [{ id: "beat-00", text: "Fixture line." }];\n`,
  );

  const originalFetch = global.fetch;
  const originalArgv = process.argv;
  let captured: { url: string; body: { text: string } } | null = null;

  global.fetch = (async (url: string, opts: RequestInit) => {
    const body = JSON.parse(String(opts.body));
    captured = { url, body };
    const characters = body.text.split("");
    const character_start_times_seconds = characters.map((_: string, i: number) => i * 0.1);
    const character_end_times_seconds = characters.map((_: string, i: number) => (i + 1) * 0.1);
    const alignment = { characters, character_start_times_seconds, character_end_times_seconds };
    return {
      ok: true,
      json: async () => ({
        audio_base64: Buffer.from("fake-mp3").toString("base64"),
        alignment,
        normalized_alignment: alignment,
      }),
    };
  }) as typeof fetch;

  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  process.argv = [originalArgv[0], SCRIPT, FIXTURE_VIDEO];

  try {
    await import(`../scripts/generate-voiceover.ts?fixture=${Date.now()}`);

    const result = captured as { url: string; body: { text: string } } | null;
    assert.ok(result, "expected the mocked fetch to have been called");
    assert.equal(result.body.text, "Fixture line.");
    assert.ok(statSync(join(fixtureOutDir, "beat-00.mp3")).size > 0);
    const json = JSON.parse(readFileSync(join(fixtureOutDir, "beat-00.json"), "utf8"));
    assert.equal(json.text, "Fixture line.");
  } finally {
    global.fetch = originalFetch;
    process.argv = originalArgv;
    rmSync(fixtureSrcDir, { recursive: true, force: true });
    rmSync(fixtureOutDir, { recursive: true, force: true });
  }
});
