import { Easing, interpolate } from "remotion";
import { CAMERA_FRAMES, CAMERA_X, CAMERA_Y, CAMERA_ZOOM } from "./layout";

// Ease-in-out, not the ease-out curve used for text entrances elsewhere: a
// pan needs to accelerate away from its start AND decelerate into its next
// hold, or it reads as a snap with a decorative curve rather than a camera
// operator actually sweeping across the layout.
const EASE = Easing.inOut(Easing.cubic);

const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;

const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: EASE };

// The camera is one look-at point (x, y) plus a zoom level over the fixed
// world layout. Holding still is the default — motion only happens where a
// keyframe says something changed (see layout.ts's CAMERA_KEYFRAMES).
// Returned as an SVG `transform` attribute value (unitless user-space units,
// matching the world SVG's 1920x1080 viewBox), applied to the camera <g>.
export function cameraTransform(frame: number): string {
  const x = interpolate(frame, CAMERA_FRAMES, CAMERA_X, opts);
  const y = interpolate(frame, CAMERA_FRAMES, CAMERA_Y, opts);
  const zoom = interpolate(frame, CAMERA_FRAMES, CAMERA_ZOOM, opts);

  const tx = VIEWPORT_W / 2 - x * zoom;
  const ty = VIEWPORT_H / 2 - y * zoom;

  return `translate(${tx}, ${ty}) scale(${zoom})`;
}
