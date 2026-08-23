import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "developer" | "manager" | "leadership" | "colleagues";

// Developer is the hub: Manager, Leadership and Colleagues never speak to
// each other — every real contact in this story passes through Developer.
// A star layout (Developer centered, three satellites at wide angles, not a
// quadrilateral's diagonal corners) so every hub/satellite pair shot
// excludes the other two satellites at the zoom fitCameraToFocus actually
// computes — verified by hand (excludesNonFocus checked for tight(developer)
// and all three pair() combinations) before committing to these coordinates;
// a diagonal-corner layout tried first (mirroring HoldYourStandards' 4-node
// quadrilateral) leaked the two off-axis nodes into the developer/leadership
// pair shot, since that pair sat on the layout's own diagonal.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  developer: { x: 960, y: 540, label: "Developer" },
  manager: { x: 960, y: 90, label: "Manager" },
  leadership: { x: 1560, y: 840, label: "Leadership" },
  colleagues: { x: 360, y: 840, label: "Colleagues" },
};

// Centroid of all four nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 577.5 };

export const CONNECTOR_DRAW_DURATION = 40;

// Beat 1 — Developer's first real mention of a colleague ("never stopped to
// answer a colleague's question"): the earliest real contact this story
// gives Developer <-> Colleagues, so the connector draws in here, not at
// frame 0.
export const COLLEAGUES_DRAW_START = frameOfWord("beat-01", "colleague's");

// Beat 2 — the manager's first real contact: sitting him down.
export const MANAGER_DRAW_START = frameOfWord("beat-02", "sat");

// Beat 3 — senior leaders enter the story for the first time, citing his
// numbers.
export const LEADERSHIP_DRAW_START = frameOfWord("beat-03", "Senior");

// Beat 6 — the exact moment the Colleagues connector breaks: they stop
// approaching him.
export const COLLEAGUES_BREAK_CUE = frameOfWord("beat-06", "stopped");

// Beat 8 — the Mechanism Reveal's own cue word: the Developer <-> Leadership
// connector (already drawn since Beat 3, plain) gains its permanent accent +
// glow treatment exactly as the narration names the reward. Not a new
// connector and not a transient pulse like HoldYourStandards' callback — the
// two of them DO have a real, ongoing channel (his numbers, reported
// upward), so this is that same connector being reinforced, permanently,
// the moment the essay says so.
export const REVEAL_ACCENT_CUE = frameOfWord("beat-08", "rewarding.");

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see src/lib/Camera.ts) so pans read as the camera
// sweeping across the layout, not cutting between positions.
// REVEAL is a 0-focus shot, deliberately wider than the idle wide framing
// (computed wide zoom ~= 0.995) since it's the one moment that needs to show
// everything at once with room to spare — a creative choice, kept as an
// explicit constant rather than routed through fitCameraToFocus.
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.75 };

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
const b4 = TIMELINE["beat-04"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];
const b7 = TIMELINE["beat-07"];
const b8 = TIMELINE["beat-08"];
const b9 = TIMELINE["beat-09"];

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — tight on Developer, then pan to the Developer/Colleagues pair
  // exactly as that connector draws ("a colleague's question").
  { frame: b1.from, target: tight("developer") },
  { frame: COLLEAGUES_DRAW_START - FAST, target: tight("developer") },
  { frame: COLLEAGUES_DRAW_START, target: pair("developer", "colleagues") },
  { frame: b2.from - SLOW, target: pair("developer", "colleagues") },

  // Beat 2 — the manager's ask: pair on Developer/Manager.
  { frame: b2.from, target: pair("developer", "manager") },
  { frame: b3.from - SLOW, target: pair("developer", "manager") },

  // Beat 3 — starts on Developer/Manager ("his manager praised..."), pans to
  // Developer/Leadership as senior leaders enter.
  { frame: b3.from, target: pair("developer", "manager") },
  { frame: LEADERSHIP_DRAW_START - FAST, target: pair("developer", "manager") },
  { frame: LEADERSHIP_DRAW_START, target: pair("developer", "leadership") },
  { frame: b4.from - SLOW, target: pair("developer", "leadership") },

  // Beat 4 — the internal cost calculus is Developer's own, not a specific
  // relationship: tight and held for the whole beat. Beat 5 (the "So the
  // feedback changed nothing" punchline) is a dedicated scene with the world
  // hidden — no camera keyframe needed there; the point below simply carries
  // the hold underneath it, invisibly, until Beat 6's own arrival point.
  { frame: b4.from, target: tight("developer") },
  { frame: b4.from + b4.duration, target: tight("developer") },

  // Beat 6 — the break: pair on Developer/Colleagues, held while the
  // connector itself (not the camera) shows the relationship fading.
  { frame: b6.from, target: pair("developer", "colleagues") },
  { frame: b7.from - SLOW, target: pair("developer", "colleagues") },

  // Beat 7 — the repeated, ineffective nagging: pair on Developer/Manager.
  { frame: b7.from, target: pair("developer", "manager") },
  { frame: b8.from - SLOW, target: pair("developer", "manager") },

  // Beat 8 — the Mechanism Reveal: true hold, wide, while the Leadership
  // connector gains its accent treatment on "rewarding."
  { frame: b8.from, target: REVEAL },
  { frame: b8.from + b8.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: REVEAL },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "closed more tickets than anyone else.",
  "beat-02": "asked him to be a team player.",
  "beat-03": "his name carried the strongest case anyone could point to.",
  "beat-04": "every visible reward in the building told him to protect his time and maximize his own output.",
  "beat-06": "His ticket count still looked excellent — while the team quietly got slower around him.",
  "beat-07": "behavior the company said it valued — and never once measured.",
  "beat-08": "behavior your environment keeps rewarding.",
  "beat-09": "His manager still had to name that conduct directly, set a boundary, and enforce it.",
  "beat-10": "weak leadership.",
  "beat-11": "It turns dangerous the moment it starts carrying status, promotion, and protection.",
  "beat-14": "the system wins.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins, dips
// fully invisible for Beat 5's dedicated quote scene, returns for Beat 6
// through Beat 8's Reveal, then goes fully invisible for good once Beat 9's
// reflective run takes over — Beats 9-15 (accountability, reframe,
// correction, the scorecard list, the diagnostic split, the final thesis,
// and the CTA) never need it back, so that stretch stays at a literal 0, not
// a faint residual.
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b5.from - 20,
  b5.from,
  b6.from - 15,
  b6.from,
  b9.from - 20,
  b9.from,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
