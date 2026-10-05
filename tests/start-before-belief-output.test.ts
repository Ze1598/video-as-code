import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/StartBeforeBelief/production.ts";

test("actual pixels show feedback waiting, an unused checklist, test criteria and manager accountability", { timeout: 240000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "start-before-belief-pixels-"));
  const scene = (id: string) => movie.scenes.find(s => s.id === id)!;
  const render = (id: string, local = scene(id).duration - 1) => {
    const file = join(dir, `${id}-${local}.png`);
    execFileSync("npx", ["remotion", "still", "StartBeforeBelief", file, `--frame=${scene(id).from + local}`], { stdio: "pipe" });
    return execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1920 * 1080 * 4 });
  };
  const count = (p: Buffer, box: number[], rgb: number[]) => {
    let n = 0;
    for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) {
      if (rgb.every((v, c) => p[(y * 1920 + x) * 3 + c] === v)) n++;
    }
    return n;
  };
  const gray = [212, 211, 210], gold = [238, 165, 48], bg = [21, 16, 15];
  try {
    const proposal = render("proposal");
    assert.ok(count(proposal, [450, 215, 600, 300], gray) > 40, "manager glyph");
    assert.ok(count(proposal, [1250, 215, 1540, 300], gray) > 100, "lead glyphs");
    assert.ok(count(proposal, [200, 390, 850, 480], gray) > 200, "shared checklist");
    assert.ok(count(proposal, [705, 255, 1210, 266], gray) > 100, "relationship spans both concerns");
    const waiting = render("waiting");
    assert.ok(count(waiting, [944, 454, 976, 486], gray) > 250, "checklist remains at feedback");
    assert.equal(count(waiting, [1544, 454, 1576, 486], gray), 0, "no trial has occurred");
    const unused = render("unused");
    for (const x of [330, 1090]) for (const y of [400, 510]) assert.ok(count(unused, [x, y, x + 550, y + 90], gray) > 150, "old process and lack of experience are both visible");
    const criteria = render("decision");
    for (const x of [325, 1080]) assert.ok(count(criteria, [x, 450, x + 570, 565], gold) > 200, "continue and stop criteria appear in gold");
    const execution = render("followthrough");
    assert.ok(count(execution, [325, 495, 875, 600], gold) > 200, "agreed work promoted");
    assert.equal(count(execution, [1080, 300, 1690, 730], gold), 0, "selective execution is not promoted");
    const initial = render("evidence", 30);
    assert.ok(count(initial, [344, 454, 376, 486], gray) > 250, "evaluation begins at success criteria");
    assert.equal(count(initial, [944, 454, 976, 486], gray), 0, "results do not precede criteria");
    const p = scene("evidence").visuals![0];
    assert.equal(p.kind, "process");
    if (p.kind !== "process") throw new Error("Evidence scene must begin with a process");
    const judged = render("evidence", p.moves[1].end);
    assert.ok(count(judged, [1544, 454, 1576, 486], gray) > 250, "evaluation moves to judgment after results");
    const close = render("close");
    assert.ok(count(close, [200, 300, 1720, 750], gold) > 2000, "conditional closing guidance is gold");
    assert.equal(count(close, [200, 300, 1720, 750], gray), 0, "all closing lines are gold");
    for (const pixels of [proposal, waiting, unused]) assert.equal(count(pixels, [0, 0, 1920, 1080], gold), 0, "story remains neutral");
    for (const pixels of [proposal, waiting, unused, criteria, execution, initial, judged, close]) {
      assert.equal(count(pixels, [0, 0, 100, 100], bg), 10000, "correct background");
      assert.equal(count(pixels, [120, 900, 1800, 1050], bg), 1680 * 150, "safe area remains clear");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
