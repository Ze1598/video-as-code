import test from "node:test";
import assert from "node:assert/strict";
import { fitCameraToFocus } from "../src/archive/lib/diagram/frameFit.ts";

const nodes = {
  head: { x: 960, y: 0 },
  team: { x: 960, y: 650 },
  provider: { x: -200, y: 1300 },
  migration: { x: 650, y: 1350 },
  meetings: { x: 2100, y: 1150 },
};

const shots = [
  ["head"],
  ["head", "team"],
  ["provider", "migration", "team"],
  ["team", "meetings"],
  ["provider", "migration"],
  ["migration"],
  ["team"],
];

test("ChangingTooMuch: every narrative camera shot excludes non-focus nodes with wide-label margins", () => {
  for (const focusIds of shots) {
    const result = fitCameraToFocus(nodes, focusIds, {
      maxZoom: 2.4,
      margin: { left: 150, right: 150 },
    });
    assert.equal(
      result.excludesNonFocus,
      true,
      `${focusIds.join("+")} leaks ${result.leakingNodeIds.join(", ")}`,
    );
  }
});
