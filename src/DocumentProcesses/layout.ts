import { frameOfWord, TIMELINE, TOTAL_DURATION } from "./timeline.ts";
import { DEFAULT_CAPTION_TOP, DEFAULT_DIAGRAM_SCALE } from "../lib/diagram/DiagramFrame.tsx";
import { fitCameraToFocus } from "../lib/diagram/frameFit.ts";

// Same base palette as the other essay videos, for series continuity — see
// src/lib/palette.ts, the shared source of truth.
export { BG, TEXT, DIM_TEXT, ACCENT, LINE_INACTIVE, LINE_ACTIVE } from "../lib/palette.ts";

// One addition to the base palette for this video: a muted red-orange
// reserved for "rejected/broken" — the analyst's bounced ticket and the
// wave of failed requests once the coordinator is away. Kept distinct from
// ACCENT (reserved for the Mechanism Reveal payoff) so the two meanings
// never collide.
export const ERROR = "#C1554B";

export type NodeId = "analyst" | "manager" | "colleague" | "it" | "coordinator" | "employees";

// Two clusters in fixed world-space: the analyst's own ticket (hub =
// analyst, spokes = manager/colleague/it, the same shape as this format's
// other hub-and-spoke layouts) sits in the upper half; the coordinator and
// the wider employee base she quietly supports sit well below it. The two
// clusters are spaced far enough apart that a tight shot on either one
// excludes every node in the other (verified — see tests/frame-fit.test.ts).
export const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  analyst: { x: 960, y: 220, label: "New Analyst" },
  manager: { x: 460, y: 700, label: "Manager" },
  colleague: { x: 960, y: 780, label: "Colleague" },
  it: { x: 1460, y: 700, label: "IT" },
  coordinator: { x: 700, y: 1300, label: "Operations Coordinator" },
  employees: { x: 1220, y: 1300, label: "Employees" },
};

const TIGHT_MAX_ZOOM = 2.3;
const tight = (id: NodeId) => {
  const fit = fitCameraToFocus(NODES, [id], { maxZoom: TIGHT_MAX_ZOOM });
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};
const pair = (a: NodeId, b: NodeId) => {
  const fit = fitCameraToFocus(NODES, [a, b]);
  return { x: fit.x, y: fit.y, zoom: fit.zoom };
};

// WIDE is derived (fits every node with margin) so it stays correct if the
// layout above ever changes. REVEAL is a deliberately wider constant on top
// of it — the one moment (the Mechanism Reveal) that wants extra room to
// show literally everything at once, per the skill's "Camera — derive the
// target".
const wideFit = fitCameraToFocus(NODES, []);
const WIDE = { x: wideFit.x, y: wideFit.y, zoom: wideFit.zoom };
const REVEAL = { x: wideFit.x, y: wideFit.y, zoom: wideFit.zoom * 0.78 };

// Beats 1-4 are entirely the analyst's own ticket — the coordinator and
// employees aren't part of the story yet. The all-six-node WIDE above would
// pull back far enough to reveal both of them fully labeled, which is
// exactly what the skill's "never leave an entity in frame that the current
// beat isn't about" rule exists to prevent (caught via a still-check at
// beat 1's wide shot, not by eye at the coordinates). A "wide" shot scoped
// to just this cluster is the general/reflective shot those four beats
// actually get.
const analystWideFit = fitCameraToFocus(NODES, ["analyst", "manager", "colleague", "it"]);
const WIDE_ANALYST = { x: analystWideFit.x, y: analystWideFit.y, zoom: analystWideFit.zoom };

const FAST = 48; // a genuine pan between entities within a beat
const SLOW = 55; // a gentler transition at a beat/mode boundary

const b1 = TIMELINE["beat-01"];
const b2 = TIMELINE["beat-02"];
const b3 = TIMELINE["beat-03"];
const b5 = TIMELINE["beat-05"];
const b6 = TIMELINE["beat-06"];
const b7 = TIMELINE["beat-07"];

// Real-word cues driving every camera pan, connector draw-on, and packet
// hop below — never a guessed frame number (see the skill's audio pipeline
// section).
const cueManager1 = frameOfWord("beat-01", "manager");
const cueTicket1 = frameOfWord("beat-01", "ticket.");
const cueForm1 = frameOfWord("beat-01", "form");

const cueColleague2 = frameOfWord("beat-02", "colleague,");
const cueIt2a = frameOfWord("beat-02", "IT."); // "someone in IT." — first mention
const cueIt2b = frameOfWord("beat-02", "IT"); // "IT sent him back" — IT actually responds
const cueManager2 = frameOfWord("beat-02", "manager.");

const cueApproved3 = frameOfWord("beat-03", "approved");
const cueTeams3 = frameOfWord("beat-03", "Teams");
const cueSubmitted3 = frameOfWord("beat-03", "submitted");

const cueRejected4 = frameOfWord("beat-04", "rejected");

const cueCoordinator5 = frameOfWord("beat-05", "coordinator");
const cueEmployees5 = frameOfWord("beat-05", "Employees");

const cueLeave6 = frameOfWord("beat-06", "leave.");
const cueRequests6 = frameOfWord("beat-06", "Requests");
const cueIt6 = frameOfWord("beat-06", "IT", "start", 0); // "messaged IT directly"
const cueRejected6 = frameOfWord("beat-06", "rejected");
const cueBacklog6 = frameOfWord("beat-06", "backlog");

// Camera keyframes: each target is TWO breakpoints (arrive, then
// hold-until) carrying the identical x/y/zoom, so interpolating between
// them is genuinely constant — see the skill's "Camera must actually hold,
// not drift". Beat 4 (the rejection) and beat 8+ (dedicated scenes) need no
// keyframes of their own: the hold already in place at their start carries
// straight through, which is itself the deadpan-hold technique for beat 4's
// stall.
type CamTarget = { x: number; y: number; zoom: number };
const CAMERA_KEYFRAMES: Array<{ frame: number; target: CamTarget }> = [
  // Beat 1 — the analyst, then his manager, then pull wide (scoped to just
  // this cluster — see WIDE_ANALYST above) for the generic form fields
  // nobody explained.
  { frame: b1.from, target: tight("analyst") },
  { frame: cueManager1 - FAST, target: tight("analyst") },
  { frame: cueManager1, target: tight("manager") },
  { frame: cueForm1 - FAST, target: tight("manager") },
  { frame: cueForm1, target: WIDE_ANALYST },
  { frame: b1.from + b1.duration - SLOW, target: WIDE_ANALYST },

  // Beat 2 — pan wide -> colleague -> IT -> manager as each contact happens.
  // The pan into "colleague" starts just before this beat's own audio, in
  // the tail of beat 1's WIDE_ANALYST hold — a real pan, not a cut on the
  // boundary.
  { frame: cueColleague2 - FAST, target: WIDE_ANALYST },
  { frame: cueColleague2, target: tight("colleague") },
  { frame: cueIt2a - FAST, target: tight("colleague") },
  { frame: cueIt2a, target: tight("it") },
  { frame: cueManager2 - FAST, target: tight("it") },
  { frame: cueManager2, target: tight("manager") },
  { frame: b2.from + b2.duration - SLOW, target: tight("manager") },

  // Beat 3 — holds on the manager (his approval), no new keyframe needed at
  // the boundary since beat 2 already ended there; pan to IT for the
  // submission.
  { frame: cueSubmitted3 - FAST, target: tight("manager") },
  { frame: cueSubmitted3, target: tight("it") },
  { frame: b3.from + b3.duration - SLOW, target: tight("it") },

  // Beat 4 — no new keyframes: the hold on IT carries straight through the
  // rejection, the same deadpan-hold technique used elsewhere in this
  // format for a beat that needs to sit still while the words land.

  // Beat 5 — new territory: pull wide, then introduce the coordinator, then
  // the wider employee base she supports.
  { frame: b5.from - SLOW, target: tight("it") },
  { frame: b5.from, target: WIDE },
  { frame: cueCoordinator5 - FAST, target: WIDE },
  { frame: cueCoordinator5, target: tight("coordinator") },
  { frame: cueEmployees5 - FAST, target: tight("coordinator") },
  { frame: cueEmployees5, target: pair("coordinator", "employees") },
  { frame: b5.from + b5.duration - SLOW, target: pair("coordinator", "employees") },

  // Beat 6 — holds the pair through "she went on leave", pulls wide for the
  // wave of broken requests, punches into IT for the direct-message
  // failures, back wide, then in on the coordinator for her return to the
  // backlog.
  { frame: cueRequests6 - FAST, target: pair("coordinator", "employees") },
  { frame: cueRequests6, target: WIDE },
  { frame: cueIt6 - FAST, target: WIDE },
  { frame: cueIt6, target: tight("it") },
  { frame: cueRejected6 - FAST, target: tight("it") },
  { frame: cueRejected6, target: WIDE },
  { frame: cueBacklog6 - FAST, target: WIDE },
  { frame: cueBacklog6, target: tight("coordinator") },
  { frame: b6.from + b6.duration - SLOW, target: tight("coordinator") },

  // Beat 7 — the Mechanism Reveal: true hold, wider than the idle wide
  // shot, showing every entity — and every broken connection — at once.
  { frame: b7.from, target: REVEAL },
  { frame: b7.from + b7.duration, target: REVEAL },

  { frame: TOTAL_DURATION, target: WIDE },
];

export const CAMERA_FRAMES = CAMERA_KEYFRAMES.map((k) => k.frame);
export const CAMERA_X = CAMERA_KEYFRAMES.map((k) => k.target.x);
export const CAMERA_Y = CAMERA_KEYFRAMES.map((k) => k.target.y);
export const CAMERA_ZOOM = CAMERA_KEYFRAMES.map((k) => k.target.zoom);

// Connector draw-on: each line grows in the true direction the request
// travels — outward from whichever party initiates that contact (the
// analyst for his own ticket, the coordinator for the informal channel she
// keeps open to the wider team).
export const CONNECTOR_DRAW_DURATION = 36;
export const CONNECTOR_ANALYST_MANAGER_START = cueManager1;
export const CONNECTOR_ANALYST_COLLEAGUE_START = cueColleague2;
export const CONNECTOR_ANALYST_IT_START = cueIt2a;
export const CONNECTOR_COORDINATOR_EMPLOYEES_START = cueEmployees5;
export const CONNECTOR_EMPLOYEES_IT_START = cueIt6;

// The coordinator->employees connector's "health": solid through beat 5
// (she's available), fading toward the inactive line color once she goes on
// leave (beat 6's "leave." cue) — she's still nominally reachable, just not
// functioning as the channel she was.
export const COORDINATOR_HEALTH_FRAMES = [cueEmployees5, cueLeave6, cueLeave6 + 40];
export const COORDINATOR_HEALTH_VALUES = [1, 1, 0.3];
export const COORDINATOR_DIM_START = cueLeave6;

// The employees->IT connector's health: it exists (they're messaging IT
// directly, unmediated) but is never fully healthy — a brief pulse to full
// opacity right on the rejection, then settling back to a permanently
// degraded state, echoing the original ticket's own fate.
export const EMPLOYEES_IT_HEALTH_FRAMES = [
  cueIt6,
  cueIt6 + CONNECTOR_DRAW_DURATION,
  cueRejected6 - 10,
  cueRejected6,
  cueRejected6 + 10,
  cueRejected6 + 80,
];
export const EMPLOYEES_IT_HEALTH_VALUES = [0, 0.55, 0.55, 1, 0.55, 0.55];

// The analyst's ticket, travelling as a single continuous packet along the
// three connectors above (see the skill's "one continuous journey") — never
// a new disconnected packet per hop. Always hops between the hub (analyst)
// and one of his three spokes, since those are the only real connectors
// that exist for this part of the story.
export const HOP_DURATION = 30;
export const PACKET_HOPS: Array<{ from: NodeId; to: NodeId; frame: number }> = [
  { from: "analyst", to: "manager", frame: cueManager1 }, // told to submit a ticket
  { from: "manager", to: "analyst", frame: cueTicket1 }, // he has the instruction
  { from: "analyst", to: "colleague", frame: cueColleague2 }, // he asks a colleague
  { from: "colleague", to: "analyst", frame: cueIt2a }, // she points him to IT
  { from: "analyst", to: "it", frame: cueIt2b }, // he reaches IT
  { from: "it", to: "analyst", frame: cueManager2 }, // sent back to his manager
  { from: "analyst", to: "manager", frame: cueApproved3 }, // manager approves
  { from: "manager", to: "analyst", frame: cueTeams3 }, // approval carried back
  { from: "analyst", to: "it", frame: cueSubmitted3 }, // ticket resubmitted
];
export const PACKET_REJECT_FRAME = cueRejected4;

// The diagram is invisible through the Hook, fades in as Beat 1 begins,
// stays visible through the Mechanism Reveal (Beat 7), then fades out for
// good as Beat 8's dedicated split scene takes over — this format's essay
// has moved past the mechanism into pure reflection at that point, so the
// diagram doesn't return (see the skill's "Match technique to content").
export const WORLD_OPACITY_FRAMES = [0, b1.from, b1.from + 20, b7.from + b7.duration - 20, b7.from + b7.duration];
export const WORLD_OPACITY_VALUES = [0, 0, 1, 1, 0];

export const HIGHLIGHTS: Record<string, string> = {
  "beat-04": "wrong license type entirely",
  "beat-06": "a process everyone had followed differently",
  "beat-07": "nobody can tell whether it was ignored",
  "beat-11": "ask around to discover how it works",
};

// Safe-zone: the diagram is scaled+anchored so it can never render into the
// caption's territory, no matter what the camera is doing (see
// src/lib/diagram/DiagramFrame.tsx / Hud.tsx).
export const DIAGRAM_SCALE = DEFAULT_DIAGRAM_SCALE;
export const CAPTION_TOP = DEFAULT_CAPTION_TOP;
