import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/CooperationWithoutConsequences/production.ts";

test("rendered cooperation shows the loan, refusal and unobstructed reciprocal return", { timeout: 240000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "cooperation-pixels-"));
  const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
  const render = (id: string, local = scene(id).duration - 1) => {
    const file = join(dir, `${id}-${local}.png`);
    execFileSync("npx", ["remotion", "still", "CooperationWithoutConsequences", file, `--frame=${scene(id).from + local}`], { stdio: "pipe" });
    return execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
  };
  const count = (p: Buffer, box: number[], rgb: number[]) => {
    let n = 0;
    for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) if (rgb.every((v, c) => p[(y * 1920 + x) * 3 + c] === v)) n++;
    return n;
  };
  const crop = (p: Buffer, box: number[]) => Buffer.concat(Array.from({ length: box[3] - box[1] }, (_, n) => p.subarray(((box[1] + n) * 1920 + box[0]) * 3, ((box[1] + n) * 1920 + box[2]) * 3)));
  const gray = [212, 211, 210], gold = [238, 165, 48], bg = [21, 16, 15];
  try {
    const lent = render("agreement");
    assert.ok(count(lent, [1100, 495, 1690, 565], gray) > 150, "developer received by Team B");
    assert.equal(count(lent, [210, 390, 850, 470], gray), 0, "developer no longer at Team A");
    const refused = render("refusal");
    assert.ok(count(refused, [210, 390, 850, 470], gray) > 150, "lending team's need remains");
    for (const y of [390, 495]) assert.ok(count(refused, [1100, y, 1690, y + 75], gray) > 150, "refusal and protected plans visible");
    assert.ok(count(refused, [705, 255, 1210, 266], gray) > 100, "ongoing relationship remains");
    const incentives = render("incentives");
    for (const x of [325, 1080]) assert.ok(count(incentives, [x, 555, x + 580, 650], gray) > 150, "withdrawal is visible on both sides");
    const reciprocal = scene("reciprocity");
    const first = reciprocal.transfers[0], returned = reciprocal.transfers[1];
    const before = render("reciprocity", first.end);
    const during = render("reciprocity", returned.start + Math.round((returned.end - returned.start) * 0.3));
    // Measure the full label, excluding its focus cursor to the left. The
    // cursor intentionally leaves this item when returned help is introduced.
    const givenRegion = [1300, 490, 1490, 565];
    assert.ok(count(before, givenRegion, gold) > 150, "first contribution remains visible");
    assert.ok(crop(before, givenRegion).equals(crop(during, givenRegion)), "returning help never covers or changes received help pixels");
    const exchanged = render("reciprocity");
    for (const x of [380, 1250]) assert.ok(count(exchanged, [x, 490, x + 340, 565], gold) > 150, "both distinct contributions remain gold after exchange");
    const distinction = scene("pattern").visuals![0];
    const pattern = render("pattern", distinction.end - 1);
    for (const x of [325, 1080]) assert.ok(count(pattern, [x, 395, x + 570, 480], gray) > 150, "constraint and repeated taking remain distinct neutral facts");
    const close = render("close");
    assert.ok(count(close, [200, 300, 1720, 750], gold) > 2000, "complete consequence and restoration sentence is gold");
    assert.equal(count(close, [200, 300, 1720, 750], gray), 0, "no neutral closing line");
    for (const p of [lent, refused, incentives]) assert.equal(count(p, [0, 0, 1920, 1080], gold), 0, "refusal and withdrawal are never promoted");
    for (const p of [lent, refused, incentives, before, during, exchanged, pattern, close]) {
      assert.equal(count(p, [0, 0, 100, 100], bg), 10000);
      assert.equal(count(p, [120, 900, 1800, 1050], bg), 1680 * 150, "bottom safe area is clear");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
