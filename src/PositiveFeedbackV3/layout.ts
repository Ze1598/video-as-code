import { BEAT_ORDER, frameOfWord, TIMELINE } from "./timeline";

// Same base palette as the other essay videos, for series continuity.
export const BG = "#14110F";
export const TEXT = "#F2EDE4";
export const DIM_TEXT = "#8A8377";
export const ACCENT = "#E8A33D";
export const LINE_INACTIVE = "#3A342C";
export const LINE_ACTIVE = "#B9B2A6";

export type NodeId = "engineer" | "manager" | "leadership";

// Fixed world-space coordinates. The camera moves over this fixed layout;
// the layout itself never changes.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  engineer: { x: 520, y: 620, label: "Engineer" },
  manager: { x: 1020, y: 480, label: "Manager" },
  leadership: { x: 1520, y: 300, label: "Leadership" },
};

// The Engineer<->Leadership connector is the one whose state carries the
// entire mechanism. Engineer and Leadership are never in any kind of
// contact — not even a broken one — until the review: no connector in any
// form (no dashed "pending" state) exists between them before the reveal.
export const REVEAL_DRAW_START = frameOfWord("beat-06", "brought");
export const REVEAL_DRAW_END = frameOfWord("beat-06", "contributions", "end");
export const REVEAL_PACKET_START = REVEAL_DRAW_END + 5;
export const REVEAL_PACKET_END = frameOfWord("beat-06", "knew.", "end");

export const INFO_PACKET_SPAWN = frameOfWord("beat-01", "validation");

// The info packet makes one continuous journey through the whole video:
// Engineer -> Manager (she tells him, Beat 1) -> Leadership (he relays it
// upward, Beat 2) -> idle at Leadership through the entire failure path
// (Beats 3-5) -> finally Leadership -> Engineer at the Beat 6 reveal, where
// it stays.
export const PACKET_SEG1: [NodeId, NodeId, number, number] = [
  "engineer",
  "manager",
  INFO_PACKET_SPAWN,
  frameOfWord("beat-01", "client.", "end"),
];
export const PACKET_SEG2: [NodeId, NodeId, number, number] = [
  "manager",
  "leadership",
  frameOfWord("beat-02", "praised"),
  frameOfWord("beat-02", "call.", "end"),
];
export const PACKET_SEG3: [NodeId, NodeId, number, number] = [
  "leadership",
  "engineer",
  REVEAL_PACKET_START,
  REVEAL_PACKET_END,
];

// Routine, visible work (tickets) flowing Manager<->Engineer during the
// silent months — contrasted against the amber info packet sitting idle.
export const TICKET_STREAM_START = TIMELINE["beat-04"].from;
export const TICKET_STREAM_END = TIMELINE["beat-04"].from + TIMELINE["beat-04"].duration;
export const TICKET_LABELS = ["corrections,", "task", "deadline"];

// The "ten months" timeline HUD fills across the silent stretch and
// completes exactly as the review (Beat 6) begins.
export const MONTHS_FILL_START = TIMELINE["beat-04"].from;
export const MONTHS_FILL_END = TIMELINE["beat-06"].from;

// Camera targets are DERIVED from which persona(s) a beat is actually about.
// One focus node: center on it, tight. Two: center on their midpoint, zoomed
// to fit both with even margin. Zero ("wide"/"reveal"): centroid, zoomed out.
type Focus = NodeId[] | "wide" | "reveal";

const FOCUS_BY_BEAT: Record<string, Focus> = {
  "beat-01": ["engineer"],
  "beat-02": ["manager", "leadership"],
  "beat-03": ["manager", "engineer"],
  "beat-04": ["manager", "engineer"],
  "beat-05": ["manager", "engineer"],
  "beat-06": "reveal",
  "beat-07": "wide", // dedicated verdict-split scene takes over the screen
  "beat-08": "wide", // dedicated reinforcement-list scene takes over the screen
};

const TIGHT_ZOOM = 1.8;
const WIDE_ZOOM = 0.85;
const REVEAL_ZOOM = 0.72;
const PAIR_ON_SCREEN_SPAN = 760;
const PAIR_ZOOM_RANGE: [number, number] = [1.05, 1.9];

const CENTROID = {
  x: (NODES.engineer.x + NODES.manager.x + NODES.leadership.x) / 3,
  y: (NODES.engineer.y + NODES.manager.y + NODES.leadership.y) / 3,
};

function cameraTarget(focus: Focus): { x: number; y: number; zoom: number } {
  if (focus === "wide") {
    return { x: CENTROID.x, y: CENTROID.y, zoom: WIDE_ZOOM };
  }
  if (focus === "reveal") {
    return { x: CENTROID.x, y: CENTROID.y, zoom: REVEAL_ZOOM };
  }
  if (focus.length === 1) {
    const n = NODES[focus[0]];
    return { x: n.x, y: n.y, zoom: TIGHT_ZOOM };
  }
  const [a, b] = [NODES[focus[0]], NODES[focus[1]]];
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const zoom = Math.min(
    PAIR_ZOOM_RANGE[1],
    Math.max(PAIR_ZOOM_RANGE[0], PAIR_ON_SCREEN_SPAN / distance),
  );
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, zoom };
}

// Each target is TWO breakpoints (arrive, then hold-until) carrying the
// identical x/y/zoom, so the camera genuinely parks on target. TRANSITION is
// long (55 frames, ~0.9s) so moves read as the camera panning across the
// layout — see Camera.ts for the ease-in-out curve that makes this work;
// v2 used a much shorter, ease-out-only transition that read as a snap.
const TRANSITION = 55;
const CAMERA_KEYFRAMES: Array<{ frame: number; target: { x: number; y: number; zoom: number } }> = [];

const CAMERA_BEATS = BEAT_ORDER.filter((id) => id in FOCUS_BY_BEAT);
CAMERA_BEATS.forEach((id, i) => {
  const t = TIMELINE[id];
  const target = cameraTarget(FOCUS_BY_BEAT[id]);
  const isFirst = i === 0;
  const isLast = i === CAMERA_BEATS.length - 1;
  const arrive = isFirst ? t.from : t.from + TRANSITION;
  const hold = isLast ? t.from + t.duration : t.from + t.duration - TRANSITION;
  CAMERA_KEYFRAMES.push({ frame: arrive, target });
  CAMERA_KEYFRAMES.push({ frame: hold, target });
});

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "validation system",
  "beat-02": "leadership call",
  "beat-03": "assumed she already knew",
  "beat-04": "went unnoticed",
  "beat-05": "chased visible work instead",
  "beat-06": "one of her strongest contributions",
  "beat-09": "connect the result to the behavior",
};

// The diagram is invisible through the Hook (it has nothing to show yet),
// fades in as Beat 1 begins, stays in the foreground through the one-case
// story (Beats 1-6), then recedes once Beat 7's verdict-split scene takes
// over — and stays receded (Beat 8's list scene is dedicated too, and the
// closing thesis/CTA read fine over a dim backdrop).
export const WORLD_FADE_IN_START = TIMELINE["beat-01"].from;
export const WORLD_DIM_START = TIMELINE["beat-07"].from;

// Safe zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing.
export const DIAGRAM_SCALE = 0.75;
export const CAPTION_TOP = 860;
