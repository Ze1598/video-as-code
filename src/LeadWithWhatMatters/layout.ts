import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "manager" | "leadA" | "leadB" | "engineers";
export const SPOKE_IDS: NodeId[] = ["leadA", "leadB", "engineers"];

// Fixed world-space coordinates: the manager at the top, the two team leads
// and the engineers fanned out below her — a hub with three spokes, matching
// the story's actual shape (one meeting, three separate parties each forming
// their own read on what was decided). The camera moves over this fixed
// layout; the layout itself never changes.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  manager: { x: 960, y: 260, label: "Manager" },
  leadA: { x: 460, y: 820, label: "Team Lead A" },
  leadB: { x: 1460, y: 820, label: "Team Lead B" },
  engineers: { x: 960, y: 900, label: "Engineers" },
};

// Centroid of all four nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 700 };

// Beat 4 (Surviving Failure Path) — what each party actually walked away
// believing, unresolved for the rest of the video (the essay never claims
// the gap gets corrected in the moment, only that it becomes visible at the
// Reveal). Shown as a diamond marker (PacketMarker's "in-transit/unresolved"
// shape) plus a small text tag above each node.
export const WRONG_LABELS: Record<NodeId, string | null> = {
  manager: null,
  leadA: "didn't stop features",
  leadB: "release team only",
  engineers: "kept shipping",
};
export const WRONG_LABEL_FADE_START = TIMELINE["beat-04"].from;
export const WRONG_LABEL_FADE_DURATION = 20;

// Connectors: the meeting relationship already exists between the manager
// and all three parties before the video starts (a standing release
// meeting, not a relationship forming live) — so all three draw on together
// as soon as the diagram fades in, rather than one at a time on first
// contact.
export const CONNECTOR_DRAW_START = TIMELINE["beat-01"].from + 10;
export const CONNECTOR_DRAW_DURATION = 40;

// Reserve the accent + glow flash for the three moments something is
// actually sent down the channel: the decision itself (Beat 3), the
// follow-up message (Beat 5), and the Reveal's own callback to both
// ("Twice now, they'd gotten plenty of it") — a double flash echoing the
// two prior deliveries. Nothing here claims either delivery actually
// landed; see the skill's "pulse the existing connector" device.
const decisionCue = frameOfWord("beat-03", "prioritize");
const followupCue = frameOfWord("beat-05", "sent");
const twiceCue = frameOfWord("beat-06", "Twice");
const plentyCue = frameOfWord("beat-06", "plenty");
const PULSE_DURATION = 22;

export const CONNECTOR_PULSE_FRAMES = [
  decisionCue - 4,
  decisionCue,
  decisionCue + PULSE_DURATION,
  followupCue - 4,
  followupCue,
  followupCue + PULSE_DURATION,
  twiceCue - 4,
  twiceCue,
  twiceCue + PULSE_DURATION,
  plentyCue - 4,
  plentyCue,
  plentyCue + PULSE_DURATION,
];
export const CONNECTOR_PULSE_VALUES = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant. FAST/SLOW are deliberately long with an
// ease-in-out curve (see Camera.ts) so pans read as the camera sweeping
// across the layout, not cutting between positions.
const WIDE = { x: CENTER.x, y: CENTER.y, zoom: 0.85 };
const REVEAL = { x: CENTER.x, y: CENTER.y, zoom: 0.7 };

// maxZoom 2.3, not the fitCameraToFocus default of 2.0 — this layout reuses
// HowToBeUnderstood's exact spoke spacing (500 world-units apart
// horizontally, only 80 apart vertically between the lower two spokes), the
// same geometry that function's default cap was found to leak a non-focus
// node on; 2.3 is the same verified override (see tests/frame-fit.test.ts).
const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id], { maxZoom: 2.3 });
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b3 = TIMELINE["beat-03"];
const b4 = TIMELINE["beat-04"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];

const thankedCue = frameOfWord("beat-01", "thanked");
const severityCue = frameOfWord("beat-03", "severity,");
const deadlinesCue = frameOfWord("beat-03", "deadlines,");
const landedCue = frameOfWord("beat-03", "landed.");
const engineersCue = frameOfWord("beat-04", "engineers");
const understoodCue = frameOfWord("beat-04", "understood");
const anotherCue = frameOfWord("beat-04", "Another");
const managerCue = frameOfWord("beat-04", "manager");

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — introduce the manager, then pull wide once she's addressing
  // the whole room.
  { frame: b1.from, target: tight("manager") },
  { frame: thankedCue - FAST, target: tight("manager") },
  { frame: thankedCue, target: WIDE },
  { frame: b1.from + b1.duration - SLOW, target: WIDE },

  // Beat 2 — the room's own reasonable response, not about one person: no
  // new keyframe needed, the WIDE hold carries straight through.

  // Beat 3 — tight on the manager exactly as she states the decision, then
  // pan across the two leads as they ask their real questions, then pull
  // wide for the deadpan "it looked, in the room, like it had landed."
  { frame: decisionCue - FAST, target: WIDE },
  { frame: decisionCue, target: tight("manager") },
  { frame: severityCue - FAST, target: tight("manager") },
  { frame: severityCue, target: tight("leadA") },
  { frame: deadlinesCue - FAST, target: tight("leadA") },
  { frame: deadlinesCue, target: tight("leadB") },
  { frame: landedCue - SLOW, target: tight("leadB") },
  { frame: landedCue, target: WIDE },
  { frame: b3.from + b3.duration - SLOW, target: WIDE },

  // Beat 4 — pan engineers -> lead A -> lead B as each party's version of
  // the gap is named, then pull wide on the manager's own belief.
  { frame: engineersCue - FAST, target: WIDE },
  { frame: engineersCue, target: tight("engineers") },
  { frame: understoodCue - FAST, target: tight("engineers") },
  { frame: understoodCue, target: tight("leadA") },
  { frame: anotherCue - FAST, target: tight("leadA") },
  { frame: anotherCue, target: tight("leadB") },
  { frame: managerCue - SLOW, target: tight("leadB") },
  { frame: managerCue, target: WIDE },
  { frame: b4.from + b4.duration - SLOW, target: WIDE },

  // Beat 5 — tight on the manager alone: her own reaction, not the room's.
  { frame: b5.from, target: tight("manager") },
  { frame: b5.from + b5.duration - SLOW, target: tight("manager") },

  // Beat 6 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity at once while the connectors pulse.
  { frame: b6.from, target: REVEAL },
  { frame: b6.from + b6.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: WIDE },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-03": "It looked, in the room, like it had landed.",
  "beat-06": "people classify communication from its opening",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// stays visible through the Reveal (Beat 6), then goes fully invisible once
// Beat 7's dedicated quote scene takes over — and stays that way through
// Beats 8-10 (SplitArgumentScene, LongFormScene, the list scene) and the
// CTA, since the diagram's mode doesn't change again after that point.
const b7 = TIMELINE["beat-07"];
export const WORLD_OPACITY_FRAMES = [0, b1.from, b1.from + 20, b7.from, b7.from + 40];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
