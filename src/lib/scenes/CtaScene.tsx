import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { Beat } from "../timeline.ts";
import { DIM_TEXT, FONT } from "../palette.ts";
import { wordsToText } from "../sentences.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export type CtaSceneProps = {
  beatId: string;
  beats: Record<string, Beat>;
};

// A quieter, reflective closing question (not "like and subscribe"): the
// diagram has already receded, and this is the last thing on screen before
// the video ends. New writing, not a paraphrase of the essay's own closing
// sentence — see the skill's "CTA".
export const CtaScene: React.FC<CtaSceneProps> = ({ beatId, beats }) => {
  const frame = useCurrentFrame();
  const questionText = wordsToText(beats[beatId].words);

  const opacity = interpolate(frame, [15, 45], [0, 1], { ...clamp, easing: EASE });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 220px" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 42,
          fontStyle: "italic",
          lineHeight: 1.5,
          color: DIM_TEXT,
          opacity,
        }}
      >
        {questionText}
      </div>
    </AbsoluteFill>
  );
};
