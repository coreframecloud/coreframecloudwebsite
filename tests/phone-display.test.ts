// node --experimental-strip-types --test tests/  (npm test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { shownNumber, showWrongNumberHint, splitDisplayNumber } from "../lib/phone-display.ts";

const C = [
  { iso: "IN", dial_code: "91" },
  { iso: "US", dial_code: "1" },
  { iso: "TT", dial_code: "1868" },
  { iso: "GB", dial_code: "44" },
  { iso: "JE", dial_code: "44" },
];

test("the code screen shows the full number, masked only from an older API", () => {
  assert.equal(shownNumber({ phone_display: "+44 7944 396988", phone_masked: "xxxxxx6988" }), "+44 7944 396988");
  assert.equal(shownNumber({ phone_masked: "xxxxxx6988" }), "xxxxxx6988");
  assert.equal(shownNumber(null), null);
});

test("the wrong-number hint waits for the second resend", () => {
  assert.equal(showWrongNumberHint(1), false);
  assert.equal(showWrongNumberHint(2), false);
  assert.equal(showWrongNumberHint(3), true);
});

test("change-number prefill splits on the longest dial code", () => {
  assert.deepEqual(splitDisplayNumber("+44 7944 396988", C, "GB"), { country: C[3], national: "7944396988" });
  assert.deepEqual(splitDisplayNumber("+44 7944 396988", C, "JE")?.country.iso, "JE");
  assert.equal(splitDisplayNumber("+1868 555 1234", C)?.country.iso, "TT");
  assert.equal(splitDisplayNumber("+91 98765 43210", C)?.national, "9876543210");
  assert.equal(splitDisplayNumber("xxxxxx6988", C), null);
});
