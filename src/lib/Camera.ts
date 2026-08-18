import { Easing, interpolate } from "remotion";

// Ease-in-out, not the ease-out curve used for text entrances elsewhere: a
// pan needs to accelerate away from its start AND decelerate into its next
// hold, or it reads as a snap with a decorative curve rather than a camera
// operator actually sweeping across the layout.
const EASE = Easing.inOut(Easing.cubic);

const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;

const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: EASE };

// The camera is one look-at point (x, y) plus a zoom level over a video's
// own fixed world layout. Holding still is the default — motion only
// happens where a keyframe says something changed (build CAMERA_FRAMES/X/Y/
// ZOOM in the video's own layout.ts as explicit (arrive, hold-until) pairs;
// see the skill's "Camera must actually hold, not drift"). Returns an SVG
// `transform` attribute value, applied to the camera <g>.
export function cameraTransformFactory(
  frames: number[],
  xs: number[],
  ys: number[],
  zooms: number[],
): (frame: number) => string {
  return function cameraTransform(frame: number): string {
    const x = interpolate(frame, frames, xs, opts);
    const y = interpolate(frame, frames, ys, opts);
    const zoom = interpolate(frame, frames, zooms, opts);

    const tx = VIEWPORT_W / 2 - x * zoom;
    const ty = VIEWPORT_H / 2 - y * zoom;

    return `translate(${tx}, ${ty}) scale(${zoom})`;
  };
}
