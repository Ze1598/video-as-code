import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { Beat } from "../timeline.ts";
import { ACCENT, FONT, TEXT } from "../palette.ts";
import { wordsToText } from "../sentences.ts";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export type HookSceneProps = {
  beatId: string;
  beats: Record<string, Beat>;
  /** [start, end) word-slice indices for the bold setup line. */
  setupRange: [number, number];
  /** [start, end) word-slice indices for the quieter punchline line. */
  punchlineRange: [number, number];
  /**
   * LOCAL frame (within this scene's own <Sequence>) to start fading the
   * punchline in — anchor it to the punchline's own first real word:
   * `frameOfWord(beatId, firstPunchlineWord) - timeline[beatId].from`.
   * Don't guess a number; the whole point of this format is that every
   * reveal is anchored to real speech.
   */
  punchlineStartFrame: number;
};

// A cold open before the diagram exists (Beat 0 in this format's causal
// architecture): the setup lands as one bold statement, then the punchline
// settles in quieter beneath it. Both the Hook and the closing CTA are new
// writing, not compressed essay sentences — see the skill's "Hook"/"CTA".
export const HookScene: React.FC<HookSceneProps> = ({ beatId, beats, setupRange, punchlineRange, punchlineStartFrame }) => {
  const frame = useCurrentFrame();
  const words = beats[beatId].words;

  const setupText = wordsToText(words.slice(...setupRange));
  const punchlineText = wordsToText(words.slice(...punchlineRange));

  const setupOpacity = interpolate(frame, [10, 38], [0, 1], { ...clamp, easing: EASE });
  const setupShift = interpolate(frame, [10, 42], [22, 0], { ...clamp, easing: EASE });

  const punchlineOpacity = interpolate(
    frame,
    [punchlineStartFrame, punchlineStartFrame + 30],
    [0, 1],
    { ...clamp, easing: EASE },
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        padding: "0 200px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 700,
          lineHeight: 1.35,
          color: TEXT,
          opacity: setupOpacity,
          translate: `0px ${setupShift}px`,
        }}
      >
        {setupText}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 34,
          lineHeight: 1.4,
          color: ACCENT,
          opacity: punchlineOpacity,
        }}
      >
        {punchlineText}
      </div>
    </AbsoluteFill>
  );
};
