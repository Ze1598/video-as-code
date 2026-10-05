import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { movie } from "../src/WorkingTogether105/plan.ts";

test("episode 105 renders every scene and causal movement with safe, readable pixels", { timeout: 300000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "working-together-frames-"));
  const browser = await openBrowser("chrome");
  const pixels = new Map<string, Buffer>();
  const count = (p: Buffer, b: number[], rgb: number[]) => {
    let hits = 0;
    for (let y = b[1]; y < b[3]; y++) for (let x = b[0]; x < b[2]; x++) if (rgb.every((v, i) => p[(y * 1920 + x) * 3 + i] === v)) hits++;
    return hits;
  };
  const gray = [212, 211, 210], gold = [238, 165, 48], bg = [21, 16, 15];
  try {
    const serveUrl = await bundle({ entryPoint: resolve("src/index.ts"), outDir: join(dir, "bundle"), symlinkPublicDir: true });
    const composition = await selectComposition({ serveUrl, id: "WorkingTogether105", puppeteerInstance: browser });
    const render = async (key: string, frame: number) => {
      const output = join(dir, `${key}.png`);
      await renderStill({ composition, serveUrl, puppeteerInstance: browser, frame, output, imageFormat: "png" });
      const p = execFileSync("ffmpeg", ["-v", "error", "-i", output, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
      pixels.set(key, p);
      assert.ok(count(p, [120, 130, 1800, 800], gray) + count(p, [120, 130, 1800, 800], gold) > 500, `${key} has readable content`);
      assert.equal(count(p, [120, 900, 1800, 1050], bg), 1680 * 150, `${key} bottom safe area is clear`);
      assert.equal(count(p, [0, 0, 100, 100], bg), 10000);
    };
    // One actual browser raster per editorial scene, plus before/after states.
    for (const s of movie.scenes) await render(s.id, s.from + s.duration - 1);
    // Verify both ends of every narrated move, not just the final scene state.
    for (const s of movie.scenes) {
      for (const [i, move] of [...s.transfers, ...(s.visuals ?? []).flatMap(v => v.kind === "process" ? v.moves : [])].entries()) {
        await render(`${s.id}-move-${i}-before`, s.from + Math.max(0, move.start - 1));
        await render(`${s.id}-move-${i}-after`, s.from + move.end);
      }
    }
    const p = (id: string) => pixels.get(id)!;
    assert.ok(count(p("first-help-move-0-before"), [1170,390,1660,465], gray) > 250, "developer support begins at Team B");
    assert.equal(count(p("first-help-move-0-after"), [1170,390,1660,465], gray), 0, "support leaves Team B");
    assert.ok(count(p("first-help-move-0-after"), [260,495,770,565], gray) > 250, "support reaches Team A below its release");
    for (const id of ["secondhand-loop", "alignment-loop"]) {
      assert.ok(count(p(`${id}-move-1-after`), [1544,454,1576,486], gray) > 250, "the work reaches the third stage");
      assert.ok(count(p(id), [344,454,376,486], gray) > 250, "the loop returns work to its initial stage");
      assert.equal(count(p(id), [1544,454,1576,486], gray), 0, "work does not remain at the third stage");
    }
    assert.ok(count(p("fire-exit"), [744,454,776,486], gray) > 250, "team waits at the blocked stairwell");
    assert.equal(count(p("fire-exit"), [1544,454,1576,486], gray), 0, "unanimity has not enabled an exit");
    assert.ok(count(p("listen-then-decide"), [1544,454,1576,486], gray) > 250, "input and revision progress to deciding to test");
    for (const id of ["refusal", "cooperation-collapses", "secondhand-loop", "alignment-loop", "new-hire-still-waits"]) assert.equal(count(p(id), [0,0,1920,1080], gold), 0, "failure is not promoted");
    for (const x of [300,1090]) assert.ok(count(p("define-success-first"), [x,350,x+560,700], gold) > 500, "both success and stopping criteria are guidance");
    assert.ok(count(p("close"), [120,300,1800,800], gold) > 1000, "the actual closing question is gold");
    assert.equal(count(p("close"), [120,300,1800,800], gray), 0);
  } finally {
    await browser.close({ silent: true });
    rmSync(dir, { recursive: true, force: true });
  }
});
