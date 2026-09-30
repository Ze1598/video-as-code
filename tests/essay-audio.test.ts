import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { buildEssayAudioRequest, generateEssayAudio, partitionNarration, prepareEssayAudio } from "../scripts/lib/essay-audio.ts";

const narration = {
  modelId: "eleven_v4" as const,
  voiceSettings: { stability: 0.35, similarity_boost: 0.75, style: 0.45, speed: 0.92 },
  pausePlan: { internalSentenceMs: 250, laterSceneLeadMs: 500, sceneHoldMs: 750, finalHoldMs: 750, phrasingBpm: 92 },
  segments: [
    { id: "beat-00", direction: "Warm, conversational voice, measured delivery", sentences: ["First thought.", "Next thought."] },
    { id: "beat-01", direction: "Softening, reflective", sentences: ["Last thought."] },
  ],
};
const words = [
  { text: "First", startMs: 0, endMs: 200 }, { text: "thought.", startMs: 200, endMs: 400 },
  { text: "Next", startMs: 400, endMs: 600 }, { text: "thought.", startMs: 600, endMs: 800 },
  { text: "Last", startMs: 800, endMs: 1000 }, { text: "thought.", startMs: 1000, endMs: 1200 },
];

test("full essay request encodes internal and scene pauses without changing spoken words", () => {
  const request = buildEssayAudioRequest(narration);
  assert.equal(request.model_id, "eleven_v4");
  assert.equal(request.text, "[Warm, conversational voice, measured delivery] First thought. [pause for 0.25 seconds] Next thought.\n\n[pause for 1.25 seconds]\n\n[Softening, reflective] Last thought. [pause for 0.75 seconds]");
  assert.equal(request.text.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim(), "First thought. Next thought. Last thought.");
  assert.throws(() => buildEssayAudioRequest({ ...narration, segments: [...narration.segments, narration.segments[0]] }), /Duplicate/);
  assert.throws(() => buildEssayAudioRequest({ ...narration, segments: [{ id: "bad", sentences: ["[excited] New words."] }] }), /spoken/);
  assert.throws(() => buildEssayAudioRequest({ ...narration, segments: [{ id: "bad", sentences: ["First thought. Next thought."] }] }), /sentence/);
  assert.throws(() => buildEssayAudioRequest({ ...narration, pausePlan: undefined } as unknown as typeof narration), /complete pause plan/);
});

test("partitioning uses approved words in order and fails instead of guessing scene boundaries", () => {
  const result = partitionNarration(narration, words, 1300);
  assert.deepEqual(result.map((segment) => [segment.startMs, segment.endMs]), [[0, 800], [800, 1300]]);
  assert.deepEqual(result[1].words.map((word) => word.startMs), [0, 200]);
  assert.throws(() => partitionNarration(narration, words.slice(1), 1300), /match/);
  assert.throws(() => partitionNarration(narration, words.map((word) => ({ ...word, startMs: NaN })), 1300), /timing/);
});

test("generation makes one call, retains raw output and records request without secrets", async () => {
  const dir = mkdtempSync(join(tmpdir(), "essay-audio-request-"));
  const originalFetch = global.fetch;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  process.env.ELEVENLABS_API_KEY = "secret-test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  let calls = 0;
  global.fetch = (async (_url, options) => {
    calls++;
    const text = JSON.parse(String(options?.body)).text;
    assert.equal(text, buildEssayAudioRequest(narration).text);
    const characters = text.split("");
    const alignment = {
      characters,
      character_start_times_seconds: characters.map((_: string, i: number) => i / 10),
      character_end_times_seconds: characters.map((_: string, i: number) => (i + 1) / 10),
    };
    return new Response(JSON.stringify({ audio_base64: Buffer.from("fixture").toString("base64"), alignment, normalized_alignment: alignment }));
  }) as typeof fetch;
  try {
    const outDir = join(dir, "raw");
    await generateEssayAudio(narration, outDir);
    assert.equal(calls, 1);
    assert.equal(readFileSync(join(outDir, "narration.mp3"), "utf8"), "fixture");
    const request = readFileSync(join(outDir, "request.json"), "utf8");
    assert.ok(!request.includes("secret-test-key"));
    assert.equal(JSON.parse(request).body.model_id, "eleven_v4");
    await assert.rejects(() => generateEssayAudio(narration, outDir), /exists/);
    assert.equal(calls, 1);
  } finally {
    global.fetch = originalFetch;
    if (apiKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = apiKey;
    if (voiceId === undefined) delete process.env.ELEVENLABS_VOICE_ID; else process.env.ELEVENLABS_VOICE_ID = voiceId;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("offline preparation preserves opening and inserts real 250ms/500ms silence with matching timings", () => {
  const dir = mkdtempSync(join(tmpdir(), "essay-audio-render-"));
  try {
    const source = join(dir, "source.wav");
    const made = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=24000:duration=1.3", source]);
    assert.equal(made.status, 0, made.stderr.toString());
    const timing = join(dir, "timing.json");
    writeFileSync(timing, JSON.stringify({ words, durationMs: 1300 }));
    const outDir = join(dir, "paced");
    prepareEssayAudio(narration, source, timing, outDir);
    const first = JSON.parse(readFileSync(join(outDir, "beat-00.json"), "utf8"));
    const last = JSON.parse(readFileSync(join(outDir, "beat-01.json"), "utf8"));
    assert.equal(first.words[0].startMs, 0);
    assert.equal(first.words[2].startMs, 650);
    assert.equal(first.durationMs, 1050);
    assert.equal(last.words[0].startMs, 500);
    assert.equal(last.durationMs, 1000);
    for (const [id, silentStart, silentEnd, audibleStart] of [["beat-00", 0.44, 0.61, 0.05], ["beat-01", 0.05, 0.45, 0.6]] as const) {
      const decoded = spawnSync("ffmpeg", ["-v", "error", "-i", join(outDir, `${id}.mp3`), "-f", "f32le", "-ac", "1", "-ar", "24000", "pipe:1"]);
      assert.equal(decoded.status, 0, decoded.stderr.toString());
      const samples = decoded.stdout;
      const peak = (start: number, end: number) => {
        let value = 0;
        for (let i = Math.round(start * 24000); i < Math.round(end * 24000); i++) value = Math.max(value, Math.abs(samples.readFloatLE(i * 4)));
        return value;
      };
      assert.ok(peak(silentStart, silentEnd) < 0.001, `${id}: expected actual silence`);
      assert.ok(peak(audibleStart, audibleStart + 0.1) > 0.05, `${id}: expected retained source signal`);
    }
    assert.throws(() => prepareEssayAudio(narration, source, timing, outDir), /exists/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
