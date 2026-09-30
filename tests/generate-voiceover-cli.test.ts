import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// CLI coverage for explicitly selected legacy generation and full-essay
// requests. All network calls are mocked; fixtures use separate output paths.

const REPO_ROOT = join(import.meta.dirname, "..");
const SCRIPT = join(REPO_ROOT, "scripts", "generate-voiceover.ts");

test("generate-voiceover.ts: exits non-zero with no video name argument", () => {
  assert.throws(() => execFileSync("node", ["--experimental-strip-types", SCRIPT], { stdio: "pipe" }));
});

test("generate-voiceover.ts: previews per-video request code for free and generates the whole essay once", async () => {
  const videoName = "GenerateFullEssayCliFixture";
  const sourceDir = join(REPO_ROOT, "src", videoName);
  const outDir = join(REPO_ROOT, "public", "voiceover", `${videoName}-raw`);
  assert.ok(!existsSync(sourceDir) && !existsSync(outDir), "fixture paths must be unused");
  mkdirSync(sourceDir);
  writeFileSync(join(sourceDir, "audio.ts"), `export const NARRATION = {
    modelId: "eleven_v4",
    voiceSettings: { stability: 0.35, similarity_boost: 0.75, style: 0.45, speed: 0.92 },
    pausePlan: { internalSentenceMs: 250, laterSceneLeadMs: 500, sceneHoldMs: 750, finalHoldMs: 750, phrasingBpm: 92 },
    segments: [
      { id: "beat-00", direction: "Warm, conversational", sentences: ["First thought.", "Next thought."] },
      { id: "beat-01", direction: "Reflective", sentences: ["Last thought."] }
    ]
  };`);
  const originalFetch = global.fetch;
  const originalArgv = process.argv;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  let calls = 0;
  try {
    const previewEnv = { ...process.env };
    delete previewEnv.ELEVENLABS_API_KEY;
    delete previewEnv.ELEVENLABS_VOICE_ID;
    const preview = JSON.parse(execFileSync("node", ["--experimental-strip-types", SCRIPT, videoName, "--preview"], { encoding: "utf8", env: previewEnv }));
    assert.equal(preview.model_id, "eleven_v4");
    assert.equal(preview.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim(), "First thought. Next thought. Last thought.");
    assert.ok(!existsSync(outDir), "preview must not create generation output");
    process.env.ELEVENLABS_API_KEY = "test-key";
    process.env.ELEVENLABS_VOICE_ID = "test-voice";
    global.fetch = (async (_url, options) => {
      calls++;
      assert.deepEqual(JSON.parse(String(options?.body)), preview);
      const text = "First thought. Next thought. Last thought.";
      const characters = text.split("");
      const alignment = {
        characters,
        character_start_times_seconds: characters.map((_, index) => index / 10),
        character_end_times_seconds: characters.map((_, index) => (index + 1) / 10),
      };
      return new Response(JSON.stringify({ audio_base64: Buffer.from("fixture-audio").toString("base64"), alignment, normalized_alignment: alignment }));
    }) as typeof fetch;
    process.argv = [originalArgv[0], SCRIPT, videoName];
    await import(`../scripts/generate-voiceover.ts?full=${Date.now()}`);
    assert.equal(calls, 1);
    assert.equal(JSON.parse(readFileSync(join(outDir, "request.json"), "utf8")).body.text, preview.text);
    assert.ok(statSync(join(outDir, "narration.mp3")).size > 0);
  } finally {
    global.fetch = originalFetch;
    process.argv = originalArgv;
    if (apiKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = apiKey;
    if (voiceId === undefined) delete process.env.ELEVENLABS_VOICE_ID; else process.env.ELEVENLABS_VOICE_ID = voiceId;
    rmSync(sourceDir, { recursive: true, force: true });
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("generate-voiceover.ts: explicit legacy mode reads SLIDES and calls generateVoiceover correctly", async () => {
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
  process.argv = [originalArgv[0], SCRIPT, FIXTURE_VIDEO, "--legacy-beats"];

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
