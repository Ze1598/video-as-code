import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Slow (real Remotion bundling, ~15-30s) — the standing smoke test for
// src/lib itself. tsc/eslint can't catch a runtime-only error (a bad
// frameOfWord cue, a missing word in synthetic data, a broken component
// prop); this can. src/lib/__demo__ exists specifically so this test has
// something to render without needing a real video's real audio.

const REPO_ROOT = join(import.meta.dirname, "..");

function renderStill(compositionId: string, frame: number): number {
  const outDir = mkdtempSync(join(tmpdir(), "lib-demo-render-"));
  const outFile = join(outDir, "frame.png");
  try {
    execFileSync("npx", ["remotion", "still", compositionId, outFile, `--frame=${frame}`], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
    return statSync(outFile).size;
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

test("LibDemo composition renders every beat without a runtime error", { timeout: 180_000 }, () => {
  // One frame per beat (hook, diagram, list, split, longform, cta) — see
  // src/lib/__demo__/timeline.ts for the beat order. Frame 700 lands after
  // DemoWorld's packet has arrived and idles at Beta's node center — the
  // exact scenario that made a hand-rolled packet invisible in a real
  // video (see the skill's "Node occlusion"). This only checks the file is
  // non-empty, same as every other frame here — it does NOT by itself
  // prove the packet is visible (a truly empty diagram would also produce
  // a non-empty PNG). The actual occlusion regression was caught and fixed
  // by direct visual inspection of a still at this frame; this frame is
  // kept in the automated sweep so a future runtime error at this exact
  // point (e.g. a bad PacketMarker prop) still fails loudly.
  const framesToCheck = [50, 500, 700, 900, 1500, 2100, 2700];
  for (const frame of framesToCheck) {
    const size = renderStill("LibDemo", frame);
    assert.ok(size > 0, `LibDemo frame ${frame} produced an empty file`);
  }
});
