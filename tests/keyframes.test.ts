import { test } from "node:test";
import assert from "node:assert/strict";
import { assertStrictlyIncreasing, opacityFactory } from "../src/lib/keyframes.ts";
import { cameraTransformFactory } from "../src/lib/Camera.ts";

// Regression tests for two real bugs hit while building HoldYourStandards:
// a camera-keyframe collision at a beat boundary (two adjacent beats each
// placing a point at the identical shared frame with different targets),
// and — in an earlier video — a "hold" expressed as a single point that
// then drifted across an entire beat instead of actually holding. Both are
// the same underlying `interpolate()` failure mode; see keyframes.ts.

test("assertStrictlyIncreasing: passes on valid strictly increasing input", () => {
  assert.doesNotThrow(() => assertStrictlyIncreasing([0, 10, 20, 20.5, 100], "test"));
});

test("assertStrictlyIncreasing: throws a clear error on a duplicate frame", () => {
  assert.throws(
    () => assertStrictlyIncreasing([0, 10, 10, 20], "test label"),
    /test label.*frame 10 at index 2.*previous frame 10 at index 1/s,
  );
});

test("assertStrictlyIncreasing: throws on a decreasing frame", () => {
  assert.throws(() => assertStrictlyIncreasing([0, 10, 5], "test"), /frame 5 at index 2/);
});

test("cameraTransformFactory: throws on the exact HoldYourStandards boundary-collision pattern", () => {
  // Two adjacent beats: beat A holds target 1 until frame 100 (its own
  // end), beat B starts its own target at frame 100 (its own start) — same
  // frame, different targets. This is exactly what broke.
  assert.throws(
    () =>
      cameraTransformFactory(
        [0, 100, 100, 200],
        [500, 500, 900, 900],
        [500, 500, 900, 900],
        [1, 1, 2, 2],
      ),
    /camera keyframes/,
  );
});

test("cameraTransformFactory: a boundary-safe pan (offset before the shared frame) does not throw", () => {
  // The documented fix: beat A's last hold point sits BEFORE the boundary
  // (100 - SLOW), beat B's arrival lands exactly ON the boundary (100).
  const SLOW = 20;
  const transform = cameraTransformFactory(
    [0, 100 - SLOW, 100, 200],
    [500, 500, 900, 900],
    [500, 500, 900, 900],
    [1, 1, 2, 2],
  );
  assert.doesNotThrow(() => transform(50));
  assert.doesNotThrow(() => transform(150));
});

test("opacityFactory: throws on a boundary-collision pattern, same as camera", () => {
  assert.throws(() => opacityFactory([0, 50, 50, 100], [0, 1, 0, 1]), /opacity keyframes/);
});

test("opacityFactory: a genuine hold (two equal-value points) stays flat across the whole span, not a drift", () => {
  // This is the exact shape of the AvoidCommunicationSilos bug: without a
  // real hold pair, an eased interpolate between a single "arrived" point
  // and a much later "leaves" point collapses to near-zero long before the
  // beat actually ends. With a proper hold — two points at value 1 — the
  // opacity must stay at 1 across the ENTIRE span between them, not just
  // at the endpoints.
  const opacity = opacityFactory([0, 20, 980, 1000], [0, 1, 1, 0]);
  for (const frame of [20, 100, 500, 900, 980]) {
    assert.equal(opacity(frame), 1, `expected a flat hold of 1 at frame ${frame}, got ${opacity(frame)}`);
  }
  assert.ok(opacity(10) > 0 && opacity(10) < 1, "expected a genuine fade-in before frame 20");
  assert.ok(opacity(990) > 0 && opacity(990) < 1, "expected a genuine fade-out after frame 980");
});
