import { test } from "node:test";
import assert from "node:assert/strict";
import { usdTargetPath } from "../lib/usd-path.ts";

test("/usd prefix is stripped to an on-site path", () => {
  assert.equal(usdTargetPath("/usd"), "/");
  assert.equal(usdTargetPath("/usd/"), "/");
  assert.equal(usdTargetPath("/usd/pricing"), "/pricing");
});

test("leading slashes never produce a protocol-relative redirect", () => {
  assert.equal(usdTargetPath("/usd//evil.example/a"), "/evil.example/a");
  assert.equal(usdTargetPath("/usd///evil.example"), "/evil.example");
  assert.equal(usdTargetPath("/usd/\\evil.example"), "/evil.example");
});
