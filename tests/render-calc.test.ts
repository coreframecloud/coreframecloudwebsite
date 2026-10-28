// node --experimental-strip-types --test tests/  (npm test)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANCHOR,
  USER_GPUS,
  anchorSecondsOn,
  costFor,
  formatDuration,
  ourGpuScore,
  parseFrameTime,
  scaleSeconds,
} from "../lib/render-calc.ts";

test("the anchor reproduces our measured RTX 5080 time exactly", () => {
  assert.equal(anchorSecondsOn(ANCHOR.score), ANCHOR.seconds);
});

test("a faster GPU means proportionally less time, never more", () => {
  const slow = scaleSeconds(100, 2000, 2000);
  const fast = scaleSeconds(100, 2000, 8000);
  assert.equal(slow, 100);
  assert.equal(fast, 25);
  assert.equal(scaleSeconds(0, 1, 1), 0);
  assert.equal(scaleSeconds(10, 0, 1), 0);
});

test("rate-card GPUs map to an Open Data score; unknown cards get none", () => {
  assert.equal(ourGpuScore("NVIDIA RTX 5080"), 9138.2);
  assert.equal(ourGpuScore("NVIDIA RTX 6000 Ada Generation"), 10655.3);
  assert.equal(ourGpuScore("NVIDIA RTX PRO 6000"), 14746.0);
  assert.equal(ourGpuScore("NVIDIA RTX A4000"), 2955.8);
  assert.equal(ourGpuScore("NVIDIA RTX A5000"), 4390.5);
  assert.equal(ourGpuScore("NVIDIA L40S"), null);
});

test("cost is per minute, rounded up, plus the setup allowance", () => {
  // 61 s -> 2 min + 15 min setup = 17 min at 60/h = 17
  assert.equal(costFor(61, 60), 17);
  assert.equal(costFor(0, 99), Math.round((15 * 99) / 60 * 100) / 100);
  assert.equal(costFor(3600, 3.49, 0), 3.49);
});

test("durations read naturally", () => {
  assert.equal(formatDuration(44.6), "45 s");
  assert.equal(formatDuration(104.6), "1 min 45 s");
  assert.equal(formatDuration(7500), "2 h 05 min");
  assert.equal(formatDuration(3 * 86400 + 4 * 3600), "3 days 4 h");
});

test("frame-time input accepts m:ss and plain numbers", () => {
  assert.equal(parseFrameTime("1:45", "s"), 105);
  assert.equal(parseFrameTime("2.5", "min"), 150);
  assert.equal(parseFrameTime("40", "s"), 40);
  assert.equal(parseFrameTime("", "s"), null);
  assert.equal(parseFrameTime("abc", "s"), null);
  assert.equal(parseFrameTime("-3", "s"), null);
});

test("every listed GPU has a positive score and a unique id", () => {
  const ids = new Set(USER_GPUS.map((g) => g.id));
  assert.equal(ids.size, USER_GPUS.length);
  for (const g of USER_GPUS) assert.ok(g.score > 0 && g.runs >= 10, g.label);
});
