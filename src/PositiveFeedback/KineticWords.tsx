import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { WordTiming } from "./data";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

type KineticWordsProps = {
  words: WordTiming[];
  fps: number;
  durationInFrames: number;
  fadeOutFrames: number;
  fontSize?: number;
  color?: string;
  accentColor?: string;
  maxWidth?: number;
  lineHeight?: number;
  flat?: boolean;
  riseFrames?: number;
  riseDistance?: number;
  isHighlighted?: (word: string, index: number) => boolean;
  glow?: boolean;
  italic?: boolean;
};

// Word entrances are driven by each word's real ElevenLabs start timestamp
// (converted to a frame number), not a fixed per-word stagger. All words in a
// sentence share one exit fade at the end of the beat.
export const KineticWords: React.FC<KineticWordsProps> = ({
  words,
  fps,
  durationInFrames,
  fadeOutFrames,
  fontSize = 56,
  color = "#F2EDE4",
  accentColor = "#E8A33D",
  maxWidth = 1400,
  lineHeight = 1.35,
  flat = false,
  riseFrames = 12,
  riseDistance = 26,
  isHighlighted,
  glow = false,
  italic = false,
}) => {
  const frame = useCurrentFrame();
  const fadeStart = durationInFrames - fadeOutFrames;
  const fadeEnd = durationInFrames;

  const glowBlur = glow
    ? interpolate(frame, [Math.round(fadeStart * 0.4), fadeStart], [0, 20], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE,
      })
    : 0;

  return (
    <div
      style={{
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize,
        fontWeight: 400,
        fontStyle: italic ? "italic" : "normal",
        color,
        textAlign: "center",
        maxWidth,
        lineHeight,
        textShadow: glow ? `0 0 ${glowBlur}px ${accentColor}` : undefined,
      }}
    >
      {words.map((word, index) => {
        const entranceStart = Math.round((word.startMs * fps) / 1000);
        const entranceEnd = entranceStart + riseFrames;

        const opacity = interpolate(
          frame,
          [entranceStart, entranceEnd, fadeStart, fadeEnd],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
        );

        const rise = flat
          ? 0
          : interpolate(frame, [entranceStart, entranceEnd], [riseDistance, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE,
            });

        const highlighted = isHighlighted?.(word.text, index) ?? false;

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              opacity,
              translate: `0px ${rise}px`,
              color: highlighted ? accentColor : color,
              fontWeight: highlighted ? 700 : 400,
            }}
          >
            {word.text}
            {index < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};
