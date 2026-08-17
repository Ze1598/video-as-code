import { BEAT_ORDER, frameOfWord, TIMELINE } from "./timeline";

// Same base palette as PositiveFeedback (v1) for series continuity.
export const BG = "#14110F";
export const TEXT = "#F2EDE4";
export const DIM_TEXT = "#8A8377";
export const ACCENT = "#E8A33D";
export const LINE_INACTIVE = "#3A342C";
export const LINE_ACTIVE = "#B9B2A6";

export type NodeId = "engineer" | "manager" | "leadership";

// Fixed world-space coordinates (in the same units as the 1920x1080 frame at
// zoom 1). The camera moves over this fixed layout; the layout itself never
// changes, matching the "stable visual language" requirement.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  engineer: { x: 520, y: 620, label: "Engineer" },
  manager: { x: 1020, y: 480, label: "Manager" },
  leadership: { x: 1520, y: 300, label: "Leadership" },
};

// The Engineer<->Leadership connector is the one whose state carries the
// entire mechanism: dashed amber ("exists but not reaching her") for the
// whole failure path, then draws solid+glow at the Beat 6 reveal.
export const REVEAL_DRAW_START = frameOfWord("beat-06", "brought");
export const REVEAL_DRAW_END = frameOfWord("beat-06", "contributions.", "end");
export const REVEAL_PACKET_START = REVEAL_DRAW_END + 5;
export const REVEAL_PACKET_END = frameOfWord("beat-06", "knew.", "end");

export const INFO_PACKET_SPAWN = frameOfWord("beat-01", "validation");

// The info packet makes one continuous journey through the whole video:
// Engineer -> Manager (she tells him, Beat 1) -> Leadership (he relays it
// upward, Beat 2) -> idle at Leadership through the entire failure path
// (Beats 3-5) -> finally Leadership -> Engineer at the Beat 6 reveal, where
// it stays. One object's journey carries the whole mechanism.
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

// The "ten months" timeline HUD fills across the silent stretch and
// completes exactly as the review (Beat 6) begins.
export const MONTHS_FILL_START = TIMELINE["beat-04"].from;
export const MONTHS_FILL_END = TIMELINE["beat-06"].from;

// Camera targets are DERIVED from which persona(s) a beat is actually about —
// never hand-picked pixel coordinates. One focus node: center on it, tight.
// Two: center on their midpoint, zoomed to fit both with even margin. Zero
// ("wide"/"reveal"): center on the whole layout's centroid, zoomed out. This
// is what guarantees the framing is always accurately centered on whoever is
// being discussed, and zooms out the moment nobody specific is.
type Focus = NodeId[] | "wide" | "reveal";

const FOCUS_BY_BEAT: Record<string, Focus> = {
  "beat-01": ["engineer"], // she built it
  "beat-02": ["manager", "leadership"], // he praises it to leadership
  "beat-03": ["manager", "engineer"], // he never told her / he assumed
  "beat-04": ["manager", "engineer"], // the day-to-day churn between them
  "beat-05": ["manager", "engineer"], // she asks him, he answers
  "beat-06": "reveal", // the whole system, revealed
  "beat-07": "wide", // dedicated verdict-split scene takes over the screen
  "beat-08": "wide", // dedicated reinforcement-list scene takes over the screen
  "beat-09": "wide", // the operational close
};

const TIGHT_ZOOM = 1.8;
const WIDE_ZOOM = 0.85;
const REVEAL_ZOOM = 0.72;
const PAIR_ON_SCREEN_SPAN = 760; // desired px distance between two focus nodes
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
// identical x/y/zoom, so the camera genuinely parks on target — interpolating
// between two equal values holds still — instead of perpetually easing
// toward the next one. This is what makes the Beat 6 reveal (must not move at
// all while the connector draws) and Beat 5's flat hold under "You're doing
// fine." actually static, not just slow.
const TRANSITION = 40;
const CAMERA_KEYFRAMES: Array<{ frame: number; target: { x: number; y: number; zoom: number } }> = [];

BEAT_ORDER.forEach((id, i) => {
  const t = TIMELINE[id];
  const target = cameraTarget(FOCUS_BY_BEAT[id]);
  const isFirst = i === 0;
  const isLast = i === BEAT_ORDER.length - 1;
  const arrive = isFirst ? t.from : t.from + TRANSITION;
  const hold = isLast ? t.from + t.duration : t.from + t.duration - TRANSITION;
  CAMERA_KEYFRAMES.push({ frame: arrive, target });
  CAMERA_KEYFRAMES.push({ frame: hold, target });
});

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

// The one phrase per beat that gets semantic-emphasis (accent) treatment in
// the caption. Everything else about the caption's TEXT is derived live from
// BEATS' real words (see sentences.ts) — never hand-typed here — so it can
// never drift from what's actually spoken. Beats 7-9 render their own
// dedicated full-screen treatments instead of the generic caption, so they
// have no entry here.
export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "validation system",
  "beat-02": "leadership call",
  "beat-03": "He assumed she already knew",
  "beat-04": "preventive work went unnoticed",
  "beat-06": "one of her strongest contributions",
};
