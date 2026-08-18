import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_MODEL_ID, DEFAULT_VOICE_SETTINGS, generateVoiceover } from "../scripts/lib/elevenlabs.ts";

// TWO REAL, PAID ELEVENLABS API CALLS. Skipped by default — never run
// without explicit opt-in, and never run these without the user's
// go-ahead for that specific run (see CLAUDE.md: always ask before a paid
// API call).
//
// To run:
//   npm run test:live
// (requires ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID in .env)
//
// These re-verify the one thing tests/elevenlabs-wiring.test.ts can't: that
// the real ElevenLabs `with-timestamps` response shape still matches what
// deriveWordTimings() expects, and that the configured credentials/voice
// are actually valid. Costs a few seconds of TTS each run.

const LIVE = Boolean(process.env.RUN_LIVE_ELEVENLABS_TESTS);

test(
  "live: generateVoiceover produces valid audio + timing for a real single-sentence call",
  { skip: !LIVE },
  async () => {
    const outDir = mkdtempSync(join(tmpdir(), "elevenlabs-live-1-"));
    try {
      await generateVoiceover({
        outDir,
        slides: [{ id: "beat-00", text: "This is a live regression test of the voiceover pipeline." }],
      });

      const mp3Size = statSync(join(outDir, "beat-00.mp3")).size;
      assert.ok(mp3Size > 1000, `expected a real mp3, got ${mp3Size} bytes`);

      const json = JSON.parse(readFileSync(join(outDir, "beat-00.json"), "utf8"));
      assert.ok(json.words.length >= 5, `expected several real words, got ${json.words.length}`);
      assert.ok(json.durationMs > 0);
      for (const w of json.words) {
        assert.ok(w.endMs > w.startMs, `word "${w.text}" has non-positive duration`);
      }
      // Words should be in non-decreasing time order — a real regression
      // would show up as garbled/out-of-order timestamps.
      for (let i = 1; i < json.words.length; i++) {
        assert.ok(
          json.words[i].startMs >= json.words[i - 1].startMs,
          `word "${json.words[i].text}" starts before the previous word ends`,
        );
      }
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  },
);

test(
  "live: generateVoiceover respects overrides and derives multi-sentence timing correctly",
  { skip: !LIVE },
  async () => {
    const outDir = mkdtempSync(join(tmpdir(), "elevenlabs-live-2-"));
    try {
      await generateVoiceover({
        outDir,
        slides: [{ id: "beat-00", text: "This is sentence one. This is sentence two." }],
        voiceSettings: { ...DEFAULT_VOICE_SETTINGS, stability: 0.5 },
        modelId: DEFAULT_MODEL_ID,
      });

      const json = JSON.parse(readFileSync(join(outDir, "beat-00.json"), "utf8"));
      const sentenceEndWords = json.words.filter((w: { text: string }) => /[.?!]$/.test(w.text));
      assert.ok(
        sentenceEndWords.length >= 2,
        `expected at least 2 sentence-ending words, got ${sentenceEndWords.length}`,
      );

      // No stray tag-artifact characters should ever appear in derived
      // words (see the eleven_v3 <break> tag investigation in SKILL.md) —
      // this model/path doesn't use tags, but the filter-for-cleanliness
      // property should hold regardless.
      for (const w of json.words) {
        assert.ok(!/[<>=]/.test(w.text), `word "${w.text}" contains a suspicious tag-like character`);
      }
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  },
);
