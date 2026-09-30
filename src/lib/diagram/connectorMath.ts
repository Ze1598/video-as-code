export type DrawOnStyle = {
  pathLength: number;
  strokeDasharray: number;
  strokeDashoffset: number;
};

// Growing-line draw-on via the pathLength=1 trick: resolution/length
// independent, so connectors between differently-spaced nodes all draw at a
// visually consistent rate for the same progress value. Spread the result
// onto an SVG <line>/<path>: `<line ... {...drawOnStyle(t)} />`.
//
// `t` must go from 0 (fully hidden) to 1 (fully drawn), driven by a LINEAR
// interpolate — found and fixed this session: using the same eased curve as
// text entrances (Easing.bezier(0.16,1,0.3,1)) front-loads almost all the
// growth into roughly the first third of the draw duration, so the line
// looked already fully drawn well before its draw window ended — an instant
// pop, not a line actually growing. Use `interpolate(frame, [start, start +
// drawDuration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight:
// "clamp" })` — no easing — to compute `t`.
export function drawOnStyle(t: number): DrawOnStyle {
  return {
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - t,
  };
}
