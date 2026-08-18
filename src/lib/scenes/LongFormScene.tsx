import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Beat, TimelineEntry } from "../timeline";
import { ACCENT, DIM_TEXT, FONT } from "../palette";
import { HighlightedText, sentenceCycle } from "./useSentenceCycle";

export type LongFormSceneProps = {
  beatId: string;
  beats: Record<string, Beat>;
  timeline: Record<string, TimelineEntry>;
  fps: number;
  highlight?: string;
  fontSize?: number;
};

// For pure reflective narration — a beat that states a general principle or
// thesis line, not tied to any specific node or relationship in the diagram
// (e.g. a Reframe or Smallest Correction beat). Renders as the SOLE content
// on screen: one real sentence at a time, centered in the full frame, at a
// larger size than the ordinary caption since nothing else is competing for
// attention. Pair with setting the diagram's opacity to a literal 0 (not a
// faint residual) for this beat — a bottom-anchored caption over a dimmed
// diagram reads as visible clutter once there's nothing else on screen to
// justify the diagram being there at all; see the skill's "Match technique
// to content". Wrap in its own <Sequence> per beat — this reads
// useCurrentFrame() as LOCAL to the beat, unlike Caption.
export const LongFormScene: React.FC<LongFormSceneProps> = ({
  beatId,
  beats,
  timeline,
  fps,
  highlight,
  fontSize = 44,
}) => {
  const frame = useCurrentFrame();
  const result = sentenceCycle(beats[beatId].words, frame, timeline[beatId].duration, fps, highlight);

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 220px" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize,
          lineHeight: 1.5,
          textAlign: "center",
          color: DIM_TEXT,
          opacity: result.opacity,
        }}
      >
        <HighlightedText result={result} highlight={highlight} accentColor={ACCENT} />
      </div>
    </AbsoluteFill>
  );
};
