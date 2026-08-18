import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "mgmt" | "team" | "operations" | "dept" | "prod" | "arch";

// Management issues the instruction; the team builds without asking why;
// when the finished product has no named owner, the hunt cascades through
// four more roles, each redirecting to the next — the exact chain the essay
// describes (project manager -> operations -> department head -> product
// management -> architect). "Project manager" is treated as the team acting
// on its own behalf, not a separate node — the essay never gives the PM a
// relationship distinct from the team's.
// Vertical/horizontal spacing verified against fitCameraToFocus's corrected
// margin (which now accounts for PersonNode's label sitting below its
// circle, not just the circle — see frameFit.ts). A node positioned NORTH
// of a tight/pair shot's focus is the hard case: its label reaches DOWN,
// toward the focus, so excluding it needs more real vertical separation
// than excluding a node to the south. mgmt/team and team/the cascade row
// are both north-south relationships, so both got extra vertical room
// (verified with real safety buffers, not razor-thin passes, in
// tests/frame-fit.test.ts).
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  mgmt: { x: 960, y: 60, label: "Management" },
  team: { x: 960, y: 580, label: "Team" },
  operations: { x: 60, y: 1040, label: "Operations" },
  dept: { x: 660, y: 1040, label: "Department Head" },
  prod: { x: 1260, y: 1040, label: "Product Management" },
  arch: { x: 1860, y: 1040, label: "Architect" },
};

const NODE_IDS: NodeId[] = ["mgmt", "team", "operations", "dept", "prod", "arch"];

// Centroid of every node — the wide/reveal camera target. Derived, not
// hand-picked (see the skill's "Camera — derive the target").
const wideFit = fitCameraToFocus(NODES, []);
export const CENTER = { x: wideFit.x, y: wideFit.y };

const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id]);
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};
const pair = (a: NodeId, b: NodeId) => {
  const fit = fitCameraToFocus(NODES, [a, b]);
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

// WIDE fits every node with the default margin — the idle establishing
// shot. REVEAL is deliberately wider (0.55 vs WIDE's derived ~0.68): the
// Mechanism Reveal's payoff wants room to spare, showing the whole chase
// at once — a creative choice, not a safety-derived one, so it stays an
// explicit constant rather than going through fitCameraToFocus (see the
// skill's "Camera — derive the target").
const WIDE = { x: CENTER.x, y: CENTER.y, zoom: wideFit.zoom };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.55 };

// Beat 1 — the instruction arrives (Management -> Team). Beat 3 — the one
// real question nobody could answer ("why does this still need to exist?"),
// which becomes the packet that never gets a real answer. Beat 6 — the
// ownership hunt, one hop per name the essay actually gives: Team ->
// Operations -> Department Head -> Product Management -> Architect.
export const INSTRUCTION_DRAW_START = frameOfWord("beat-01", "instruction:");
export const QUESTION_PACKET_SPAWN = frameOfWord("beat-03", "why");

export const CONNECTOR_DRAW_DURATION = 45;
export const HOP_DURATION = 50;
export const HOP1_START = frameOfWord("beat-06", "meeting"); // Team -> Operations
export const HOP2_START = frameOfWord("beat-06", "brought"); // Operations -> Department Head
export const HOP3_START = frameOfWord("beat-06", "pointed"); // Department Head -> Product Management
export const HOP4_START = frameOfWord("beat-06", "pulled"); // Product Management -> Architect

const b1 = TIMELINE["beat-01"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];
const b7 = TIMELINE["beat-07"];

const mgmtCue = frameOfWord("beat-01", "Management");
const nobodyCue = frameOfWord("beat-01", "Nobody");
const seniorCue = frameOfWord("beat-06", "Senior");

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — establish Management, then the instruction lands on the team.
  { frame: b1.from, target: tight("mgmt") },
  { frame: Math.max(b1.from, mgmtCue - FAST), target: tight("mgmt") },
  { frame: mgmtCue, target: pair("mgmt", "team") },
  { frame: nobodyCue - FAST, target: pair("mgmt", "team") },
  { frame: nobodyCue, target: tight("team") },
  { frame: b1.from + b1.duration - SLOW, target: tight("team") },

  // Beats 2-4 hold on the team — the questions asked, the one question that
  // wasn't, and the quiet gap that survives the entire build. No new
  // keyframe needed: interpolating tight(team) -> tight(team) across this
  // whole stretch is a genuine hold, not a drift (see the skill's "Camera
  // must actually hold, not drift").

  // Beat 5 — pull back as the release goes out into an organization that
  // can't say who it's for.
  { frame: b5.from - SLOW, target: tight("team") },
  { frame: b5.from, target: WIDE },
  { frame: b6.from - SLOW, target: WIDE },

  // Beat 6 — the Mechanism Reveal: establish wide, then follow the
  // ownership hunt hop by hop, then pull back wider than the idle wide shot
  // for the payoff line about senior people losing hours to a product that
  // was already finished.
  { frame: b6.from, target: REVEAL },
  { frame: HOP1_START - FAST, target: REVEAL },
  { frame: HOP1_START, target: tight("operations") },
  { frame: HOP2_START - FAST, target: tight("operations") },
  { frame: HOP2_START, target: tight("dept") },
  { frame: HOP3_START - FAST, target: tight("dept") },
  { frame: HOP3_START, target: tight("prod") },
  { frame: HOP4_START - FAST, target: tight("prod") },
  { frame: HOP4_START, target: tight("arch") },
  { frame: seniorCue - SLOW, target: tight("arch") },
  { frame: seniorCue, target: REVEAL },
  { frame: b6.from + b6.duration, target: REVEAL },

  // Beats 7-10 are dedicated full-screen scenes (split, long-form, list,
  // CTA) — the diagram is invisible, so this final point only exists to
  // keep the keyframe array a valid, strictly increasing safety default.
  { frame: TOTAL_DURATION, target: WIDE },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "That wasn't the assignment.",
  "beat-02": "a fair question",
  "beat-03": "why does this workflow still need to exist?",
  "beat-04": "sat there, quietly,",
  "beat-05": "Nobody had a user list.",
  "beat-06": "a product that was already finished and ready to ship",
  "beat-08": "We've always done it this way isn't a requirement.",
  "beat-09": "Purpose isn't something an organization should discover after it's already paid for delivery.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// stays visible through the Mechanism Reveal (Beat 6), then goes fully
// invisible once Beat 7's split scene takes over and stays that way through
// Beats 8-9 (LongFormScene / the three-questions scene) and the CTA — no
// wipe needed between 7/8/9/10 since the diagram's mode doesn't change
// again, only the text does.
export const WORLD_OPACITY_FRAMES = [0, b1.from, b1.from + 20, b7.from, b7.from + 40];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;

export { NODE_IDS };
