import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Runs the real CLI as a subprocess with a controlled cwd — exactly how a
// video session invokes it — against freshly-written fixture JSON (not
// pre-existing repo data), so this doesn't silently pass just because
// src/HowToBeUnderstood/data.ts already happens to be correct.

const REPO_ROOT = join(import.meta.dirname, "..");
const SCRIPT = join(REPO_ROOT, "scripts", "build-timing-data.ts");

function makeFixtureCwd(): string {
  const cwd = mkdtempSync(join(tmpdir(), "build-timing-data-"));
  const voiceoverDir = join(cwd, "public", "voiceover", "MockVideo");
  mkdirSync(voiceoverDir, { recursive: true });
  mkdirSync(join(cwd, "src", "MockVideo"), { recursive: true });

  writeFileSync(
    join(voiceoverDir, "beat-00.json"),
    JSON.stringify({
      text: "Hi there.",
      durationMs: 850,
      words: [
        { text: "Hi", startMs: 0, endMs: 200 },
        { text: 'she said "there."', startMs: 250, endMs: 850 },
      ],
    }),
  );
  writeFileSync(
    join(voiceoverDir, "beat-01.json"),
    JSON.stringify({
      text: "Second beat.",
      durationMs: 500,
      words: [{ text: "Second", startMs: 0, endMs: 250 }, { text: "beat.", startMs: 260, endMs: 500 }],
    }),
  );

  return cwd;
}

test("build-timing-data.ts: builds a correctly structured data.ts from fresh beat JSON", () => {
  const cwd = makeFixtureCwd();
  try {
    execFileSync("node", ["--experimental-strip-types", SCRIPT, "MockVideo"], { cwd, stdio: "pipe" });

    const dataTs = readFileSync(join(cwd, "src", "MockVideo", "data.ts"), "utf8");
    assert.match(dataTs, /export const BEATS: Record<string, Beat> = \{/);
    assert.match(dataTs, /"beat-00":\s*\{/);
    assert.match(dataTs, /"beat-01":\s*\{/);
    assert.match(dataTs, /durationMs: 850/);
    assert.match(dataTs, /text: "Hi"/);
    // Embedded double quotes in real spoken text must be escaped, not corrupt the file.
    assert.match(dataTs, /text: "she said \\"there\.\\""/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("build-timing-data.ts: exits non-zero with no arguments", () => {
  assert.throws(() =>
    execFileSync("node", ["--experimental-strip-types", SCRIPT], { stdio: "pipe" }),
  );
});

test("build-timing-data.ts: exits non-zero when the voiceover directory doesn't exist", () => {
  const cwd = mkdtempSync(join(tmpdir(), "build-timing-data-missing-"));
  try {
    assert.throws(() =>
      execFileSync("node", ["--experimental-strip-types", SCRIPT, "NoSuchVideo"], { cwd, stdio: "pipe" }),
    );
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
