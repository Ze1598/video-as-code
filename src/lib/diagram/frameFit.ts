export type NodeGeom = { x: number; y: number };

export type EdgeMargin = { top: number; right: number; bottom: number; left: number };

export type FrameFitOptions = {
  /** World-space allowance per node — used both to guarantee a focus node
   * fits with a real margin and to guarantee a non-focus node is actually
   * excluded, not just past its bare center. A plain number applies
   * uniformly on all four edges (e.g. for a quick override); the default is
   * an asymmetric object because PersonNode's real visual footprint is
   * asymmetric — its label renders BELOW the circle (radius 54 + a 38px
   * offset + ~26px of text, see PersonNode.tsx), so a symmetric margin
   * covers the circle but not the label underneath it. A node whose circle
   * fits cleanly with margin to spare can still have its label clipped at
   * the same zoom (found via BuildSomethingPurposeful's Management/Team
   * pair shot: the circle was safely in frame, the "Team" label wasn't —
   * see tests/frame-fit.test.ts's regression case for the exact
   * coordinates). Default: top/right/left 55 (just above the circle
   * radius, calibrated against the two real, human-verified-via-stills
   * camera shots this function's tests regress on — AvoidCommunicationSilos's
   * PAIR_ZOOM=1.8 pair shot, HoldYourStandards's TIGHT_ZOOM=1.9 tight
   * shot), bottom 130 (radius + label offset + text height + padding). A
   * video with unusually large labels, or a node type with a different
   * footprint than PersonNode, may want an explicit override. */
  margin?: number | Partial<EdgeMargin>;
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

// Exported so tests can exercise includeBound/excludeBound/isExcludedAt
// (via frameFitMath) against the REAL default, instead of a hand-copied
// literal that could silently drift from it.
export const DEFAULT_MARGIN: EdgeMargin = { top: 55, right: 55, bottom: 130, left: 55 };

function resolveMargin(margin: FrameFitOptions["margin"]): EdgeMargin {
  if (margin === undefined) return DEFAULT_MARGIN;
  if (typeof margin === "number") return { top: margin, right: margin, bottom: margin, left: margin };
  return {
    top: margin.top ?? DEFAULT_MARGIN.top,
    right: margin.right ?? DEFAULT_MARGIN.right,
    bottom: margin.bottom ?? DEFAULT_MARGIN.bottom,
    left: margin.left ?? DEFAULT_MARGIN.left,
  };
}

const DEFAULT_MIN_ZOOM = 0.5;
// A single-focus ("tight") shot has no other focus node to derive a fit
// bound from, so it saturates at this cap — chosen to match the tight
// zoom actually used (and human-verified) across both real videos so far
// (1.9-2.0), not an arbitrary ceiling. A video wanting a genuinely closer
// single-node shot can still override maxZoom explicitly.
const DEFAULT_MAX_ZOOM = 2.0;
const DEFAULT_VIEWPORT_W = 1920;
const DEFAULT_VIEWPORT_H = 1080;

// Derivation (see the skill's "Camera — derive the target"), generalized
// from a single symmetric margin to independent top/right/bottom/left
// margins: a node at world offset (dx, dy) from the camera center occupies
// the box [dx-left, dx+right] x [dy-top, dy+bottom]. It is fully INCLUDED
// at zoom z iff z <= min(halfW / max(dx+right, left-dx), halfH / max(dy+
// bottom, top-dy)) — the symmetric case (left=right=top=bottom=margin)
// reduces to max(dx+margin, margin-dx) = margin + |dx|, i.e. exactly the
// original halfW / (|dx| + margin) formula. It is fully EXCLUDED iff its
// near edge on some side has already crossed that side's boundary (see
// isExcludedAt below).
function includeBound(dx: number, dy: number, margin: EdgeMargin, halfW: number, halfH: number): number {
  const xBound = halfW / Math.max(dx + margin.right, margin.left - dx);
  const yBound = halfH / Math.max(dy + margin.bottom, margin.top - dy);
  return Math.min(xBound, yBound);
}

// Zoom at which the node's box first clears the viewport entirely on
// whichever side it's headed toward — Infinity if it never can (the box
// straddles the camera center on both axes, impossible to exclude at any
// zoom). Exposed for diagnostics only; fitCameraToFocus itself only needs
// isExcludedAt at the chosen zoom.
function excludeBound(dx: number, dy: number, margin: EdgeMargin, halfW: number, halfH: number): number {
  const candidates: number[] = [];
  if (dx - margin.left > 0) candidates.push(halfW / (dx - margin.left));
  if (dx + margin.right < 0) candidates.push(halfW / -(dx + margin.right));
  if (dy - margin.top > 0) candidates.push(halfH / (dy - margin.top));
  if (dy + margin.bottom < 0) candidates.push(halfH / -(dy + margin.bottom));
  return candidates.length > 0 ? Math.min(...candidates) : Infinity;
}

function isExcludedAt(dx: number, dy: number, margin: EdgeMargin, zoom: number, halfW: number, halfH: number): boolean {
  const excludedRight = (dx - margin.left) * zoom >= halfW;
  const excludedLeft = (dx + margin.right) * zoom <= -halfW;
  const excludedBelow = (dy - margin.top) * zoom >= halfH;
  const excludedAbove = (dy + margin.bottom) * zoom <= -halfH;
  return excludedRight || excludedLeft || excludedBelow || excludedAbove;
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
  const margin = resolveMargin(opts.margin);
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
