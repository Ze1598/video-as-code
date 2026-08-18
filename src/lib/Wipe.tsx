import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ACCENT } from "./palette";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// A full-screen color sweep used only when the video switches OUT of the
// diagram into a dedicated typographic scene (or back) — a deliberate "the
// screen changes" cue. Reserve it for actual mode switches (diagram <->
// dedicated scene), not every beat, or it stops meaning anything — see the
// skill's "Scene transitions (wipes)". `atFrame` is a GLOBAL frame number
// (renders unsequenced, at the composition root).
export const Wipe: React.FC<{ atFrame: number; color?: string }> = ({ atFrame, color = ACCENT }) => {
  const frame = useCurrentFrame();
  const span = 30;
  if (frame < atFrame - span / 2 - 2 || frame > atFrame + span / 2 + 2) return null;

  const x = interpolate(
    frame,
    [atFrame - span / 2, atFrame, atFrame + span / 2],
    [-100, 0, 100],
    { ...clamp, easing: Easing.inOut(Easing.ease) },
  );

  return <AbsoluteFill style={{ backgroundColor: color, transform: `translateX(${x}%)`, zIndex: 50 }} />;
};
