import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_MARGIN, fitCameraToFocus, frameFitMath } from "../src/lib/diagram/frameFit.ts";

// Covers 0/1/2/N-focus cases, plus regression cases reproducing the two
// real bugs this function exists to prevent: AvoidCommunicationSilos's
// design/operations pair shot leaking Engineering into frame, and
// HoldYourStandards's tight Team Lead shot leaking Other Managers — both
// previously caught only by a still-check, not by anything mechanical.

test("0-focus (wide): centers on the centroid of every node, includes everyone", () => {
  const nodes = { a: { x: 0, y: 0 }, b: { x: 1000, y: 0 }, c: { x: 500, y: 500 } };
  const result = fitCameraToFocus(nodes, []);
  assert.equal(result.x, 500);
  assert.ok(result.excludesNonFocus, "0-focus case has nothing to exclude by definition");
  assert.deepEqual(result.leakingNodeIds, []);
});

test("1-focus (tight): centers exactly on that node", () => {
  const nodes = { a: { x: 300, y: 400 }, b: { x: 900, y: 400 } };
  const result = fitCameraToFocus(nodes, ["a"]);
  assert.equal(result.x, 300);
  assert.equal(result.y, 400);
});

test("2-focus (pair): centers on the midpoint", () => {
  const nodes = { a: { x: 0, y: 0 }, b: { x: 1000, y: 0 } };
  const result = fitCameraToFocus(nodes, ["a", "b"]);
  assert.equal(result.x, 500);
  assert.equal(result.y, 0);
});

test("4-focus: centers on the centroid of exactly those four, not all nodes", () => {
  const nodes = {
    a: { x: 0, y: 0 },
    b: { x: 100, y: 0 },
    c: { x: 0, y: 100 },
    d: { x: 100, y: 100 },
    outlier: { x: 5000, y: 5000 },
  };
  const result = fitCameraToFocus(nodes, ["a", "b", "c", "d"], { margin: 20 });
  assert.equal(result.x, 50);
  assert.equal(result.y, 50);
  assert.ok(result.excludesNonFocus);
  assert.deepEqual(result.leakingNodeIds, []);
});

test("regression — AvoidCommunicationSilos's shipped layout: pair(design, operations) and pair(design, engineering) exclude the third node with a real margin", () => {
  // This video's ORIGINAL layout (design 960,320 / operations 560,820 /
  // engineering 1360,820, the coordinates this test used to hardcode)
  // excluded the third node by a zoom buffer of only 0.0095 under the old
  // symmetric 55px margin — razor-thin, not a real margin. Once the
  // default margin was corrected to account for a label's real footprint
  // below its node (see the "asymmetric margin" tests below), that shot
  // stopped clearing the threshold at all. The layout was widened in
  // response (see src/AvoidCommunicationSilos/layout.ts) to a real ~0.43
  // zoom buffer, verified here — a cramped layout that only barely passes
  // is exactly the kind of case a margin correction should be expected to
  // break, and the fix is to widen the layout, not loosen the margin.
  const nodes = {
    design: { x: 960, y: 200 },
    operations: { x: 300, y: 680 },
    engineering: { x: 1620, y: 680 },
  };
  for (const focusIds of [
    ["design", "operations"],
    ["design", "engineering"],
  ]) {
    const result = fitCameraToFocus(nodes, focusIds);
    assert.ok(
      result.excludesNonFocus,
      `${JSON.stringify(focusIds)} leaked: ${result.leakingNodeIds.join(", ")}`,
    );
  }
});

test("regression — HoldYourStandards's original cramped layout: tight(teamLead) excludes otherManagers", () => {
  // The exact coordinates that leaked Other Managers into frame at a
  // hand-picked TIGHT_ZOOM of 1.9 before the fix.
  const nodes = {
    teamLead: { x: 960, y: 280 },
    otherManagers: { x: 1500, y: 280 },
    team: { x: 620, y: 820 },
    operations: { x: 1300, y: 820 },
  };
  const result = fitCameraToFocus(nodes, ["teamLead"]);
  assert.ok(
    result.excludesNonFocus,
    `expected otherManagers excluded, but leaked: ${result.leakingNodeIds.join(", ")}`,
  );
});

test("regression — HoldYourStandards's shipped wider layout passes every camera shot it actually uses", () => {
  const nodes = {
    teamLead: { x: 760, y: 260 },
    otherManagers: { x: 1600, y: 260 },
    team: { x: 380, y: 840 },
    operations: { x: 1400, y: 840 },
  };
  const shots: string[][] = [
    ["teamLead", "otherManagers"],
    ["teamLead", "team"],
    ["team", "operations"],
    ["teamLead"],
    ["operations"],
    ["team"],
  ];
  for (const focusIds of shots) {
    const result = fitCameraToFocus(nodes, focusIds);
    assert.ok(
      result.excludesNonFocus,
      `${JSON.stringify(focusIds)} leaked: ${result.leakingNodeIds.join(", ")}`,
    );
  }
});

test("regression — HowToBeUnderstood's hub-spoke layout: tight() on each node excludes the other three at maxZoom 2.3", () => {
  // Found DURING this retrofit, not before it: Engineer 1 and Engineer 2
  // sit only 80 world-units apart vertically (though 500 apart
  // horizontally), so the generic default maxZoom (2.0) left Engineer 2
  // bleeding into a tight Engineer 1 shot in the actual shipped video —
  // confirmed by rendering a still of the untouched composition. 2.3 is
  // the fix, verified here for all four tight shots this video uses.
  const nodes = {
    lead: { x: 960, y: 260 },
    eng1: { x: 460, y: 820 },
    eng2: { x: 960, y: 900 },
    eng3: { x: 1460, y: 820 },
  };
  for (const focusId of Object.keys(nodes)) {
    const result = fitCameraToFocus(nodes, [focusId], { maxZoom: 2.3 });
    assert.ok(
      result.excludesNonFocus,
      `tight(${focusId}) leaked: ${result.leakingNodeIds.join(", ")}`,
    );
  }
});

test("genuinely infeasible layout: a node coincident with the focus reports the honest failure, not a thrown error", () => {
  const nodes = { focus: { x: 500, y: 500 }, tooClose: { x: 500, y: 500 } };
  const result = fitCameraToFocus(nodes, ["focus"]);
  assert.equal(result.excludesNonFocus, false);
  assert.deepEqual(result.leakingNodeIds, ["tooClose"]);
});

test("regression — BuildSomethingPurposeful's Management/Team pair: default margin protects a focus node's label, not just its circle", () => {
  // PersonNode's label renders BELOW the circle (radius 54 + a 38px offset
  // + ~26px of text — see PersonNode.tsx), not symmetrically around it. The
  // old default margin was a single symmetric 55px, sized for the circle
  // only. Team sits south of this pair's centroid, so its LABEL — not its
  // circle — is what actually reaches toward the frame edge here: the old
  // margin let fitCameraToFocus return a zoom where Team's circle had
  // margin to spare while its label clipped past the bottom edge
  // (confirmed by rendering a still of this exact shot before the fix).
  const nodes = { mgmt: { x: 960, y: 140 }, team: { x: 960, y: 520 } };

  const corrected = fitCameraToFocus(nodes, ["mgmt", "team"]);
  const naiveSymmetric = fitCameraToFocus(nodes, ["mgmt", "team"], { margin: 55 });

  assert.ok(
    corrected.zoom < naiveSymmetric.zoom,
    `expected the label-aware default (zoom ${corrected.zoom}) to be strictly tighter than the old ` +
      `symmetric 55px margin (zoom ${naiveSymmetric.zoom}) — Team's label needs more room than its circle alone`,
  );

  const halfH = 540;
  const teamLabelFootprint = 54 + 38 + 26; // circle radius + label offset + font size, from PersonNode.tsx
  const teamLabelBottomAtCorrected = (nodes.team.y - corrected.y + teamLabelFootprint) * corrected.zoom;
  const teamLabelBottomAtNaive = (nodes.team.y - naiveSymmetric.y + teamLabelFootprint) * naiveSymmetric.zoom;

  assert.ok(
    teamLabelBottomAtCorrected <= halfH,
    `Team's real label footprint (${teamLabelBottomAtCorrected.toFixed(1)}px) still exceeds the frame's ` +
      `half-height (${halfH}) at the corrected zoom ${corrected.zoom}`,
  );
  assert.ok(
    teamLabelBottomAtNaive > halfH,
    `expected the old symmetric margin to actually reproduce the clip (label at ` +
      `${teamLabelBottomAtNaive.toFixed(1)}px vs half-height ${halfH}) — if this fails, the bug wasn't real`,
  );
});

test("asymmetric margin, inclusion side: a focus node SOUTH of center is the binding constraint, because its label points away from center", () => {
  // Two nodes equidistant from the pair's centroid, one north (negative
  // dy) and one south (positive dy) — the north node's label points back
  // TOWARD center (barely extends its "far" edge), the south node's label
  // points AWAY from center (extends its far edge a full extra
  // marginBottom). A symmetric margin can't tell these apart; the
  // corrected one must, and the south node must be the tighter bound.
  const north = frameFitMath.includeBound(0, -200, DEFAULT_MARGIN, 960, 540);
  const south = frameFitMath.includeBound(0, 200, DEFAULT_MARGIN, 960, 540);
  assert.ok(south < north, `expected south (${south}) to be the tighter (smaller) include bound than north (${north})`);
});

test("asymmetric margin, exclusion side: a non-focus node NORTH of the focus is harder to exclude, because its label points toward center", () => {
  // This is the second, distinct way the same asymmetry bites: a
  // NON-focus node sitting north of a tight/pair shot's focus has its
  // label reaching back down toward that focus, encroaching on the frame
  // in a way a south-positioned node at the same distance doesn't. This is
  // exactly what broke BuildSomethingPurposeful's tight(team) shot a
  // second time (Management, sitting north of Team, leaked in) after the
  // first fix — the layout needed MORE vertical room north of a focus than
  // south of it, not just more room in general.
  const north = frameFitMath.excludeBound(0, -300, DEFAULT_MARGIN, 960, 540);
  const south = frameFitMath.excludeBound(0, 300, DEFAULT_MARGIN, 960, 540);
  assert.ok(
    north > south,
    `expected north (${north}) to need a HIGHER zoom to exclude than south (${south}) — a north node's label reaches toward center`,
  );
});

test("margin as a plain number still applies uniformly on all four edges (backward compatible)", () => {
  const nodes = { a: { x: 0, y: 0 }, b: { x: 1000, y: 0 } };
  const uniform = fitCameraToFocus(nodes, ["a"], { margin: 20 });
  const explicit = fitCameraToFocus(nodes, ["a"], { margin: { top: 20, right: 20, bottom: 20, left: 20 } });
  assert.equal(uniform.zoom, explicit.zoom);
  assert.equal(uniform.excludesNonFocus, explicit.excludesNonFocus);
});

test("zoom is clamped to the provided minZoom/maxZoom bounds", () => {
  const nodes = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } };
  const tight = fitCameraToFocus(nodes, ["a"], { maxZoom: 2 });
  assert.ok(tight.zoom <= 2);
  const wide = fitCameraToFocus(nodes, [], { minZoom: 3 });
  assert.ok(wide.zoom >= 3);
});
