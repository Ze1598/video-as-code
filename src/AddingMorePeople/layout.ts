import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

export type NodeId = "management" | "seniorEngineers" | "newEngineers" | "stakeholders" | "deliveryLead";

// Two clusters (senior <-> new engineers; delivery lead <-> stakeholders,
// the pair that forms mid-video) plus Management standing alone, spread so
// every tight/pair shot this video actually uses excludes the others with a
// real margin — verified in tests/frame-fit.test.ts against these exact
// coordinates, not eyeballed. Management sits far above the row at y=150
// so it never leaks into either cluster's pair shot; the two clusters sit
// 500 world-units apart horizontally so pair(seniorEngineers, newEngineers)
// excludes the far cluster and vice versa. Stakeholders sits BELOW the
// senior/new row (y=1050, not y=700) rather than in line with it — a
// same-row placement put Stakeholders, New Engineers, and Senior Engineers
// collinear, so the real Stakeholders -> Senior Engineers connector (a
// separate relationship — New Engineers has no direct contact with
// Stakeholders in this story) drew as a straight line passing visually
// THROUGH the New Engineers node, misreading as one continuous
// Senior-New-Stakeholders chain (found by rendering beat-05's wide shot,
// not caught by any camera-exclusion check, since collinearity is a
// connector-legibility problem, not a framing one). The offset keeps the
// line a full 175 world-units clear of New Engineers at its x-position.
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  management: { x: 960, y: 150, label: "Management" },
  seniorEngineers: { x: 210, y: 700, label: "Senior Engineers" },
  newEngineers: { x: 710, y: 700, label: "New Engineers" },
  stakeholders: { x: 1210, y: 1050, label: "Stakeholders" },
  deliveryLead: { x: 1710, y: 700, label: "Delivery Lead" },
};

// Centroid of all five nodes — the wide/reveal camera target.
export const CENTER = { x: 960, y: 660 };

export const CONNECTOR_DRAW_DURATION = 40;

// Beat 1 — the hiring decision, the first real contact Management has with
// the new engineers. Direction: Management -> New Engineers, the true
// direction the decision travels (people being brought onto the team).
export const MGMT_NEWENG_DRAW_START = frameOfWord("beat-01", "hires.");

// Beat 2 — the senior engineers stepping in to onboard them. Direction:
// Senior Engineers -> New Engineers, the true direction support travels.
export const SENIOR_NEW_DRAW_START = frameOfWord("beat-02", "in,");

// Beat 4 (the enumeration of waste) is a dedicated scene with the diagram
// hidden — the stakeholder-urgency contact can't draw on at its own word
// cue since nothing is visible then, so it draws in the moment the diagram
// reappears at the start of Beat 5 instead (same device HowToBeUnderstood
// uses for its wrong-belief packets). Direction: Stakeholders ->
// Senior Engineers, urgent requests landing directly on the team.
export const STAKEHOLDERS_SENIOR_DRAW_START = TIMELINE["beat-05"].from;

// Beat 7 — the delivery lead's fix: stakeholders now route through the
// lead instead of escalating straight to the team. This is the one
// connector this video reserves the accent+glow "delivered/reinforced"
// treatment for — the actual mechanism the essay is about (separate the
// constraint, then govern it) — and the moment the old bypass connector
// (Stakeholders -> Senior Engineers) dims out, resolved rather than erased
// (see the skill's "Node occlusion": dim only ever changes stroke color,
// never fill opacity).
export const DELIVERYLEAD_STAKEHOLDERS_DRAW_START = frameOfWord("beat-07", "Stakeholders");

// Beat 6 — the Mechanism Reveal: three tags naming the three separate
// constraints, each fading in on its own real word cue, positioned near the
// node/connector each constraint is actually about.
export const CONSTRAINT_TAG_MISSING_SKILL_FRAME = frameOfWord("beat-06", "lack");
export const CONSTRAINT_TAG_WASTED_TIME_FRAME = frameOfWord("beat-06", "waste.");
export const CONSTRAINT_TAG_CAPACITY_FRAME = frameOfWord("beat-06", "exceed");

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

// Every node in this layout carries a two-word label ("Senior Engineers",
// "New Engineers", "Delivery Lead"), and both clusters put their two nodes
// at the SAME world y — so for a tight/pair shot in this layout, the
// binding exclusion constraint is horizontal label WIDTH, not the vertical
// label-height case DEFAULT_MARGIN's asymmetric bottom already covers.
// DEFAULT_MARGIN's left/right (55, sized for the circle radius alone) let
// tight(newEngineers) report excludesNonFocus: true while the real
// rendered "Senior Engineers" label still bled into frame at the default
// maxZoom (found via a still render at Beat 2, not caught by the generic
// exclusion check, which doesn't model label text width at all) — this
// video overrides the horizontal margin to 110 (comfortably wider than any
// label here) to model that correctly, and raises maxZoom to 2.6 (from the
// hub-spoke convention's 2.3) since the wider margin makes exclusion HARDER
// at a given zoom, not easier — verified clean at 2.6 for every shot this
// video uses in tests/frame-fit.test.ts, and confirmed by re-rendering the
// same still.
const MARGIN = { top: 55, right: 110, bottom: 130, left: 110 };
const MAX_ZOOM = 2.6;
const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id], { maxZoom: MAX_ZOOM, margin: MARGIN });
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};
const pair = (a: NodeId, b: NodeId) => {
  const fit = fitCameraToFocus(NODES, [a, b], { maxZoom: MAX_ZOOM, margin: MARGIN });
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b2 = TIMELINE["beat-02"];
const b3 = TIMELINE["beat-03"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];
const b7 = TIMELINE["beat-07"];

const hiresCue = MGMT_NEWENG_DRAW_START;
const stepInCue = SENIOR_NEW_DRAW_START;
const anywayCue = frameOfWord("beat-03", "anyway.");
const stakeholdersCue7 = DELIVERYLEAD_STAKEHOLDERS_DRAW_START;

type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — introduce Management, then pan to the new engineers as the
  // hiring decision lands.
  { frame: b1.from, target: tight("management") },
  { frame: hiresCue - FAST, target: tight("management") },
  { frame: hiresCue, target: tight("newEngineers") },
  { frame: b1.from + b1.duration - SLOW, target: tight("newEngineers") },

  // Beat 2 — pan to the Senior/New pair as onboarding actually starts, then
  // hold through the "that cost alone didn't make the decision wrong"
  // reasoning.
  { frame: stepInCue - FAST, target: tight("newEngineers") },
  { frame: stepInCue, target: pair("seniorEngineers", "newEngineers") },
  { frame: b2.from + b2.duration - SLOW, target: pair("seniorEngineers", "newEngineers") },

  // Beat 3 — hold the same pair through the settling-in, then pull wide
  // exactly on "anyway" for the deadpan hold on the assumption breaking.
  { frame: anywayCue - SLOW, target: pair("seniorEngineers", "newEngineers") },
  { frame: anywayCue, target: WIDE },
  { frame: b3.from + b3.duration, target: WIDE },

  // Beat 4 is a dedicated scene (world hidden) — no camera change needed;
  // the value coasts under the invisible diagram until Beat 5 re-arrives.

  // Beat 5 — the whole system entangled at once: true hold, wide. Ends its
  // hold at b6.from - SLOW (not b6.from itself) so beat 6's own arrival
  // keyframe is the only one sitting on the shared boundary frame — see the
  // skill's "Camera must actually hold, not drift".
  { frame: b5.from, target: WIDE },
  { frame: b6.from - SLOW, target: WIDE },

  // Beat 6 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity at once while the three constraint tags
  // fade in. Same boundary discipline: ends at b7.from - SLOW, not b7.from.
  { frame: b6.from, target: REVEAL },
  { frame: b7.from - SLOW, target: REVEAL },

  // Beat 7 — introduce the delivery lead alone, then pan to the pair as the
  // fix connector draws on.
  { frame: b7.from, target: tight("deliveryLead") },
  { frame: stakeholdersCue7 - FAST, target: tight("deliveryLead") },
  { frame: stakeholdersCue7, target: pair("deliveryLead", "stakeholders") },
  { frame: b7.from + b7.duration, target: pair("deliveryLead", "stakeholders") },

  // Beats 8-9 are dedicated scenes (split, then long-form) and the CTA —
  // the diagram goes to 0 for good at Beat 8 (see WORLD_OPACITY below), so
  // this value never needs to change again.
  { frame: TOTAL_DURATION, target: pair("deliveryLead", "stakeholders") },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

export const HIGHLIGHTS: Record<string, string> = {
  "beat-01": "More people, they reasoned, meant more capacity to get through the work.",
  "beat-02": "that cost alone didn't make the decision wrong.",
  "beat-03": "the backlog kept growing anyway.",
  "beat-05": "the very people already stretched thinnest, now supporting everyone else too.",
  "beat-06": "It had three, and nobody had ever separated them.",
  "beat-07": "Only then could anyone see the real capacity gap.",
  "beat-09": "You're hiring more people into it.",
};

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// dips fully invisible for Beat 4's dedicated list scene, returns for
// Beats 5-7 (the entangled system, the Reveal, and the fix), then goes
// fully invisible for good once Beat 8 takes over — Beats 8-9 (split,
// then LongFormScene, pure reflective narration) and the CTA never need it
// back, so that stretch stays at a literal 0, not a faint residual.
const b4 = TIMELINE["beat-04"];
const b8 = TIMELINE["beat-08"];
export const WORLD_OPACITY_FRAMES = [
  0,
  b1.from,
  b1.from + 20,
  b4.from,
  b4.from + 15,
  b5.from,
  b5.from + 15,
  b8.from - 20,
  b8.from,
];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0, 0, 1, 1, 0];

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
