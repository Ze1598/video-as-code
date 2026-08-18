export type NodeGeom = { x: number; y: number };

export type FrameFitOptions = {
  /** World-space allowance per node — used both to guarantee a focus node
   * fits with a real margin and to guarantee a non-focus node is actually
   * excluded, not just past its bare center. Default 55, just above
   * PersonNode's default circle radius (54) — calibrated against the two
   * real, human-verified-via-stills camera shots this function's tests
   * regress on (AvoidCommunicationSilos's PAIR_ZOOM=1.8 pair shot,
   * HoldYourStandards's TIGHT_ZOOM=1.9 tight shot); a video with unusually
   * wide labels may want a larger override. */
  margin?: number;
  minZoom?: number;
  maxZoom?: number;
  viewportWidth?: number;
  viewportHeight?: number;
};

export type FrameFitResult = {
  x: number;
  y: number;
  zoom: number;
  /** True only if every non-focus node is actually confirmed excluded at
   * the returned zoom — never assume success just because a zoom was
   * computed; clamping to minZoom/maxZoom can still leave a leak. */
  excludesNonFocus: boolean;
  /** Non-focus node ids that still overlap the frame at the returned zoom.
   * Empty when excludesNonFocus is true. */
  leakingNodeIds: string[];
};

const DEFAULT_MARGIN = 55;
const DEFAULT_MIN_ZOOM = 0.5;
// A single-focus ("tight") shot has no other focus node to derive a fit
// bound from, so it saturates at this cap — chosen to match the tight
// zoom actually used (and human-verified) across both real videos so far
// (1.9-2.0), not an arbitrary ceiling. A video wanting a genuinely closer
// single-node shot can still override maxZoom explicitly.
const DEFAULT_MAX_ZOOM = 2.0;
const DEFAULT_VIEWPORT_W = 1920;
const DEFAULT_VIEWPORT_H = 1080;

// Derivation (see the skill's "Camera — derive the target"): for a node at
// world offset (dx, dy) from the camera center, it is fully INCLUDED at
// zoom z iff z <= min(halfW / (|dx| + margin), halfH / (|dy| + margin)),
// and fully EXCLUDED iff z >= the smaller of the finite values among
// halfW / (|dx| - margin) and halfH / (|dy| - margin) (impossible —
// infinite — if |dx| <= margin AND |dy| <= margin, i.e. the node sits
// within the margin ball around the camera center regardless of zoom).
function includeBound(dx: number, dy: number, margin: number, halfW: number, halfH: number): number {
  return Math.min(halfW / (Math.abs(dx) + margin), halfH / (Math.abs(dy) + margin));
}

function excludeBound(dx: number, dy: number, margin: number, halfW: number, halfH: number): number {
  const xBound = Math.abs(dx) > margin ? halfW / (Math.abs(dx) - margin) : Infinity;
  const yBound = Math.abs(dy) > margin ? halfH / (Math.abs(dy) - margin) : Infinity;
  return Math.min(xBound, yBound);
}

function isExcludedAt(dx: number, dy: number, margin: number, zoom: number, halfW: number, halfH: number): boolean {
  return Math.abs(dx) * zoom - margin * zoom >= halfW || Math.abs(dy) * zoom - margin * zoom >= halfH;
}

// Computes a camera target (x, y, zoom) focused on `focusIds`, generalized
// over how many focus nodes there are (0 = wide/centroid-of-everything, 1 =
// tight, 2 = pair, N = anything else) — see the skill's "Camera — derive
// the target". Replaces hand-picked TIGHT_ZOOM/PAIR_ZOOM constants, which
// don't automatically stay valid when a video's node layout changes (this
// leaked a non-focus node into frame twice: `AvoidCommunicationSilos`'s
// design/operations pair shot, and `HoldYourStandards`'s tight Team Lead
// shot, both caught only by a still-check, not by anything mechanical).
// Always check `excludesNonFocus` before trusting the result — a caller
// (or a test) should treat `false` as a real layout problem, not silently
// ship the leak.
export function fitCameraToFocus(
  nodes: Record<string, NodeGeom>,
  focusIds: string[],
  opts: FrameFitOptions = {},
): FrameFitResult {
  const margin = opts.margin ?? DEFAULT_MARGIN;
  const minZoom = opts.minZoom ?? DEFAULT_MIN_ZOOM;
  const maxZoom = opts.maxZoom ?? DEFAULT_MAX_ZOOM;
  const halfW = (opts.viewportWidth ?? DEFAULT_VIEWPORT_W) / 2;
  const halfH = (opts.viewportHeight ?? DEFAULT_VIEWPORT_H) / 2;

  const allIds = Object.keys(nodes);
  const focusSet = new Set(focusIds);

  // 0-focus ("wide"): nothing to exclude, center on everyone, zoom to fit
  // everyone with margin.
  const effectiveFocusIds = focusIds.length > 0 ? focusIds : allIds;

  const cx = effectiveFocusIds.reduce((sum, id) => sum + nodes[id].x, 0) / effectiveFocusIds.length;
  const cy = effectiveFocusIds.reduce((sum, id) => sum + nodes[id].y, 0) / effectiveFocusIds.length;

  const maxZoomForFit = Math.min(
    maxZoom,
    ...effectiveFocusIds.map((id) => includeBound(nodes[id].x - cx, nodes[id].y - cy, margin, halfW, halfH)),
  );
  const zoom = Math.max(minZoom, maxZoomForFit);

  if (focusIds.length === 0) {
    return { x: cx, y: cy, zoom, excludesNonFocus: true, leakingNodeIds: [] };
  }

  const nonFocusIds = allIds.filter((id) => !focusSet.has(id));
  const leakingNodeIds = nonFocusIds.filter((id) => !isExcludedAt(nodes[id].x - cx, nodes[id].y - cy, margin, zoom, halfW, halfH));

  return { x: cx, y: cy, zoom, excludesNonFocus: leakingNodeIds.length === 0, leakingNodeIds };
}

// Exposed for tests/diagnostics that want the raw feasible-zoom-range
// arithmetic without going through the full fit (e.g. to assert a genuinely
// infeasible layout reports the correct infinite/impossible bound).
export const frameFitMath = { includeBound, excludeBound, isExcludedAt };
