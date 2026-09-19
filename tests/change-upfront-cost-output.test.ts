import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, copyFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { movie } from "../src/ChangeUpfrontCost/production.ts";

test(
  "ChangeUpfrontCost pixels show conserved competing work and a gold closing directive",
  { timeout: 180000 },
  () => {
    const dir = mkdtempSync(join(tmpdir(), "change-upfront-pixels-"));
    const render = (scene: number, local: number) => {
      const path = join(dir, `${scene}-${local}.png`);
      execFileSync(
        "npx",
        [
          "remotion",
          "still",
          "ChangeUpfrontCost",
          path,
          `--frame=${movie.scenes[scene].from + local}`,
        ],
        { stdio: "pipe" },
      );
      if (process.env.CHANGE_UPFRONT_QA_DIR) {
        mkdirSync(process.env.CHANGE_UPFRONT_QA_DIR, {recursive:true});
        copyFileSync(path, join(process.env.CHANGE_UPFRONT_QA_DIR, `${scene}-${local}.png`));
      }
      return execFileSync(
        "ffmpeg",
        ["-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        { maxBuffer: 1920 * 1080 * 4 },
      );
    };
    const count = (pixels: Buffer, box: number[], color: number[]) => {
      let n = 0;
      for (let y = box[1]; y < box[3]; y++)
        for (let x = box[0]; x < box[2]; x++)
          if (color.every((v, i) => pixels[(y * 1920 + x) * 3 + i] === v)) n++;
      return n;
    };
    try {
      const black = render(0,0), halfway = render(0,15), settled = render(0,30);
      assert.equal(count(black,[0,0,1920,1080],[0,0,0]),1920*1080,'opening starts black');
      for (const channel of [0,1,2]) assert.ok(halfway[channel] > 0 && halfway[channel] < settled[channel], 'halfway fade interpolates from black');
      assert.equal(count(settled,[0,0,100,100],[21,16,15]),10000,'fade is complete at half a second');
      // Measure actual ink. A cursor is a separate short cluster at least 24px
      // before text; discard it instead of treating the reserved box as text.
      const textBounds = (pixels: Buffer, box: number[], rgb: number[]) => {
        const occupied: number[] = [];
        for(let x=box[0];x<box[2];x++) {
          for(let y=box[1];y<box[3];y++) {
            if(rgb.every((v,i)=>pixels[(y*1920+x)*3+i]===v)) { occupied.push(x); break; }
          }
        }
        assert.ok(occupied.length>20,'visible text required');
        const clusters: number[][] = [];
        for(const x of occupied) {
          const last=clusters[clusters.length-1];
          if(!last || x-last[1]>20) clusters.push([x,x]);
          else last[1]=x;
        }
        return clusters.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];
      };
      for (const sceneIndex of [0,1,6,7]) {
        const scene = movie.scenes[sceneIndex];
        const pixels = render(sceneIndex,scene.duration-1);
        const ranges = sceneIndex===0 ? [[120,930],[990,1800]] : [[500,1420]];
        for(const [groupIndex,range] of ranges.entries()) {
          const group = scene.groups[groupIndex];
          const labels = scene.items.filter(i=>i.owner===group.id);
          const header=textBounds(pixels,[range[0],305,range[1],338],[212,211,210]);
          const rgb=sceneIndex>=6 ? [238,165,48] : [212,211,210];
          const rows=labels.map((_,i)=>textBounds(pixels,[range[0],395+i*105,range[1],427+i*105],rgb));
          const left=Math.min(...rows.map(r=>r[0])), right=Math.max(...rows.map(r=>r[1]));
          assert.ok(Math.abs((left+right-header[0]-header[1])/2)<=4,
            `scene ${sceneIndex} ${group.label}: actual list ink is centered beneath its header`);
          assert.ok(Math.max(...rows.map(r=>r[0]))-left<=4,'all rows keep a shared left edge');
          assert.ok(right-left<500,'list fits its text instead of occupying a fixed 600px box');
        }
      }
      const planning = movie.scenes[7];
      for (const item of planning.items.slice(1)) {
        const before = render(7,item.revealAt!-1);
        const after = render(7,item.revealAt!+30);
        const y = item.id === 'reduce' ? 495 : 600;
        assert.equal(count(before,[650,y,1270,y+35],[238,165,48]),0,'action is not shown before its spoken condition');
        assert.ok(count(after,[650,y,1270,y+35],[238,165,48])>500,'action is readable while its condition is narrated');

      }
      const allocation = render(3, movie.scenes[3].duration - 1);
      for (const y of [338, 468, 598]) {
        const n = count(allocation, [980, y, 1440, y + 27], [212, 211, 210]);
        assert.ok(
          n > 3000 && n < 3150,
          "two distinct capacity units remain in each of three work lanes",
        );
      }
      assert.equal(
        count(allocation, [120, 900, 1800, 1050], [21, 16, 15]),
        1680 * 150,
        "no duplicate narration subtitles",
      );
      const closing = render(8, 90);
      assert.ok(
        count(closing, [250, 380, 1670, 600], [238, 165, 48]) > 1500,
        "closing directive is visibly gold",
      );
      assert.equal(
        count(closing, [250, 380, 1670, 600], [212, 211, 210]),
        0,
        "closing contains no neutral text",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
