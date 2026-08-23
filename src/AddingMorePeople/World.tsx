import { interpolate, useCurrentFrame } from "remotion";
import { cameraTransform } from "./Camera.ts";
import { PersonNode } from "../lib/diagram/PersonNode.tsx";
import { DiagramFrame } from "../lib/diagram/DiagramFrame.tsx";
import { drawOnStyle } from "../lib/diagram/connectorMath.ts";
import { opacityFactory } from "../lib/keyframes.ts";
import {
  ACCENT,
  CONNECTOR_DRAW_DURATION,
  CONSTRAINT_TAG_CAPACITY_FRAME,
  CONSTRAINT_TAG_MISSING_SKILL_FRAME,
  CONSTRAINT_TAG_WASTED_TIME_FRAME,
  DELIVERYLEAD_STAKEHOLDERS_DRAW_START,
  LINE_ACTIVE,
  LINE_INACTIVE,
  MGMT_NEWENG_DRAW_START,
  NODES,
  NodeId,
  SENIOR_NEW_DRAW_START,
  STAKEHOLDERS_SENIOR_DRAW_START,
  WORLD_OPACITY_FRAMES,
  WORLD_OPACITY_VALUES,
} from "./layout.ts";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Management -> New Engineers: draws on with the hiring decision (Beat 1).
// Legitimate for the whole video — never becomes "the mistake" — so it
// stays LINE_ACTIVE throughout, no dimming, no accent.
function ManagementNewEngConnector() {
  const frame = useCurrentFrame();
  if (frame < MGMT_NEWENG_DRAW_START) return null;

  const from = NODES.management;
  const to = NODES.newEngineers;
  const t = interpolate(frame, [MGMT_NEWENG_DRAW_START, MGMT_NEWENG_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);

  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />;
}

// Senior Engineers -> New Engineers: draws on as onboarding starts (Beat
// 2), the true direction support travels. Also legitimate for the whole
// video, stays LINE_ACTIVE.
function SeniorNewEngConnector() {
  const frame = useCurrentFrame();
  if (frame < SENIOR_NEW_DRAW_START) return null;

  const from = NODES.seniorEngineers;
  const to = NODES.newEngineers;
  const t = interpolate(frame, [SENIOR_NEW_DRAW_START, SENIOR_NEW_DRAW_START + CONNECTOR_DRAW_DURATION], [0, 1], clamp);

  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINE_ACTIVE} strokeWidth={2.5} {...drawOnStyle(t)} />;
}

// Stakeholders -> Senior Engineers: the direct-escalation bypass, drawing
// on the moment the diagram reappears for Beat 5 (the words that describe
// it were spoken during Beat 4's dedicated, diagram-hidden scene). Dims
// out — resolved, not erased — the instant the delivery lead's fix
// connector forms in Beat 7 (see the skill's "Node occlusion": dim only
// ever changes stroke color, never fill opacity).
function StakeholdersSeniorConnector() {
  const frame = useCurrentFrame();
  if (frame < STAKEHOLDERS_SENIOR_DRAW_START) return null;

  const from = NODES.stakeholders;
  const to = NODES.seniorEngineers;
  const t = interpolate(
    frame,
    [STAKEHOLDERS_SENIOR_DRAW_START, STAKEHOLDERS_SENIOR_DRAW_START + CONNECTOR_DRAW_DURATION],
    [0, 1],
    clamp,
  );
  const resolved = frame >= DELIVERYLEAD_STAKEHOLDERS_DRAW_START;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={resolved ? LINE_INACTIVE : LINE_ACTIVE}
      strokeWidth={2.5}
      {...drawOnStyle(t)}
    />
  );
}

// Delivery Lead -> Stakeholders: the fix, drawing on in Beat 7 as the audit
// lands — the one connector this video reserves the accent+glow
// "delivered/reinforced" treatment for, since separating and governing the
// constraint is the actual mechanism the essay is about.
function DeliveryLeadStakeholdersConnector() {
  const frame = useCurrentFrame();
  if (frame < DELIVERYLEAD_STAKEHOLDERS_DRAW_START) return null;

  const from = NODES.deliveryLead;
  const to = NODES.stakeholders;
  const t = interpolate(
    frame,
    [DELIVERYLEAD_STAKEHOLDERS_DRAW_START, DELIVERYLEAD_STAKEHOLDERS_DRAW_START + CONNECTOR_DRAW_DURATION],
    [0, 1],
    clamp,
  );

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={ACCENT}
      strokeWidth={3.5}
      style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
      {...drawOnStyle(t)}
    />
  );
}

const EASE_CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Beat 6 — the Mechanism Reveal: three tags, one per constraint the essay
// names, each fading in on its own real word cue and positioned near the
// node that constraint is actually about (see the skill's "Match technique
// to content" — small concrete illustrations tied to specific nouns in the
// sentence).
function ConstraintTag({ x, y, text, frame: revealFrame }: { x: number; y: number; text: string; frame: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [revealFrame, revealFrame + 20], [0, 1], EASE_CLAMP);
  if (opacity <= 0) return null;

  return (
    <text x={x} y={y} fill={ACCENT} fontSize={24} fontWeight={700} textAnchor="middle" opacity={opacity}>
      &ldquo;{text}&rdquo;
    </text>
  );
}

function ConstraintTags() {
  return (
    <>
      <ConstraintTag
        x={NODES.newEngineers.x}
        y={NODES.newEngineers.y - 130}
        text="missing skill"
        frame={CONSTRAINT_TAG_MISSING_SKILL_FRAME}
      />
      <ConstraintTag
        x={NODES.stakeholders.x}
        y={NODES.stakeholders.y - 130}
        text="wasted time"
        frame={CONSTRAINT_TAG_WASTED_TIME_FRAME}
      />
      <ConstraintTag
        x={NODES.management.x}
        y={NODES.management.y - 90}
        text="true capacity gap"
        frame={CONSTRAINT_TAG_CAPACITY_FRAME}
      />
    </>
  );
}

const NODE_IDS: NodeId[] = ["management", "seniorEngineers", "newEngineers", "stakeholders", "deliveryLead"];

const worldOpacity = opacityFactory(WORLD_OPACITY_FRAMES, WORLD_OPACITY_VALUES);

export const World: React.FC = () => {
  const frame = useCurrentFrame();

  const dim: Record<NodeId, boolean> = {
    management: false,
    seniorEngineers: false,
    newEngineers: frame < MGMT_NEWENG_DRAW_START,
    stakeholders: frame < STAKEHOLDERS_SENIOR_DRAW_START,
    deliveryLead: frame < DELIVERYLEAD_STAKEHOLDERS_DRAW_START,
  };

  return (
    <DiagramFrame frame={frame} worldOpacity={worldOpacity(frame)} cameraTransform={cameraTransform}>
      <ManagementNewEngConnector />
      <SeniorNewEngConnector />
      <StakeholdersSeniorConnector />
      <DeliveryLeadStakeholdersConnector />
      {NODE_IDS.map((id) => (
        <PersonNode key={id} x={NODES[id].x} y={NODES[id].y} label={NODES[id].label} dim={dim[id]} />
      ))}
      <ConstraintTags />
    </DiagramFrame>
  );
};
