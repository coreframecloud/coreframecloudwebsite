// node --experimental-strip-types --test tests/  (npm test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { apiErrorText, caughtErrorText, looksLikeEmail } from "../lib/api-error.ts";
import { suggestEmail } from "../lib/email-typo.ts";

test("a validation list never reaches the person as [object Object]", () => {
  const body = { detail: [{ loc: ["body", "email"], msg: "value is not a valid email address" }] };
  assert.equal(apiErrorText(422, body), "Enter a full email address, like name@gmail.com.");
  assert.match(apiErrorText(422, { detail: [{ loc: ["body", "code"] }] }), /6-digit code/);
  assert.match(apiErrorText(422, { detail: [{ loc: ["body", "phone"] }] }), /country code/);
  assert.equal(apiErrorText(422, { detail: [{ loc: ["body", "x"] }] }), "Please check what you entered and try again.");
});

test("server sentences pass through; HTML and status codes do not", () => {
  assert.equal(apiErrorText(400, { detail: "Invalid or expired code" }), "Invalid or expired code");
  assert.equal(apiErrorText(402, { detail: { message: "Top up first" } }), "Top up first");
  assert.match(apiErrorText(502, { detail: "<html>Bad Gateway</html>" }), /having trouble/);
  assert.match(apiErrorText(502, null), /having trouble/);
  assert.match(apiErrorText(429, null), /wait a minute/);
  assert.doesNotMatch(apiErrorText(418, null), /Error 418$/);
});

test("network failures read as a sentence", () => {
  assert.match(caughtErrorText(new TypeError("Failed to fetch"), "x"), /Network connection/);
  assert.equal(caughtErrorText(new Error("Invalid or expired code"), "x"), "Invalid or expired code");
});

test("email shape check", () => {
  assert.equal(looksLikeEmail("gautham.acer"), false);
  assert.equal(looksLikeEmail("a@b"), false);
  assert.equal(looksLikeEmail("name@gmail.com"), true);
});

test("did you mean", () => {
  assert.equal(suggestEmail("manassaxena16@gmial.com"), "manassaxena16@gmail.com");
  assert.equal(suggestEmail("a@gmsil.com"), "a@gmail.com");
  assert.equal(suggestEmail("a@hotmial.com"), "a@hotmail.com");
  assert.equal(suggestEmail("a@yahooo.com"), "a@yahoo.com");
  assert.equal(suggestEmail("a@gmail.com"), null);
  assert.equal(suggestEmail("a@coreframecloud.com"), null);
  assert.equal(suggestEmail("a@gmx.com"), null);
  assert.equal(suggestEmail("gautham.acer"), null);
});
