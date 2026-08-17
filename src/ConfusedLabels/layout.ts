import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline";

// Same base palette as the other essay videos, for series continuity.
export const BG = "#14110F";
export const TEXT = "#F2EDE4";
export const DIM_TEXT = "#8A8377";
export const ACCENT = "#E8A33D";
export const LINE_INACTIVE = "#3A342C";
export const LINE_ACTIVE = "#B9B2A6";

export type NodeId = "architect" | "pm" | "delivery" | "engineering";

// Fixed world-space coordinates, arranged as a diamond around a shared
// center point (960, 540) where the undefined "object" starts out. The
// camera moves over this fixed layout; the layout itself never changes.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  architect: { x: 500, y: 260, label: "Architect" },
  pm: { x: 1420, y: 260, label: "Product Manager" },
  delivery: { x: 500, y: 820, label: "Delivery" },
  engineering: { x: 1420, y: 820, label: "Engineering" },
};

export const CENTER = { x: 960, y: 540 };

// Each person's "copy" of the object sits halfway between the shared center
// and that person's own position once fully diverged — close enough to read
// as "theirs," far enough from center that four distinct objects are
// unambiguous.
export const OBJECT_DIVERGED: Record<NodeId, { x: number; y: number }> = Object.fromEntries(
  (Object.keys(NODES) as NodeId[]).map((id) => {
    const n = NODES[id];
    return [id, { x: CENTER.x + (n.x - CENTER.x) * 0.55, y: CENTER.y + (n.y - CENTER.y) * 0.55 }];
  }),
) as Record<NodeId, { x: number; y: number }>;

// Divergence T: 0 = one shared object (all four copies stacked exactly on
// the center point, reading as one), 1 = four fully separate objects. Ramps
// partway during Beat 4 (each person's technical decision quietly pulls
// their copy away from center) and completes during Beat 5 exactly as
// "different projects" is spoken — the reveal. Deliberately linear (see
// World.tsx) rather than eased.
export const DIVERGE_RAMP1_START = TIMELINE["beat-04"].from;
export const DIVERGE_RAMP1_END = TIMELINE["beat-04"].from + TIMELINE["beat-04"].duration;
export const DIVERGE_RAMP2_END = frameOfWord("beat-05", "projects,", "end");
export const DIVERGE_FRAMES = [DIVERGE_RAMP1_START, DIVERGE_RAMP1_END, DIVERGE_RAMP2_END];
export const DIVERGE_VALUES = [0, 0.4, 1];

// Name tags: what each person calls the undefined object, appearing at
// their real word timestamp in Beat 1, and staying on screen after — once
// named, the label doesn't go away.
export const NAME_LABELS: Record<NodeId, { text: string; frame: number }> = {
  architect: { text: "module", frame: frameOfWord("beat-01", "architect") },
  pm: { text: "platform", frame: frameOfWord("beat-01", "product", "start", 1) },
  delivery: { text: "component", frame: frameOfWord("beat-01", "delivery") },
  engineering: { text: "the new reporting thing", frame: frameOfWord("beat-01", "engineers") },
};

// Decision tags: the technical decision each person's private definition
// quietly produced, from Beat 4's real word timestamps.
export const DECISION_LABELS: Record<NodeId, { text: string; frame: number }> = {
  architect: { text: "reuse permissions", frame: frameOfWord("beat-04", "permissions,", "end") },
  pm: { text: "separate user management", frame: frameOfWord("beat-04", "separate") },
  delivery: { text: "part of current work", frame: frameOfWord("beat-04", "one") },
  engineering: { text: "own deployment pipeline?", frame: frameOfWord("beat-04", "deployment") },
};

// Camera keyframes: each target is TWO breakpoints (arrive, then hold-until)
// carrying the identical x/y/zoom, so the camera genuinely parks on target.
// Beats 1 and 4 each introduce/discuss all four people in sequence, so they
// get four holds cued to each person's real name timestamp, instead of one
// static framing for the whole beat. FAST/SLOW are deliberately long and use
// an ease-in-out curve (see Camera.ts) so these read as the camera panning
// across the layout, not cutting between positions.
const WIDE = { x: CENTER.x, y: CENTER.y, zoom: 0.9 };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.78 };
const TIGHT_ZOOM = 2.0;
const tight = (id: NodeId) => ({ x: NODES[id].x, y: NODES[id].y, zoom: TIGHT_ZOOM });

const FAST = 48; // a genuine pan between the four people within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b4 = TIMELINE["beat-04"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];

const archCue1 = frameOfWord("beat-01", "architect");
const pmCue1 = frameOfWord("beat-01", "product", "start", 1);
const delCue1 = frameOfWord("beat-01", "delivery");
const engCue1 = frameOfWord("beat-01", "engineers");

const archCue4 = frameOfWord("beat-04", "architect");
const pmCue4 = frameOfWord("beat-04", "product");
const delCue4 = frameOfWord("beat-04", "Delivery");
const engCue4 = frameOfWord("beat-04", "engineering");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  { frame: TIMELINE["beat-01"].from, target: WIDE },
  { frame: archCue1 - FAST, target: WIDE },
  { frame: archCue1, target: tight("architect") },
  { frame: pmCue1 - FAST, target: tight("architect") },
  { frame: pmCue1, target: tight("pm") },
  { frame: delCue1 - FAST, target: tight("pm") },
  { frame: delCue1, target: tight("delivery") },
  { frame: engCue1 - FAST, target: tight("delivery") },
  { frame: engCue1, target: tight("engineering") },
  { frame: b1.from + b1.duration - SLOW, target: tight("engineering") },
  { frame: b1.from + b1.duration, target: WIDE },
  { frame: archCue4 - FAST, target: WIDE },
  { frame: archCue4, target: tight("architect") },
  { frame: pmCue4 - FAST, target: tight("architect") },
  { frame: pmCue4, target: tight("pm") },
  { frame: delCue4 - FAST, target: tight("pm") },
  { frame: delCue4, target: tight("delivery") },
  { frame: engCue4 - FAST, target: tight("delivery") },
  { frame: engCue4, target: tight("engineering") },
  { frame: b4.from + b4.duration - SLOW, target: tight("engineering") },
  { frame: b5.from, target: REVEAL },
  { frame: b5.from + b5.duration, target: REVEAL },
  { frame: b6.from + SLOW, target: WIDE },
  { frame: TOTAL_DURATION, target: WIDE },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-02": "Nobody stopped the conversation",
  "beat-05": "different projects",
  "beat-06": "without ever resolving",
  "beat-08": "talking about different things",
};

// The diagram is invisible through the Hook (it has nothing to show yet),
// fades in as Beat 1 begins, stays in the foreground through the one-case
// story (Beats 1-6), then recedes once Beat 7's verdict-split scene takes
// over — and stays receded (Beat 9's checklist scene is dedicated too, and
// Beat 8's generic caption reads fine over a dim backdrop, as does the
// closing thesis and CTA) rather than flickering back and forth.
export const WORLD_FADE_IN_START = TIMELINE["beat-01"].from;
export const WORLD_DIM_START = TIMELINE["beat-07"].from;

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see World.tsx /
// Hud.tsx). Kept here as the one shared source of truth for both.
export const DIAGRAM_SCALE = 0.75;
export const CAPTION_TOP = 860;
