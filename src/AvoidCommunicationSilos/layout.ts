import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "design" | "operations" | "engineering";

// Design sits at the hub: it is the only role that has spoken to both other
// roles across the whole causal chain. Operations and Engineering never
// connect directly until the Mechanism Reveal — that missing bottom edge of
// the triangle IS the mechanism this video is about.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  design: { x: 960, y: 320, label: "Design" },
  operations: { x: 560, y: 820, label: "Operations" },
  engineering: { x: 1360, y: 820, label: "Engineering" },
};

// Centroid of all three nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 653 };

// Beat 1 — the two connectors that exist for most of the video, in the true
// order the story forms them: design<->operations first (the initial
// meeting), design<->engineering second (once requirements are sent).
// Engineering<->operations does not exist yet — no line is drawn for it —
// until the Reveal beat below.
export const CONNECTOR_DRAW_DURATION = 40;
export const DESIGN_OPERATIONS_DRAW_START = frameOfWord("beat-01", "operations");
export const DESIGN_ENGINEERING_DRAW_START = frameOfWord("beat-01", "engineering,");

// The Reveal's payoff connector: operations<->engineering draws in fresh,
// live, exactly when the three roles join the same call — this is the one
// new piece of contact the whole essay has been building toward, so it gets
// the accent + glow treatment reserved for "the one thing this video is
// actually about."
export const OPS_ENGINEERING_DRAW_START = frameOfWord("beat-07", "joined");
export const OPS_ENGINEERING_DRAW_DURATION = 45;

// The question packet's continuous journey. Four hops in Beat 2 (the first,
// resolved round trip: Engineering asks, Design carries it to Operations
// and back, then delivers it to Engineering), then one final hop in Beat 3
// that never completes — the packet arrives at Design and stays there,
// unresolved, straight through Beats 4-5 (the meeting pileup and the
// context-loss beats), until the Reveal makes it moot.
export type Hop = { from: NodeId; to: NodeId; start: number; duration: number };
const HOP_DURATION = 36;
export const QUESTION_JOURNEY: Hop[] = [
  { from: "engineering", to: "design", start: frameOfWord("beat-02", "asked"), duration: HOP_DURATION },
  { from: "design", to: "operations", start: frameOfWord("beat-02", "follow-up"), duration: HOP_DURATION },
  { from: "operations", to: "design", start: frameOfWord("beat-02", "updated"), duration: HOP_DURATION },
  { from: "design", to: "engineering", start: frameOfWord("beat-02", "booked"), duration: HOP_DURATION },
  { from: "engineering", to: "design", start: frameOfWord("beat-03", "asked"), duration: HOP_DURATION },
];

// The stuck packet dissolves right as the Reveal's direct connector starts
// drawing — the old, slow route is rendered moot by the new, direct one in
// the same instant.
export const QUESTION_FADE_OUT_START = OPS_ENGINEERING_DRAW_START;
export const QUESTION_FADE_OUT_DURATION = 20;

// The resolved packet: the correction detail, finally travelling the direct
// route, the moment the operator opens the system and walks the engineer
// through it.
export const RESOLVED_PACKET_START = frameOfWord("beat-07", "opened");
export const RESOLVED_PACKET_DURATION = 55;

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see src/lib/Camera.ts) so pans read as the camera
// sweeping across the layout, not cutting between positions.
// WIDE/REVEAL are 0-focus shots (nothing to exclude), and REVEAL's
// deliberate "wider than idle wide" framing is a creative choice, not a
// safety-derived one — both stay explicit constants.
const WIDE = { x: CENTER.x, y: CENTER.y, zoom: 0.85 };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.72 };

// fitCameraToFocus's defaults (verified in tests/frame-fit.test.ts against
// this exact layout) already exclude the third node cleanly for every
// tight()/pair() shot below — see the skill's "Camera — derive the
// target."
const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id]);
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};
const pair = (a: NodeId, b: NodeId) => {
  const fit = fitCameraToFocus(NODES, [a, b]);
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b2 = TIMELINE["beat-02"];
const b3 = TIMELINE["beat-03"];
const b5 = TIMELINE["beat-05"];
const b7 = TIMELINE["beat-07"];

const designEngCue1 = DESIGN_ENGINEERING_DRAW_START;
const askedCue2 = frameOfWord("beat-02", "asked");
const followUpCue2 = frameOfWord("beat-02", "follow-up");
const explainedCue2 = frameOfWord("beat-02", "explained");
const bookedCue2 = frameOfWord("beat-02", "booked");
const askedCue3 = frameOfWord("beat-03", "asked");
const notSecondCue3 = frameOfWord("beat-03", "Not");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — the design/operations meeting, then the pan to design/
  // engineering once requirements are sent.
  { frame: b1.from, target: pair("design", "operations") },
  { frame: designEngCue1 - FAST, target: pair("design", "operations") },
  { frame: designEngCue1, target: pair("design", "engineering") },
  { frame: b1.from + b1.duration - SLOW, target: pair("design", "engineering") },

  // Beat 2 — the question's full round trip: engineering -> design ->
  // operations -> design -> engineering, the camera following each hop.
  { frame: askedCue2 - FAST, target: tight("engineering") },
  { frame: askedCue2, target: tight("design") },
  { frame: followUpCue2 - FAST, target: tight("design") },
  { frame: followUpCue2, target: tight("operations") },
  { frame: explainedCue2 - FAST, target: tight("operations") },
  { frame: explainedCue2, target: tight("design") },
  { frame: bookedCue2 - FAST, target: tight("design") },
  { frame: bookedCue2, target: tight("engineering") },
  { frame: b2.from + b2.duration - SLOW, target: tight("engineering") },

  // Beat 3 — the second question arrives, then a true hold on Design for
  // the deadpan "Not the second." — the exact moment the courier model
  // starts to strain.
  { frame: askedCue3 - FAST, target: tight("engineering") },
  { frame: askedCue3, target: tight("design") },
  { frame: notSecondCue3 - SLOW, target: tight("design") },
  { frame: notSecondCue3, target: tight("design") },
  { frame: b3.from + b3.duration, target: tight("design") },

  // Beat 4 is a dedicated scene (world hidden) — no camera change needed.

  // Beat 5 — systemic, not about one pair: wide for the whole beat.
  { frame: b5.from, target: WIDE },
  { frame: b5.from + b5.duration, target: WIDE },

  // Beat 6 is a dedicated scene (world hidden) — no camera change needed.

  // Beat 7 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity at once while the new connector draws.
  { frame: b7.from, target: REVEAL },
  { frame: b7.from + b7.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: REVEAL },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-02": "The designers didn't know.",
  "beat-03": "Not the second.",
  "beat-05": "Each handoff removed context.",
  "beat-07": "took minutes to resolve",
  "beat-09": "Record the decisions — then let everyone leave and do the work.",
  "beat-10": "Simply stop designing calendars around the handoff.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// dips fully invisible for Beat 4's dedicated list scene, returns for
// Beat 5, dips again for Beat 6's dedicated quote scene, returns for Beat
// 7's Reveal, then goes fully invisible for good once Beat 8's split scene
// takes over — Beats 8-10 (SplitArgumentScene, then pure reflective
// LongFormScene narration) and the CTA never need it back, so that stretch
// stays at a literal 0, not a faint residual.
const b4 = TIMELINE["beat-04"];
const b6 = TIMELINE["beat-06"];
const b8 = TIMELINE["beat-08"];
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b4.from,
  b4.from + 15,
  b5.from,
  b5.from + 15,
  b6.from,
  b6.from + 15,
  b7.from,
  b7.from + 20,
  b8.from - 20,
  b8.from,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
