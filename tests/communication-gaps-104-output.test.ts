import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { movie } from "../src/CommunicationGaps104/plan.ts";

test("recorded discussion renders every scene and the central causal changes correctly", { timeout: 300000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "communication-gaps-frames-"));
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
    const composition = await selectComposition({ serveUrl, id: "CommunicationGaps104", puppeteerInstance: browser });
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
    await render("friday-before", Math.round(780 * 60));
    await render("launch-before", Math.round(791.8 * 60));
    const p = (id: string) => pixels.get(id)!;
    for (const y of [390, 495, 600]) assert.ok(count(p("blank-ticket"), [1100, y, 1730, y + 75], gray) > 150, "three missing pieces appear at the developers");
    for (const x of [250, 800, 1400]) assert.ok(count(p("client-dependencies"), [x, 390, x + 280, 490], gray) > 150, "finance, marketing and legal inputs remain separate");
    assert.ok(count(p("research-loop"), [344, 454, 376, 486], gray) > 250, "work returns to research rather than progressing to a product");
    assert.ok(count(p("friday-before"), [344, 454, 376, 486], gray) > 250, "work waits at the decision");
    assert.ok(count(p("friday-decision"), [944, 454, 976, 486], gray) > 250, "Friday decision releases implementation");
    assert.equal(count(p("friday-decision"), [1544, 454, 1576, 486], gray), 0, "testing and deployment are still ahead");
    // The timeline's centered viewport shifts its local x by -45px.
    // Its two-pixel stroke at screen x=1133.6 has one fully covered column.
    assert.ok(count(p("launch-slips"), [1132, 370, 1136, 540], gray) > 150, "planned commitment is visible");
    for (let y = 370; y < 530; y++) {
      const begin = (y * 1920 + 1132) * 3, end = (y * 1920 + 1136) * 3;
      assert.deepEqual(p("launch-before").subarray(begin, end), p("launch-slips").subarray(begin, end), "planned milestone stays fixed while actual launch moves");
    }
    for (const x of [330, 1090]) assert.ok(count(p("adaptive-cadence"), [x, 495, x + 540, 660], gold) > 200, "both appropriate cadence choices are guidance");
    assert.ok(count(p("close"), [120, 300, 1800, 800], gold) > 1000, "closing instruction is gold");
    assert.equal(count(p("close"), [120, 300, 1800, 800], gray), 0);
    for (const id of ["blank-ticket", "research-loop", "client-dependencies", "monday-tuesday", "launch-slips"]) assert.equal(count(p(id), [0, 0, 1920, 1080], gold), 0, "failures are never promoted");
  } finally {
    await browser.close({ silent: true });
    rmSync(dir, { recursive: true, force: true });
  }
});
