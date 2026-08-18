import { test } from "node:test";
import assert from "node:assert/strict";
import { fitCameraToFocus } from "../src/lib/diagram/frameFit.ts";

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

test("regression — AvoidCommunicationSilos's original cramped layout: pair(design, operations) excludes engineering", () => {
  // The exact coordinates that leaked Engineering into frame at a
  // hand-picked PAIR_ZOOM of 1.15 before the fix.
  const nodes = {
    design: { x: 960, y: 320 },
    operations: { x: 560, y: 820 },
    engineering: { x: 1360, y: 820 },
  };
  const result = fitCameraToFocus(nodes, ["design", "operations"]);
  assert.ok(
    result.excludesNonFocus,
    `expected engineering excluded, but leaked: ${result.leakingNodeIds.join(", ")}`,
  );
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

test("zoom is clamped to the provided minZoom/maxZoom bounds", () => {
  const nodes = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } };
  const tight = fitCameraToFocus(nodes, ["a"], { maxZoom: 2 });
  assert.ok(tight.zoom <= 2);
  const wide = fitCameraToFocus(nodes, [], { minZoom: 3 });
  assert.ok(wide.zoom >= 3);
});
