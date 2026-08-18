import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "lead" | "eng1" | "eng2" | "eng3";
export const ENGINEER_IDS: NodeId[] = ["eng1", "eng2", "eng3"];

// Fixed world-space coordinates: the lead at the top, three engineers fanned
// out below him — a hub with three spokes, matching the story's actual
// shape (one proposal, three separate people each forming their own
// understanding of it). The camera moves over this fixed layout; the layout
// itself never changes.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  lead: { x: 960, y: 260, label: "Team Lead" },
  eng1: { x: 460, y: 820, label: "Engineer 1" },
  eng2: { x: 960, y: 900, label: "Engineer 2" },
  eng3: { x: 1460, y: 820, label: "Engineer 3" },
};

// Centroid of all four nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 700 };

// Beat 2 — each engineer's opening question, tagged at its own real word
// timestamp. This is the first real contact between lead and each engineer,
// so this is also when each connector draws on (see World.tsx).
export const CONCERN_LABELS: Record<NodeId | "lead", { text: string; frame: number } | null> = {
  lead: null,
  eng1: { text: "accountability", frame: frameOfWord("beat-02", "accountable") },
  eng2: { text: "knowledge", frame: frameOfWord("beat-02", "knowledge") },
  eng3: { text: "warning", frame: frameOfWord("beat-02", "warning") },
};

// Beat 5 (told in the dedicated ListScene) revealed what each engineer
// actually believed the proposal meant. Those beliefs have no home in the
// diagram until the world reappears for Beat 6's reveal — so they fade in
// at the start of that beat, alongside the wrong-belief packets, rather
// than at a word cue inside Beat 6 itself (the words were already spoken).
export const BELIEF_LABELS: Record<NodeId | "lead", string | null> = {
  lead: null,
  eng1: "teams disappear",
  eng2: "compulsory rotation",
  eng3: "no warning",
};

// Connector draw-on: each line grows from the lead toward the engineer who
// asked that question, in the true direction the proposal is travelling.
export const CONNECTOR_DRAW_DURATION = 40;
export const CONNECTOR_DRAW_START: Record<NodeId, number | null> = {
  lead: null,
  eng1: CONCERN_LABELS.eng1!.frame,
  eng2: CONCERN_LABELS.eng2!.frame,
  eng3: CONCERN_LABELS.eng3!.frame,
};

// Connector "health": solid neutral through most of the video, sagging
// during Beat 4 as the same explanation repeats without landing, recovering
// only partway by the beat's end ("nothing changed") — then reset to full
// health once the world reappears for the Reveal (the jump is hidden behind
// the wipe covering Beat 5's dedicated scene, so it never reads as a cut).
const b4 = TIMELINE["beat-04"];
const b6 = TIMELINE["beat-06"];
export const CONNECTOR_HEALTH_FRAMES = [
  b4.from,
  b4.from + Math.round(b4.duration * 0.4),
  b4.from + b4.duration,
  b6.from,
];
export const CONNECTOR_HEALTH_VALUES = [0.7, 0.35, 0.55, 0.7];

// Beat 6 — the true proposal, finally travelling the same three connectors.
// Reserve the accent + glow treatment for this: the one thing this video is
// actually about is the correct proposal versus what each person separately
// believed.
export const TRUE_PACKET_TRAVEL_START = frameOfWord("beat-06", "temporary");
export const TRUE_PACKET_TRAVEL_DURATION = 60;

// The three wrong-belief packets appear together as the world reappears —
// neutral, no glow, sitting a fixed offset above each engineer, visible
// alongside the true packet for the rest of the Reveal rather than being
// dismissed, because the essay never claims the misunderstanding is
// corrected in the moment — only that the gap is finally visible.
export const WRONG_PACKET_FADE_START = b6.from;
export const WRONG_PACKET_FADE_DURATION = 20;

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see Camera.ts) so pans read as the camera sweeping
// across the layout, not cutting between positions.
// WIDE/REVEAL are 0-focus shots (nothing to exclude — everyone's included
// by definition), and REVEAL's deliberate "wider than idle wide" framing
// is a creative choice, not a safety-derived one — both stay explicit
// constants rather than going through fitCameraToFocus's generic 0-focus
// path, which would collapse them to the same zoom.
const WIDE = { x: CENTER.x, y: CENTER.y, zoom: 0.85 };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.7 };

// maxZoom: 2.3, not the fitCameraToFocus default of 2.0 — this layout's
// Engineer 1 / Engineer 2 are only 80 world-units apart vertically (though
// 500 apart horizontally), so the default cap left Engineer 2 bleeding
// into a tight Engineer 1 shot (found via fitCameraToFocus's own exclusion
// check, confirmed by rendering a still — a real, pre-existing bug, not
// introduced by this retrofit). 2.3 is verified (see
// tests/frame-fit.test.ts) to exclude correctly for all four tight shots
// in this layout.
const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id], { maxZoom: 2.3 });
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b2 = TIMELINE["beat-02"];

const sharingCue1 = frameOfWord("beat-01", "Sharing");
const accCue2 = frameOfWord("beat-02", "accountable");
const knowCue2 = frameOfWord("beat-02", "knowledge");
const warnCue2 = frameOfWord("beat-02", "warning");
const nothingCue4 = frameOfWord("beat-04", "Nothing");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — introduce the lead, then pull wide for the systemic statement.
  { frame: b1.from, target: tight("lead") },
  { frame: sharingCue1 - FAST, target: tight("lead") },
  { frame: sharingCue1, target: WIDE },
  { frame: b1.from + b1.duration - SLOW, target: WIDE },

  // Beat 2 — pan lead -> engineer 1 -> engineer 2 -> engineer 3 as each
  // question lands. Holds WIDE from Beat 1's end (no new keyframe needed —
  // interpolating WIDE-to-WIDE is a flat hold) until the first pan below.
  { frame: accCue2 - FAST, target: WIDE },
  { frame: accCue2, target: tight("eng1") },
  { frame: knowCue2 - FAST, target: tight("eng1") },
  { frame: knowCue2, target: tight("eng2") },
  { frame: warnCue2 - FAST, target: tight("eng2") },
  { frame: warnCue2, target: tight("eng3") },
  { frame: b2.from + b2.duration - SLOW, target: tight("eng3") },
  { frame: b2.from + b2.duration, target: WIDE },

  // Beat 3 — he's addressing the whole team, not one person: no new
  // keyframe needed, the WIDE hold from Beat 2's end carries straight
  // through (this is what keeps it a true hold, not a drift).

  // Beat 4 — tight on the lead through his growing impatience, then pull
  // wide exactly on "Nothing" for the deadpan hold on the stalled system.
  // The pan into tight(lead) starts near the tail of Beat 3 and lands
  // exactly at Beat 4's start.
  { frame: b4.from - SLOW, target: WIDE },
  { frame: b4.from, target: tight("lead") },
  { frame: nothingCue4 - SLOW, target: tight("lead") },
  { frame: nothingCue4, target: WIDE },

  // Beat 5 is a dedicated scene (world dimmed) — no camera change needed;
  // the value coasts under the invisible diagram until Beat 6 re-arrives.

  // Beat 6 — the Mechanism Reveal: true hold, wider than the idle wide shot,
  // showing every entity at once.
  { frame: b6.from, target: REVEAL },
  { frame: b6.from + b6.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: WIDE },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-04": "Nothing changed.",
  "beat-06": "Each person was resisting a different outcome",
  "beat-08": "you're arguing with interpretations you haven't heard",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// dips fully invisible for Beat 5's dedicated list scene, returns for Beat
// 6's reveal, then goes fully invisible again once Beat 7's split scene
// takes over — and stays that way through Beats 8-9 (pure reflective
// narration, LongFormScene) and the CTA. A faint (~0.04) residual behind
// long-form standalone text reads as visible clutter once nothing else is
// on screen to justify it, so this stretch is 0, not merely dim.
const b5 = TIMELINE["beat-05"];
const b7 = TIMELINE["beat-07"];
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b5.from,
  b5.from + 15,
  b6.from - 5,
  b6.from + 15,
  b7.from,
  b7.from + 40,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
