import { interpolate } from "remotion";

export type AccentWindow = {
  startFrame: number;
  endFrame: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
};

/**
 * A bounded 0..1 emphasis envelope for the gold retention accent.
 *
 * Gold is semantic: it marks the correct move the viewer should retain. It
 * must therefore have an explicit end and return to neutral once narration
 * moves on. Case-study state should not call this helper at all.
 */
export function accentEnvelope(
  frame: number,
  { startFrame, endFrame, fadeInFrames = 12, fadeOutFrames = 18 }: AccentWindow,
): number {
  if (endFrame <= startFrame) throw new Error("accentEnvelope: endFrame must be greater than startFrame");
  if (fadeInFrames < 0 || fadeOutFrames < 0) {
    throw new Error("accentEnvelope: fade durations cannot be negative");
  }
  if (fadeInFrames + fadeOutFrames > endFrame - startFrame) {
    throw new Error("accentEnvelope: fade durations exceed the accent window");
  }

  if (frame <= startFrame || frame >= endFrame) return 0;
  if (fadeInFrames > 0 && frame < startFrame + fadeInFrames) {
    return interpolate(frame, [startFrame, startFrame + fadeInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (fadeOutFrames > 0 && frame > endFrame - fadeOutFrames) {
    return interpolate(frame, [endFrame - fadeOutFrames, endFrame], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return 1;
}
