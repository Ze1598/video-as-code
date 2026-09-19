import { ACCENT, TEXT } from "./palette.ts";

type Span = { start: number; end: number };
type Note = { text: string; at: number; promoted?: boolean };
type Base = Span & { title?: string; titlePromoted?: boolean };
export type Comparison = Base & {
  kind: "comparison";
  left: string;
  right: string;
  rows: { id: string; left: Note; right: Note }[];
};
export type Allocation = Base & {
  kind: "allocation";
  lanes: { id: string; label: string; promoted?: boolean }[];
  units: number;
  initial: string;
  moves: (Span & { units: number[]; to: string })[];
  notes: Note[];
};
export type Process = Base & {
  kind: "process";
  stages: { id: string; label: string; at: number; promoted?: boolean }[];
  token: string;
  initial: string;
  moves: (Span & { to: string })[];
  notes: Note[];
};
export type Timeline = Base & {
  kind: "timeline";
  plannedLabel: string;
  actualLabel: string;
  planned: number;
  initial: number;
  moves: (Span & { to: number })[];
  notes: Note[];
};
export type Visual = Comparison | Allocation | Process | Timeline;

const check = (value: unknown, message: string) => {
  if (!value) throw new Error(message);
};
const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end;
const ease = (frame: number, range: Span) => {
  const t = Math.max(
    0,
    Math.min(1, (frame - range.start) / (range.end - range.start)),
  );
  return t * t * (3 - 2 * t);
};
const rise = (frame: number, at: number, fps: number) =>
  24 * (1 - Math.max(0, Math.min(1, (frame - at) / (fps * 0.45)))) ** 3;
const color = (promoted?: boolean) => (promoted ? ACCENT : TEXT);

/** These bounds guarantee the fixed layouts remain readable, not arbitrary SVG. */
export function validateVisuals(visuals: Visual[], duration: number) {
  const label = (s: string, max = 40) =>
    check(
      s.trim().length > 0 && s.length <= max,
      "visual label exceeds readable bounds",
    );
  const unique = (ids: string[]) =>
    check(new Set(ids).size === ids.length, "duplicate visual id");
  visuals.forEach((v, index) => {
    check(
      Number.isInteger(v.start) &&
        Number.isInteger(v.end) &&
        v.start >= 0 &&
        v.end > v.start &&
        v.end <= duration,
      "invalid visual interval",
    );
    check(
      !visuals.slice(0, index).some((old) => overlaps(old, v)),
      "visual intervals overlap",
    );
    if (v.title !== undefined) label(v.title, 52);
    const cue = (at: number) =>
      check(
        Number.isInteger(at) && at >= v.start && at < v.end,
        "visual cue outside interval",
      );
    const note = (n: Note) => {
      label(n.text, 52);
      cue(n.at);
    };
    if (v.kind === "comparison") {
      label(v.left, 30);
      label(v.right, 30);
      check(
        v.rows.length >= 1 && v.rows.length <= 4,
        "comparison supports 1–4 paired rows",
      );
      unique(v.rows.map((r) => r.id));
      v.rows.forEach((r) => {
        note(r.left);
        note(r.right);
      });
      return;
    }
    v.notes.forEach(note);
    v.moves.forEach((move, i) => {
      cue(move.start);
      check(
        Number.isInteger(move.end) &&
          move.end > move.start &&
          move.end <= v.end,
        "invalid visual move",
      );
      check(
        !i || move.start >= v.moves[i - 1].start,
        "visual moves must be ordered",
      );
      const conflict =
        v.kind === "allocation"
          ? v.moves
              .slice(0, i)
              .some(
                (old) =>
                  overlaps(old, move) &&
                  old.units.some((u) => v.moves[i].units.includes(u)),
              )
          : v.moves.slice(0, i).some((old) => overlaps(old, move));
      check(!conflict, "visual moves overlap");
    });
    if (v.kind === "allocation") {
      check(
        v.lanes.length >= 2 && v.lanes.length <= 3,
        "allocation supports 2–3 lanes",
      );
      unique(v.lanes.map((l) => l.id));
      v.lanes.forEach((l) => label(l.label, 26));
      check(
        Number.isInteger(v.units) && v.units >= 1 && v.units <= 8,
        "allocation supports 1–8 symbolic units",
      );
      check(
        v.lanes.some((l) => l.id === v.initial),
        "unknown initial lane",
      );
      v.moves.forEach((m) => {
        check(
          v.lanes.some((l) => l.id === m.to),
          "unknown destination lane",
        );
        check(
          m.units.length > 0 &&
            new Set(m.units).size === m.units.length &&
            m.units.every((u) => Number.isInteger(u) && u >= 0 && u < v.units),
          "invalid allocation unit",
        );
      });
    } else if (v.kind === "process") {
      check(
        v.stages.length >= 2 && v.stages.length <= 4,
        "process supports 2–4 stages",
      );
      unique(v.stages.map((s) => s.id));
      label(v.token, 30);
      v.stages.forEach((s) => {
        label(s.label, 26);
        cue(s.at);
      });
      check(
        v.stages.some((s) => s.id === v.initial && s.at === v.start),
        "initial stage must be visible",
      );
      v.moves.forEach((m) =>
        check(
          v.stages.some((s) => s.id === m.to && s.at <= m.start),
          "unknown or unrevealed process stage",
        ),
      );
    } else {
      label(v.plannedLabel, 26);
      label(v.actualLabel, 26);
      check(
        [v.planned, v.initial, ...v.moves.map((m) => m.to)].every(
          (n) => Number.isFinite(n) && n >= 0 && n <= 1,
        ),
        "timeline position outside 0–1",
      );
    }
  });
}

export function visualState(v: Visual, frame: number, fps: number) {
  const base = {
    title: v.title ?? "",
    titleColor: color(v.titlePromoted),
    titleOffset: rise(frame, v.start, fps),
    kind: v.kind,
  };
  if (v.kind === "comparison")
    return {
      ...base,
      kind: "comparison" as const,
      left: v.left,
      right: v.right,
      headerY: 540 - ((v.rows.length - 1) * 95 + 100) / 2,
      leftColor: color(v.rows.every((r) => r.left.promoted)),
      rightColor: color(v.rows.every((r) => r.right.promoted)),
      cells: v.rows.flatMap((row, i) =>
        (["left", "right"] as const).map((side) => ({
          id: row.id,
          side,
          text: row[side].text,
          x: side === "left" ? 330 : 1090,
          y: 605 - ((v.rows.length - 1) * 95 + 100) / 2 + i * 95,
          visible: frame >= row[side].at,
          offset: rise(frame, row[side].at, fps),
          color: color(row[side].promoted),
        })),
      ),
    };
  const currentNote = [...v.notes]
    .filter((n) => frame >= n.at)
    .sort((a, b) => b.at - a.at)[0];
  const note = currentNote
    ? {
        ...currentNote,
        offset: rise(frame, currentNote.at, fps),
        color: color(currentNote.promoted),
      }
    : undefined;
  if (v.kind === "allocation") {
    const lanes = v.lanes.map((l, i) => ({
      ...l,
      x: (1920 - (500 + v.units * 80 - 20)) / 2,
      y: 420 + i * 130,
      color: color(l.promoted),
    }));
    const units = Array.from({ length: v.units }, (_, id) => {
      let lane = v.initial;
      let y = lanes.find((l) => l.id === lane)!.y;
      for (const move of v.moves.filter(
        (m) => m.units.includes(id) && m.start <= frame,
      )) {
        const target = lanes.find((l) => l.id === move.to)!;
        y += (target.y - y) * ease(frame, move);
        if (frame >= move.end) lane = move.to;
      }
      return {
        id,
        lane,
        x: lanes[0].x + 500 + id * 80,
        y: y - 22,
        width: 60,
        height: 26,
      };
    });
    return { ...base, kind: "allocation" as const, lanes, units, note };
  }
  if (v.kind === "process") {
    const stages = v.stages.map((s, i) => ({
      ...s,
      x: 360 + (i * 1200) / (v.stages.length - 1),
      visible: frame >= s.at,
      offset: rise(frame, s.at, fps),
      color: color(s.promoted),
    }));
    let stage = v.initial;
    let x = stages.find((s) => s.id === stage)!.x;
    for (const move of v.moves.filter((m) => m.start <= frame)) {
      const target = stages.find((s) => s.id === move.to)!;
      x += (target.x - x) * ease(frame, move);
      if (frame >= move.end) stage = move.to;
    }
    return {
      ...base,
      kind: "process" as const,
      stages,
      token: { label: v.token, x, stage },
      note,
    };
  }
  let actual = v.initial;
  for (const move of v.moves.filter((m) => m.start <= frame))
    actual += (move.to - actual) * ease(frame, move);
  return {
    ...base,
    kind: "timeline" as const,
    plannedLabel: v.plannedLabel,
    actualLabel: v.actualLabel,
    plannedX: 620 + v.planned * 980,
    actualX: 620 + actual * 980,
    actualVisible: v.moves.some((m) => frame >= m.start),
    note,
  };
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const lines = (s: string, max: number) => {
  const out: string[] = [];
  let line = "";
  for (const word of s.split(" ")) {
    if (line && (line + " " + word).length > max) {
      out.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) out.push(line);
  return out;
};
const text = (
  s: string,
  x: number,
  y: number,
  size = 34,
  fill = TEXT,
  anchor = "start",
  max = 28,
) =>
  lines(s, max)
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * (size + 10)}" font-size="${size}" font-weight="400" fill="${fill}" text-anchor="${anchor}">${esc(line)}</text>`,
    )
    .join("");
const path = (d: string, dashOffset?: number) =>
  `<path d="${d}" fill="none" stroke="${TEXT}" stroke-width="2"${dashOffset === undefined ? "" : ` stroke-dasharray="6 6" stroke-dashoffset="${dashOffset}"`}/>`;
function renderVisualContent(
  v: ReturnType<typeof visualState>,
  dashOffset: number,
) {
  if (v.kind === "comparison") {
    const header = (s: string, x: number, anchor: string, fill: string) =>
      `<text x="${x}" y="${v.headerY}" text-anchor="${anchor}" font-size="22" letter-spacing="3" fill="${fill}">${esc(s.toUpperCase())}</text>`;
    const bottom = v.cells[v.cells.length - 1].y + 52;
    return `<g data-visual="comparison">${header(v.left, 330, "start", v.leftColor)}${header(v.right, 1090, "start", v.rightColor)}<path data-divider="true" d="M960 ${v.headerY - 23} V${bottom}" stroke="${TEXT}" stroke-width="1"/>${v.cells
      .filter((c) => c.visible)
      .map(
        (c) =>
          `<g data-cell="${esc(c.id)}-${c.side}"><path data-bullet="${esc(c.id)}-${c.side}" d="M${c.x - 60} ${c.y - 11 + c.offset} h40" stroke="${c.color}" stroke-width="3"/>${text(c.text, c.x, c.y + c.offset, 34, c.color, "start", 28)}</g>`,
      )
      .join("")}</g>`;
  }
  if (v.kind === "allocation")
    return `<g data-visual="allocation">${v.lanes.map((l) => text(l.label, l.x, l.y, 32, l.color, "start", 26)).join("")}${v.units.map((u) => `<rect data-unit="${u.id}" x="${u.x}" y="${u.y}" width="${u.width}" height="${u.height}" rx="2" fill="${TEXT}"/>`).join("")}</g>`;
  if (v.kind === "process") {
    const stages = v.stages.filter((s) => s.visible);
    const edges = stages
      .slice(1)
      .map((s, i) => path(`M${stages[i].x + 35} 530 H${s.x - 35}`, dashOffset))
      .join("");
    const labels = stages
      .map(
        (s) =>
          text(s.label, s.x, 420 + s.offset, 30, s.color, "middle", 20) +
          path(`M${s.x} 492 V508`),
      )
      .join("");
    const x = v.token.x;
    const marker = `<path data-token="true" d="M${x} 516 l14 14 l-14 14 l-14 -14 Z" fill="${TEXT}"/>`;
    return `<g data-visual="process">${edges}${labels}${marker}${text(v.token.label, x, 610, 28, TEXT, "middle", 22)}</g>`;
  }
  const actual = v.actualVisible
    ? `<path data-actual-milestone="true" d="M${v.actualX} 430 V600" fill="none" stroke="${TEXT}" stroke-width="2" stroke-dasharray="6 6" stroke-dashoffset="${dashOffset}"/>${text(v.actualLabel, v.actualX + 14, 400, 30, TEXT, "start")}`
    : "";
  return `<g data-visual="timeline"><path data-time-axis="true" d="M360 600 H1650" stroke="${TEXT}" stroke-width="2"/><path data-planned-milestone="true" d="M${v.plannedX} 430 V600" stroke="${TEXT}" stroke-width="2"/>${text(v.plannedLabel, v.plannedX - 14, 400, 30, TEXT, "end")}${actual}<path data-axis-arrow="true" d="M1636 590 L1650 600 L1636 610" fill="none" stroke="${TEXT}" stroke-width="2"/>${text("Time", 1005, 655, 30, TEXT, "middle")}</g>`;
}

/** Fixed content alignment, never a moving camera. */
export function renderVisual(
  v: ReturnType<typeof visualState>,
  dashOffset: number,
) {
  const x = v.kind === "timeline" ? -45 : 0;
  return `<svg x="${x}" y="-60" width="1920" height="1080" overflow="visible">${renderVisualContent(v, dashOffset)}</svg>`;
}
