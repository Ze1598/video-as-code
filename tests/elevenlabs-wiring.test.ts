import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_MODEL_ID,
  DEFAULT_VOICE_SETTINGS,
  generateVoiceover,
  type VoiceSettings,
} from "../scripts/lib/elevenlabs.ts";

type RequestBody = { text: string; model_id: string; voice_settings: VoiceSettings };
type Captured = { url: string; body: RequestBody };

// Exercises the REAL generateVoiceover() function against a mocked network
// response — proves the wiring (request shape, env var handling, word-
// timing derivation, file writes) without spending money or requiring
// credentials. Does NOT re-verify the live ElevenLabs API contract itself
// (see tests/elevenlabs-live.test.ts, optional and paid, for that).

function fakeAlignmentFor(text: string) {
  const characters = text.split("");
  const character_start_times_seconds: number[] = [];
  const character_end_times_seconds: number[] = [];
  let t = 0;
  for (const c of characters) {
    character_start_times_seconds.push(t);
    t += /\s/.test(c) ? 0.05 : 0.1;
    character_end_times_seconds.push(t);
  }
  return { characters, character_start_times_seconds, character_end_times_seconds };
}

async function withMockedFetch<T>(fn: () => Promise<T>): Promise<{ result: T; captured: Captured | null }> {
  const originalFetch = global.fetch;
  let captured: Captured | null = null;
  global.fetch = (async (url: string, opts: RequestInit) => {
    const body = JSON.parse(String(opts.body)) as RequestBody;
    captured = { url, body };
    const alignment = fakeAlignmentFor(body.text);
    return {
      ok: true,
      json: async () => ({
        audio_base64: Buffer.from("fake-mp3").toString("base64"),
        alignment,
        normalized_alignment: alignment,
      }),
    };
  }) as typeof fetch;

  try {
    const result = await fn();
    return { result, captured };
  } finally {
    global.fetch = originalFetch;
  }
}

async function withEnv<T>(vars: Record<string, string | undefined>, fn: () => Promise<T>): Promise<T> {
  const originals: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) originals[key] = process.env[key];
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("generateVoiceover: correct request shape, word derivation, and file writes", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "elevenlabs-wiring-"));

  try {
    const { captured } = await withEnv(
      { ELEVENLABS_API_KEY: "test-key", ELEVENLABS_VOICE_ID: "test-voice" },
      () => withMockedFetch(() => generateVoiceover({ outDir, slides: [{ id: "beat-00", text: "Hi there." }] })),
    );

    assert.ok(captured, "expected the mocked fetch to have been called");
    assert.equal(captured.url, "https://api.elevenlabs.io/v1/text-to-speech/test-voice/with-timestamps");
    assert.equal(captured.body.model_id, DEFAULT_MODEL_ID);
    assert.deepEqual(captured.body.voice_settings, DEFAULT_VOICE_SETTINGS);

    const json = JSON.parse(readFileSync(join(outDir, "beat-00.json"), "utf8"));
    assert.equal(json.text, "Hi there.");
    assert.equal(json.words.length, 2);
    assert.equal(json.words[0].text, "Hi");
    assert.equal(json.words[1].text, "there.");
    assert.ok(json.durationMs > 0);

    assert.ok(statSync(join(outDir, "beat-00.mp3")).size > 0);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("generateVoiceover: forwards custom voiceSettings/modelId overrides", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "elevenlabs-wiring-override-"));
  const customSettings = { stability: 0.5, similarity_boost: 0.9, style: 0.1, speed: 1.0 };

  try {
    const { captured } = await withEnv(
      { ELEVENLABS_API_KEY: "test-key", ELEVENLABS_VOICE_ID: "test-voice" },
      () =>
        withMockedFetch(() =>
          generateVoiceover({
            outDir,
            slides: [{ id: "beat-00", text: "Custom." }],
            voiceSettings: customSettings,
            modelId: "eleven_v3",
          }),
        ),
    );

    assert.ok(captured, "expected the mocked fetch to have been called");
    assert.equal(captured.body.model_id, "eleven_v3");
    assert.deepEqual(captured.body.voice_settings, customSettings);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("generateVoiceover: throws a clear error when ELEVENLABS_API_KEY is missing", async () => {
  await withEnv({ ELEVENLABS_API_KEY: undefined, ELEVENLABS_VOICE_ID: "test-voice" }, () =>
    assert.rejects(
      () => generateVoiceover({ outDir: "/tmp/unused", slides: [] }),
      /ELEVENLABS_API_KEY is not set/,
    ),
  );
});

test("generateVoiceover: throws a clear error when ELEVENLABS_VOICE_ID is missing", async () => {
  await withEnv({ ELEVENLABS_API_KEY: "test-key", ELEVENLABS_VOICE_ID: undefined }, () =>
    assert.rejects(
      () => generateVoiceover({ outDir: "/tmp/unused", slides: [] }),
      /ELEVENLABS_VOICE_ID is not set/,
    ),
  );
});
