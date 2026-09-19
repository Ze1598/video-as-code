import { BG, TEXT, ACCENT } from "./palette.ts";
import { splitSentences, type WordTiming } from "./sentences.ts";
import {
  validateVisuals,
  visualState,
  renderVisual,
  type Visual,
} from "./visuals.ts";

export type Group = { id: string; label: string; members: number };
export type Item = {
  id: string;
  label: string;
  kind: "work" | "issue" | "process" | "system" | "question";
  owner: string;
  revealAt?: number;
};
export type Interval = { start: number; end: number };
export type Scene = {
  id: string;
  duration: number;
  narration: WordTiming[];
  groups: Group[];
  items: Item[];
  transfers: (Interval & { item: string; to: string })[];
  topics: (Interval & { group: string; item: string; connection?: boolean })[];
  takeaways: (Interval & { item?: string; phrase?: string; text?: true })[];
  relationships?: (Interval & { from: string; to: string })[];
  textMotion?: "rise";
  textStyle?: "normal" | "italic";
  transition?: "reflow";
  audio?: { src: string; duration: number };
  visuals?: Visual[];
};
export type EssayPlan = { fps: number; scenes: Scene[] };
type Box = { x: number; y: number; width: number; height: number };
type CompiledScene = Scene & {
  from: number;
  boxes: Record<string, Box>;
  slots: Record<string, string[]>;
};
export type Movie = { fps: number; duration: number; scenes: CompiledScene[] };
const requireValue = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
const active = (range: Interval, frame: number) =>
  frame >= range.start && frame < range.end;
const TEXT_ENTRANCE_SECONDS = 0.45;
const DASH_PIXELS_PER_SECOND = 12.6;

/** Compile an editorial plan into stable layouts. Never infer story meaning. */
export function compileEssay(plan: EssayPlan): Movie {
  requireValue(
    Number.isInteger(plan.fps) && plan.fps > 0 && plan.scenes.length,
    "fps and scenes required",
  );
  let from = 0;
  const ids = new Set<string>();
  const scenes = plan.scenes.map((scene) => {
    requireValue(!ids.has(scene.id), "duplicate scene");
    ids.add(scene.id);
    requireValue(
      Number.isInteger(scene.duration) && scene.duration > 0,
      "invalid duration",
    );
    validateVisuals(scene.visuals ?? [], scene.duration);
    requireValue(
      !scene.visuals?.length || !scene.groups.length,
      "dedicated visuals cannot overlap actor layouts",
    );
    requireValue(
      scene.groups.length <= 3,
      "layout supports at most three groups",
    );
    const groups = new Set(scene.groups.map((g) => g.id));
    const items = new Set(scene.items.map((i) => i.id));
    requireValue(
      groups.size === scene.groups.length && items.size === scene.items.length,
      "duplicate entity",
    );
    const slots: Record<string, string[]> = {};
    const boxes: Record<string, Box> = {};
    scene.groups.forEach((group, index) => {
      requireValue(
        Number.isInteger(group.members) &&
          group.members >= 1 &&
          group.members <= 5,
        "members must be 1–5 representative individuals",
      );
      requireValue(group.label.length <= 36, "group label too long");
      const width =
        (1680 - (scene.groups.length - 1) * 60) / scene.groups.length;
      boxes[group.id] = {
        x: 120 + index * (width + 60),
        y: 130,
        width,
        height: 630,
      };
      slots[group.id] = scene.items
        .filter((item) => item.owner === group.id)
        .map((item) => item.id);
    });
    scene.items.forEach((item) => {
      requireValue(groups.has(item.owner), `unknown owner for ${item.id}`);
      requireValue(item.label.length <= 34, "item label too long");
      requireValue(
        item.revealAt === undefined ||
          (Number.isInteger(item.revealAt) &&
            item.revealAt >= 0 &&
            item.revealAt < scene.duration),
        "invalid item reveal",
      );
    });
    for (const range of [
      ...scene.transfers,
      ...scene.topics,
      ...scene.takeaways,
      ...(scene.relationships ?? []),
    ]) {
      requireValue(
        Number.isInteger(range.start) &&
          Number.isInteger(range.end) &&
          range.start >= 0 &&
          range.end > range.start &&
          range.end <= scene.duration,
        "invalid interval",
      );
    }
    const transferred = new Set<string>();
    for (const transfer of scene.transfers) {
      requireValue(
        items.has(transfer.item) && groups.has(transfer.to),
        "unknown transfer endpoint",
      );
      requireValue(
        !transferred.has(transfer.item),
        "one transfer per item per scene",
      );
      transferred.add(transfer.item);
      requireValue(
        transfer.end <= scene.duration - Math.ceil(plan.fps * 0.5),
        "handoff needs time to settle before scene replacement",
      );
      if (!slots[transfer.to].includes(transfer.item))
        slots[transfer.to].push(transfer.item);
    }
    Object.values(slots).forEach((slot) =>
      requireValue(
        slot.length <= 3,
        "layout supports at most three work items per group",
      ),
    );
    scene.topics.forEach((topic) =>
      requireValue(
        groups.has(topic.group) && items.has(topic.item),
        "unknown topic endpoint",
      ),
    );
    scene.relationships?.forEach((r) =>
      requireValue(
        groups.has(r.from) && groups.has(r.to) && r.from !== r.to,
        "invalid actor relationship",
      ),
    );
    scene.takeaways.forEach((t) =>
      requireValue(
        (t.item && items.has(t.item)) ||
          (t.phrase &&
            scene.narration
              .map((w) => w.text)
              .join(" ")
              .includes(t.phrase)) ||
          (t.text && !groups.size && scene.narration.length),
        "unknown takeaway",
      ),
    );
    scene.narration.forEach((word, index) =>
      requireValue(
        word.startMs >= 0 &&
          word.endMs >= word.startMs &&
          word.endMs <= (scene.duration * 1000) / plan.fps &&
          (!index || word.startMs >= scene.narration[index - 1].endMs),
        "invalid narration timing",
      ),
    );
    const result = { ...scene, from, boxes, slots };
    from += scene.duration;
    return result;
  });
  return { fps: plan.fps, duration: from, scenes };
}

function slotBox(scene: CompiledScene, owner: string, item: string): Box {
  const group = scene.boxes[owner];
  const index = scene.slots[owner].indexOf(item);
  const center = group.x + group.width / 2;
  const width = Math.min(600, group.width - 120);
  return { x: center - width / 2, y: 390 + index * 105, width, height: 70 };
}

export function frameState(movie: Movie, frame: number) {
  requireValue(
    Number.isInteger(frame) && frame >= 0 && frame < movie.duration,
    "frame outside movie",
  );
  const scene = movie.scenes.find(
    (s) => frame >= s.from && frame < s.from + s.duration,
  )!;
  const local = frame - scene.from;
  // Global time preserves dash phase when a relationship continues across cuts.
  const dashOffset = (-frame / movie.fps) * DASH_PIXELS_PER_SECOND;
  const currentVisual = scene.visuals?.find((v) => active(v, local));
  const visual = currentVisual
    ? visualState(currentVisual, local, movie.fps)
    : undefined;
  // Reflow preserves identities at a scene boundary, then moves the whole
  // owned list with its people during the existing narration lead-in silence.
  const previous = movie.scenes[movie.scenes.indexOf(scene) - 1];
  const reflow =
    scene.transition === "reflow" && previous && local < movie.fps * 0.4;
  const progress = Math.min(1, local / (movie.fps * 0.4));
  const shift = (owner: string) => {
    const old = previous?.boxes[owner];
    const next = scene.boxes[owner];
    return reflow && old
      ? (old.x + old.width / 2 - next.x - next.width / 2) * (1 - progress) ** 3
      : 0;
  };
  const groups = scene.groups.map((g) => ({
    ...g,
    ...scene.boxes[g.id],
    x: scene.boxes[g.id].x + shift(g.id),
  }));
  const items = scene.items.map((item) => {
    const initial = slotBox(scene, item.owner, item.id);
    const transfer = scene.transfers.find((t) => t.item === item.id);
    let box = initial;
    let owner = item.owner;
    let moving = false;
    if (transfer && local >= transfer.start) {
      const target = slotBox(scene, transfer.to, item.id);
      const t = Math.min(
        1,
        (local - transfer.start) / (transfer.end - transfer.start),
      );
      // Align with the destination row first, then traverse horizontally.
      // This preserves the visibility of already assigned work above it.
      const vertical = Math.min(1, t / 0.35);
      const horizontal = Math.max(0, (t - 0.35) / 0.65);
      const easeY = vertical * vertical * (3 - 2 * vertical);
      const easeX = horizontal * horizontal * (3 - 2 * horizontal);
      box = {
        ...target,
        x: initial.x + (target.x - initial.x) * easeX,
        y: initial.y + (target.y - initial.y) * easeY,
        width: initial.width + (target.width - initial.width) * easeX,
      };
      moving = t < 1;
      if (!moving) owner = transfer.to;
    }
    const focused = scene.topics.some(
      (t) => t.item === item.id && active(t, local),
    );
    const visible = local >= (item.revealAt ?? 0);
    const textOffset =
      item.revealAt === undefined
        ? 0
        : 24 *
          (1 -
            Math.max(
              0,
              Math.min(1, (local - item.revealAt) / (movie.fps * 0.3)),
            )) **
            3;
    return {
      ...item,
      ...box,
      x: box.x + shift(owner),
      owner,
      moving,
      focused,
      visible,
      textOffset,
      opacity: 1,
      color: scene.takeaways.some((t) => t.item === item.id && active(t, local))
        ? ACCENT
        : TEXT,
    };
  });
  const edges = items
    .filter(
      (item) =>
        item.visible &&
        !item.moving &&
        scene.topics.some(
          (t) =>
            t.connection &&
            t.item === item.id &&
            t.group === item.owner &&
            active(t, local),
        ),
    )
    .map((item) => {
      const group = groups.find((g) => g.id === item.owner)!;
      const isActive = scene.topics.some(
        (t) => t.group === group.id && t.item === item.id && active(t, local),
      );
      return {
        item: item.id,
        x1: group.x + group.width / 2,
        y1: 342,
        x2: item.x + item.width / 2,
        y2: item.y - 10,
        active: isActive,
        dashOffset,
        color: item.color,
      };
    });
  const ms = (local * 1000) / movie.fps;
  const sentences = splitSentences(scene.narration);
  const sentence = sentences.find(
    (s, i) =>
      ms >= s.startMs &&
      (i === sentences.length - 1 || ms < sentences[i + 1].startMs),
  );
  const captionAge = sentence
    ? ((ms - sentence.startMs) * movie.fps) / 1000
    : 0;
  const motionFrames = movie.fps * TEXT_ENTRANCE_SECONDS;
  const captionOffset =
    scene.textMotion === "rise"
      ? 24 * (1 - Math.min(1, captionAge / motionFrames)) ** 3
      : 0;
  const cursors = items
    .filter((i) => i.visible && i.focused)
    .map((i) => ({ item: i.id, x: i.x - 24, y: i.y + 24, dashOffset }));
  const relationships = (scene.relationships ?? [])
    .filter((r) => active(r, local))
    .map((r) => {
      const a = groups.find((g) => g.id === r.from)!;
      const b = groups.find((g) => g.id === r.to)!;
      const direction = Math.sign(b.x - a.x);
      return {
        x1: a.x + a.width / 2 + direction * 180,
        x2: b.x + b.width / 2 - direction * 180,
        y: 260,
        dashOffset,
      };
    });
  return {
    sceneId: scene.id,
    groups,
    items,
    edges,
    cursors,
    relationships,
    visual,
    dashOffset,
    captionOffset,
    captionStyle: scene.textStyle ?? "normal",
    caption:
      groups.length || scene.visuals?.length ? "" : (sentence?.text ?? ""),
    textOnly: !groups.length && !scene.visuals?.length,
    captionColor: scene.takeaways.some((t) => t.text && active(t, local))
      ? ACCENT
      : TEXT,
    phrase: scene.takeaways.find((t) => t.phrase && active(t, local))?.phrase,
  };
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
function textLines(text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && line.length + word.length + 1 > max) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}

/** The same SVG is used by Remotion and output tests. No camera transforms. */
export function renderSvg(state: ReturnType<typeof frameState>): string {
  const groups = state.groups
    .map(
      (g) =>
        `<g data-group="${esc(g.id)}"><text x="${g.x + g.width / 2}" y="330" text-anchor="middle" font-size="28">${esc(g.label)}</text>${Array.from(
          { length: g.members },
          (_, i) => {
            const x = g.x + g.width / 2 + (i - (g.members - 1) / 2) * 64;
            return `<g data-person="${esc(g.id)}-${i}"><circle cx="${x}" cy="240" r="14" fill="none" stroke="${TEXT}" stroke-width="2"/><path d="M${x - 22} 288 Q${x - 22} 264 ${x} 264 Q${x + 22} 264 ${x + 22} 288" fill="none" stroke="${TEXT}" stroke-width="2"/></g>`;
          },
        ).join("")}</g>`,
    )
    .join("");
  const edges = state.edges
    .map(
      (e) =>
        `<path d="M${e.x1} ${e.y1} L${e.x2} ${e.y2}" fill="none" stroke="${e.color}" stroke-width="2" stroke-dashoffset="${e.dashOffset}" stroke-dasharray="6 6"/>`,
    )
    .join("");
  const relationships = state.relationships
    .map(
      (r) =>
        `<path data-relationship="true" d="M${r.x1} ${r.y} H${r.x2}" fill="none" stroke="${TEXT}" stroke-width="2" stroke-dasharray="6 6" stroke-dashoffset="${r.dashOffset}"/>`,
    )
    .join("");
  const cursors = state.cursors
    .map(
      (c) =>
        `<g data-cursor="${esc(c.item)}" fill="none" stroke="${TEXT}" stroke-width="2"><path d="M${c.x - 42} ${c.y} H${c.x}" stroke-dasharray="6 6" stroke-dashoffset="${c.dashOffset}"/><path d="M${c.x - 8} ${c.y - 7} L${c.x} ${c.y} L${c.x - 8} ${c.y + 7}"/></g>`,
    )
    .join("");
  const items = state.items
    .filter((i) => i.visible)
    .map((i) => {
      const y = i.y;
      const label = textLines(i.label, Math.floor(i.width / 16))
        .map(
          (line, index) =>
            `<text x="${i.x + i.textOffset}" y="${y + 34 + index * 31}" font-size="30" font-weight="400" fill="${i.color}">${esc(line)}</text>`,
        )
        .join("");
      return `<g data-item="${esc(i.id)}">${label}</g>`;
    })
    .join("");
  const lines = textLines(state.caption, state.textOnly ? 60 : 90);
  const caption = lines
    .map((line, i) => {
      let content = esc(line);
      if (state.phrase && line.includes(state.phrase))
        content = content.replace(
          esc(state.phrase),
          `<tspan fill="${ACCENT}">${esc(state.phrase)}</tspan>`,
        );
      return `<text x="960" y="${496 - (lines.length - 1) * 28 + i * 56 + state.captionOffset}" text-anchor="middle" font-size="44" font-style="${state.captionStyle}" fill="${state.captionColor}">${content}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" fill="${TEXT}" font-family="Helvetica Neue, Arial, sans-serif"><rect width="1920" height="1080" fill="${BG}"/>${groups}${edges}${relationships}${items}${cursors}${state.visual ? renderVisual(state.visual, state.dashOffset) : ""}${caption}</svg>`;
}
