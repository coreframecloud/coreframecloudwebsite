import { test } from "node:test";
import assert from "node:assert/strict";
import { SIGNUP_STEPS, SIGNUP_STEPS_RETURN, signupStepsFor } from "../lib/signup-steps.ts";

test("a plain sign-up shows the four GPU steps", () => {
  assert.deepEqual(signupStepsFor(null), SIGNUP_STEPS);
  assert.deepEqual(signupStepsFor(undefined), SIGNUP_STEPS);
  assert.deepEqual(signupStepsFor(""), SIGNUP_STEPS);
});

test("the GPU start flow keeps the four steps", () => {
  assert.deepEqual(signupStepsFor("/my-activity?topup=1&gpu=rtx-5080&amount=1000"), SIGNUP_STEPS);
  assert.deepEqual(signupStepsFor("/download?gpu=rtx-5080"), SIGNUP_STEPS);
});

test("a CFD job or Studio return ends at Continue, with no download step", () => {
  assert.deepEqual(signupStepsFor("/cfd/jobs/abc"), SIGNUP_STEPS_RETURN);
  assert.deepEqual(signupStepsFor("/studio?x=1"), SIGNUP_STEPS_RETURN);
  // A look-alike prefix is not the GPU flow.
  assert.deepEqual(signupStepsFor("/my-activity-old"), SIGNUP_STEPS_RETURN);
});
