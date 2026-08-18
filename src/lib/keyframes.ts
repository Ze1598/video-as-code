import { Easing, interpolate } from "remotion";

// `interpolate()` requires strictly increasing input frames. The most
// common way a video's own layout.ts violates that: two ADJACENT diagram
// beats (no dedicated scene between them) each place a keyframe exactly at
// their shared boundary frame — `beat[n].from + beat[n].duration` from one
// side, `beat[n + 1].from` from the other — which are numerically the same
// frame, since `buildTimeline` makes beats contiguous. Remotion's own error
// for this is a generic "not strictly monotonically increasing" deep inside
// `interpolate`, with no indication of which layout.ts line caused it or
// why. Call this at KEYFRAME-CONSTRUCTION time (inside a factory, not
// inside the per-frame closure it returns) so the real cause surfaces
// immediately, at module load, pointing at the actual array.
export function assertStrictlyIncreasing(frames: number[], label: string): void {
  for (let i = 1; i < frames.length; i++) {
    if (frames[i] <= frames[i - 1]) {
      throw new Error(
        `${label}: frame ${frames[i]} at index ${i} is not strictly greater than the ` +
          `previous frame ${frames[i - 1]} at index ${i - 1}. interpolate() requires ` +
          `strictly increasing input. This is usually two adjacent beats each placing a ` +
          `keyframe exactly at their shared boundary frame (beats are contiguous, so ` +
          `beat[n].from + beat[n].duration === beat[n + 1].from) — pan into the boundary ` +
          `from one side only (e.g. { frame: nextBeat.from - SLOW, target: ... } then ` +
          `{ frame: nextBeat.from, target: newTarget }), never a flat hold point AT the ` +
          `shared boundary frame from both sides. See the leadership-visual-essay skill's ` +
          `"Camera must actually hold, not drift".`,
      );
    }
  }
}

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: EASE };

// Mirrors cameraTransformFactory's shape (construct once from a video's own
// WORLD_OPACITY_FRAMES/VALUES, call per frame) — because WORLD_OPACITY uses
// the exact same `interpolate` mechanism as the camera and is subject to
// the exact same hold-vs-drift and boundary-collision failure modes (see
// the skill's "Camera must actually hold, not drift", which the same rule
// now generalizes to). Validates eagerly via assertStrictlyIncreasing.
export function opacityFactory(frames: number[], values: number[]): (frame: number) => number {
  assertStrictlyIncreasing(frames, "opacity keyframes");
  return function worldOpacity(frame: number): number {
    return interpolate(frame, frames, values, opts);
  };
}
