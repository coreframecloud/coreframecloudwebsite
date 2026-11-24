// node --experimental-strip-types --test tests/  (npm test)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutEventId, isLanding, isSignupHref, newEventId, payInfoEventId, pxProps,
} from "../lib/meta-ids.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("browser-made ids are <prefix>.<uuid> and unique", () => {
  for (const p of ["pv", "vc", "lead"] as const) {
    const id = newEventId(p);
    assert.ok(id.startsWith(`${p}.`), id);
    assert.match(id.slice(p.length + 1), UUID);
  }
  assert.notEqual(newEventId("pv"), newEventId("pv"));
});

test("order ids match the server's checkout_/payinfo_ shapes", () => {
  assert.equal(checkoutEventId(42), "checkout_42");
  assert.equal(payInfoEventId(42), "payinfo_42");
  assert.equal(checkoutEventId(undefined), null);
  assert.equal(checkoutEventId("42"), null);
  assert.equal(payInfoEventId(0), null);
  assert.equal(payInfoEventId(1.5), null);
});

test("landing = first page view, from nowhere or another host", () => {
  assert.equal(isLanding(true, "", "coreframecloud.com"), true);
  assert.equal(isLanding(true, "https://www.google.com/", "coreframecloud.com"), true);
  assert.equal(isLanding(true, "https://coreframecloud.com/pricing", "coreframecloud.com"), false);
  assert.equal(isLanding(false, "", "coreframecloud.com"), false);
  assert.equal(isLanding(true, "not a url", "coreframecloud.com"), true);
});

test("px props: only mirrored events, clamped", () => {
  assert.equal(pxProps("Purchase", "x"), null);
  assert.equal(pxProps("PageView", undefined), null);
  assert.deepEqual(pxProps("PageView", "pv.1"), { e: "PageView", id: "pv.1" });
  const p = pxProps("ViewContent", "vc.1", { content_name: "x".repeat(300), content_category: "pricing" });
  assert.equal(p?.cn?.length, 120);
  assert.equal(p?.cc, "pricing");
  assert.deepEqual(pxProps("AddPaymentInfo", "payinfo_3", { value: 1000, currency: "INR" }),
    { e: "AddPaymentInfo", id: "payinfo_3", v: 1000, cur: "INR" });
  assert.equal(pxProps("Lead", "lead.1", { currency: "EUR" })?.cur, undefined);
});

test("sign-up hrefs", () => {
  assert.equal(isSignupHref("/signup"), true);
  assert.equal(isSignupHref("/signup?next=/x"), true);
  assert.equal(isSignupHref("/signups"), false);
  assert.equal(isSignupHref(null), false);
});
