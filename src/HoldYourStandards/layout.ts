import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "teamLead" | "otherManagers" | "team" | "operations";

// Team Lead is the hub: it is the only role with a real connection to both
// the boast's audience and the people who actually build and use the
// product. Other Managers and Operations never speak to each other — the
// Reveal is not a missing connector forming (see the leadership-visual-
// essay skill's "connectors carry the entire mechanism"), it is the SAME
// claim landing twice: once as words to Other Managers, once — unheard by
// them — as a standard Operations independently holds him to.
// Wider spread than a naive layout would use: with four nodes, a tight
// single-node shot or a two-node pair shot needs enough real distance to
// the OTHER two nodes that they fall outside frame at the zoom
// fitCameraToFocus below actually computes — verified in
// tests/frame-fit.test.ts against these exact coordinates, not eyeballed.
// A cramped quadrilateral (checked and rejected: nodes spaced ~540-880
// apart) leaves Operations overlapping the Team Lead / Team pair shot and
// Other Managers overlapping the Team Lead tight shot.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  teamLead: { x: 760, y: 260, label: "Team Lead" },
  otherManagers: { x: 1600, y: 260, label: "Other Managers" },
  team: { x: 380, y: 840, label: "Team" },
  operations: { x: 1400, y: 840, label: "Operations" },
};

// Centroid of all four nodes — the wide/reveal camera target.
export const CENTER = { x: 1035, y: 550 };

export const CONNECTOR_DRAW_DURATION = 40;

// Beat 1 — the boast: the only real contact Team Lead and Other Managers
// ever have in this story.
export const TEAMLEAD_OTHERMANAGERS_DRAW_START = frameOfWord("beat-01", "managers");

// Beat 2 — the team's first real appearance: the demo.
export const TEAMLEAD_TEAM_DRAW_START = frameOfWord("beat-02", "team");

// Beat 5 — the portal actually reaches Operations for the first time.
export const TEAM_OPERATIONS_DRAW_START = frameOfWord("beat-05", "Operations");

// The pushback packet: a single hop, Operations -> Team, spawned the
// moment the operations manager sends the collected issues back. It never
// continues further — it just sits at Team, unresolved, the same way the
// essay never shows the team lead actually act on it before the Reveal.
export type Hop = { from: NodeId; to: NodeId; start: number; duration: number };
export const PUSHBACK_JOURNEY: Hop[] = [
  { from: "operations", to: "team", start: frameOfWord("beat-05", "sent"), duration: 40 },
];

// The Reveal's callback: NOT a new connector (Other Managers and
// Operations never actually speak) — the ORIGINAL boast connector pulses
// again, in accent, exactly as the narration names the double standard.
// This is the one moment the accent + glow treatment is used, reserved for
// the single thing this video is actually about.
export const CALLBACK_PULSE_CENTER = frameOfWord("beat-08", "listening,");
export const CALLBACK_PULSE_HALF_WIDTH = 24;

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see src/lib/Camera.ts) so pans read as the camera
// sweeping across the layout, not cutting between positions.
// REVEAL is a 0-focus shot (nothing to exclude), and its deliberate
// "wider than idle wide" framing is a creative choice, not a
// safety-derived one — stays an explicit constant.
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.72 };

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
const b4 = TIMELINE["beat-04"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];
const b8 = TIMELINE["beat-08"];

const managersCue1 = TEAMLEAD_OTHERMANAGERS_DRAW_START;
const teamCue2 = TEAMLEAD_TEAM_DRAW_START;
const approvedCue4 = frameOfWord("beat-04", "approved");
const operationsCue5 = TEAM_OPERATIONS_DRAW_START;
const contactedCue5 = frameOfWord("beat-05", "contacted");
const sentCue5 = frameOfWord("beat-05", "sent");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — the boast, pair on Team Lead / Other Managers.
  { frame: b1.from, target: pair("teamLead", "otherManagers") },
  { frame: managersCue1 - FAST, target: pair("teamLead", "otherManagers") },
  { frame: managersCue1, target: pair("teamLead", "otherManagers") },
  { frame: b1.from + b1.duration - SLOW, target: pair("teamLead", "otherManagers") },

  // Beat 2 — pan from that pair to Team Lead / Team as the demo starts.
  { frame: teamCue2 - FAST, target: pair("teamLead", "otherManagers") },
  { frame: teamCue2, target: pair("teamLead", "team") },
  { frame: b2.from + b2.duration - SLOW, target: pair("teamLead", "team") },

  // Beat 3 is a dedicated scene (world hidden) — no camera change needed.

  // Beat 4 — the decision. Tight on Team Lead throughout, a true hold
  // around "He approved the release" — the exact moment the standard
  // splits from the words that advertised it. Holds tight(teamLead) right
  // up to the Beat 4/5 boundary, then pans into Beat 5's pair shot in the
  // SLOW window landing exactly on b5.from — NOT a point exactly at
  // `b4.from + b4.duration` (which equals `b5.from`, since beats are
  // contiguous): two different targets at the identical frame number is
  // what breaks `interpolate`'s strictly-increasing input requirement.
  { frame: b4.from, target: tight("teamLead") },
  { frame: approvedCue4 - SLOW, target: tight("teamLead") },
  { frame: approvedCue4, target: tight("teamLead") },
  { frame: b5.from - SLOW, target: tight("teamLead") },

  // Beat 5 — the portal actually reaches Operations: pair shot on the
  // delivery, then tight on Operations for the specific failures, then a
  // pan to Team as the pushback lands. Same boundary rule applies going
  // into Beat 6: hold tight(team) until `b6.from - SLOW`, pan lands
  // exactly on `b6.from`, never a point at `b5.from + b5.duration`.
  { frame: b5.from, target: pair("team", "operations") },
  { frame: operationsCue5 + FAST, target: pair("team", "operations") },
  { frame: contactedCue5 - FAST, target: tight("operations") },
  { frame: contactedCue5, target: tight("operations") },
  { frame: sentCue5 - FAST, target: tight("operations") },
  { frame: sentCue5, target: tight("team") },
  { frame: b6.from - SLOW, target: tight("team") },

  // Beat 6 — his reaction: tight on Team Lead, held.
  { frame: b6.from, target: tight("teamLead") },
  { frame: b6.from + b6.duration, target: tight("teamLead") },

  // Beat 7 is a dedicated scene (world hidden) — no camera change needed.

  // Beat 8 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity at once while the callback pulses.
  { frame: b8.from, target: REVEAL },
  { frame: b8.from + b8.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: REVEAL },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "didn't settle for software that merely worked.",
  "beat-02": "The main workflow worked.",
  "beat-04": "He approved the release and moved the team to its next priority.",
  "beat-05": "The operations manager collected the issues and sent them back.",
  "beat-06": "yet the other department focused on bugs and polish",
  "beat-08": "accepted passable work when the decision stayed inside his team.",
  "beat-11": "your standards are the work you deliver, not the work you talk about.",
  "beat-12": "compare them with the last piece of work you knowingly allowed to ship.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// dips fully invisible for Beat 3's dedicated list scene, returns for
// Beats 4-6, dips again for Beat 7's dedicated quote scene, returns for
// Beat 8's Reveal, then goes fully invisible for good once Beat 9's list
// scene takes over — Beats 9-12 (a second list, the split, then pure
// reflective LongFormScene narration) and the CTA never need it back, so
// that stretch stays at a literal 0, not a faint residual.
const b3 = TIMELINE["beat-03"];
const b7 = TIMELINE["beat-07"];
const b9 = TIMELINE["beat-09"];
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b3.from,
  b3.from + 15,
  b4.from,
  b4.from + 15,
  b7.from - 20,
  b7.from,
  b8.from - 20,
  b8.from,
  b9.from - 20,
  b9.from,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
