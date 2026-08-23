import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "manager" | "firstLead" | "secondLead";

// Manager is the hub, both leads fan out below — a three-node version of
// the hub-spoke shape used elsewhere in this format (HowToBeUnderstood,
// LeadWithWhatMatters). Wide horizontal spread between the two leads
// (1280 world-units apart) so a pair(manager, firstLead) or
// pair(manager, secondLead) shot excludes the OTHER lead at a real zoom
// margin, not a razor-thin one — verified in tests/frame-fit.test.ts
// against these exact coordinates, not eyeballed.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  manager: { x: 960, y: 220, label: "Manager" },
  firstLead: { x: 320, y: 860, label: "First Lead" },
  secondLead: { x: 1600, y: 860, label: "Second Lead" },
};

// Centroid of all three nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 647 };

export const CONNECTOR_DRAW_DURATION = 40;

// Beat 1 — the first lead's claim, the only real contact she has with the
// manager until this point.
export const MANAGER_FIRSTLEAD_DRAW_START = frameOfWord("beat-01", "first");

// Beat 2 — the second lead's claim.
export const MANAGER_SECONDLEAD_DRAW_START = frameOfWord("beat-02", "second");

// Beat 5 — the round-1 resolution. The contested engineer packet (spawned
// at Beat 3, see PACKET1_SPAWN below) finally travels from Manager to
// Second Lead exactly as "won the engineer" lands, becoming the one
// accent+glow treatment reserved for an actual delivered decision. First
// Lead's connector and node dim from the same moment — "out of the loop"
// on this particular claim, not erased (see the skill's "Node occlusion":
// dim only ever changes stroke/text color, never fill opacity).
export const PACKET1_TRAVEL_START = frameOfWord("beat-05", "engineer.");
export const PACKET1_TRAVEL_DURATION = 60;
export const FIRSTLEAD_LOST_AT = frameOfWord("beat-05", "other");

// Beat 3 — the argument itself: the contested resource first appears,
// sitting unresolved between both claims (a diamond marker at Manager, not
// yet at either lead — neither claim has actually been granted yet).
export const PACKET1_SPAWN = TIMELINE["beat-03"].from;

// Beat 6 — a second, different specialist, the SAME shape recurring: a
// fresh diamond spawns at Manager and stays there, deliberately
// unresolved, since the essay's point here is the pattern repeating, not
// who wins this round.
export const PACKET2_SPAWN = frameOfWord("beat-06", "specialist.");

// Packets sit in a fixed "contested" slot at the centroid of all three
// nodes — equidistant from Manager and both leads, genuinely up for grabs.
// A slot directly above Manager was tried first and measured off-canvas at
// the WIDE camera's zoom (Manager already sits close to the frame's top
// edge there — see PersonNode's real footprint in frameFit.ts): visible
// only during the brief pair-shot travel animation, never during the WIDE
// beats (3, 5's reflective half, 6) where it actually needs to read as
// sitting contested. The centroid is confirmed on-canvas at every shot
// that renders it (WIDE and both pair shots).
export const CONTESTED_SLOT = CENTER;

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see src/lib/Camera.ts) so pans read as the camera
// sweeping across the layout, not cutting between positions.
// WIDE is a 0-focus shot derived from the layout itself (nothing to
// exclude). REVEAL is a DELIBERATELY wider Mechanism-Reveal shot — a
// creative choice, not a safety-derived one — so it stays an explicit
// constant rather than routing through fitCameraToFocus, which would just
// collapse it to WIDE's own zoom.
const wideFit = fitCameraToFocus(NODES, []);
const WIDE = { x: wideFit.x, y: wideFit.y, zoom: wideFit.zoom };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.7 };

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
const b6 = TIMELINE["beat-06"];
const b9 = TIMELINE["beat-09"];

const firstCue = MANAGER_FIRSTLEAD_DRAW_START;
const secondCue = MANAGER_SECONDLEAD_DRAW_START;
const choseCue = frameOfWord("beat-05", "chose");
const disagreementCue = frameOfWord("beat-05", "disagreement");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — introduce Manager, then pan to the pair as the first lead's
  // claim lands.
  { frame: b1.from, target: tight("manager") },
  { frame: firstCue - FAST, target: tight("manager") },
  { frame: firstCue, target: pair("manager", "firstLead") },
  { frame: b1.from + b1.duration - SLOW, target: pair("manager", "firstLead") },

  // Beat 2 — pan to Manager / Second Lead as the second claim lands.
  { frame: secondCue - FAST, target: pair("manager", "firstLead") },
  { frame: secondCue, target: pair("manager", "secondLead") },
  { frame: b2.from + b2.duration - SLOW, target: pair("manager", "secondLead") },

  // Beat 3 — the argument itself is about all three at once: true hold,
  // wide.
  { frame: b3.from, target: WIDE },
  { frame: b3.from + b3.duration, target: WIDE },

  // Beat 4 is a dedicated scene (world hidden) — no camera change needed;
  // the value coasts under the invisible diagram.

  // Beat 5 — reestablish wide, pan tight onto the actual decision as it's
  // made, then pull back wide for the reflective back half ("the same
  // long-running problems were never addressed").
  { frame: b5.from, target: WIDE },
  { frame: choseCue - FAST, target: WIDE },
  { frame: choseCue, target: pair("manager", "secondLead") },
  { frame: disagreementCue - FAST, target: pair("manager", "secondLead") },
  { frame: disagreementCue, target: WIDE },
  { frame: b5.from + b5.duration, target: WIDE },

  // Beat 6 — the recurrence: no new keyframe needed, the WIDE hold from
  // Beat 5's end carries straight through (this is what keeps it a true
  // hold, not a drift).
  { frame: b6.from + b6.duration, target: WIDE },

  // Beats 7-8 are dedicated scenes (world hidden) — no camera change
  // needed.

  // Beat 9 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity at once.
  { frame: b9.from, target: REVEAL },
  { frame: b9.from + b9.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: REVEAL },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "a commitment that was part of an approved plan.",
  "beat-02": "a message from management, promising that same engineer to support an urgent release.",
  "beat-03": "a strong enough argument might reveal which project actually deserved the engineer.",
  "beat-05": "kept fighting it out on the department's behalf.",
  "beat-06": "both could point to a legitimate commitment.",
  "beat-09": "nobody held clear authority to decide which commitment took priority.",
  "beat-10": "what that decision resolves.",
  "beat-12": "only fed your ego.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// dips fully invisible for Beat 4's dedicated list scene, returns for
// Beats 5-6, dips again for Beats 7-8's dedicated split/quote scenes,
// returns for Beat 9's Reveal, then goes fully invisible for good once
// Beat 10 takes over — Beats 10-12 (LongFormScene/split, pure reflective
// narration) and the CTA never need it back, so that stretch stays at a
// literal 0, not a faint residual.
const b4 = TIMELINE["beat-04"];
const b7 = TIMELINE["beat-07"];
const b10 = TIMELINE["beat-10"];
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b4.from,
  b4.from + 15,
  b5.from,
  b5.from + 15,
  b7.from - 20,
  b7.from,
  b9.from - 20,
  b9.from,
  b10.from - 20,
  b10.from,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
