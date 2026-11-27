"use client";

import { useSyncExternalStore } from "react";

import { FlowSteps } from "@/components/ui/flow-steps";
import { peekReturnPath, safeReturnPath } from "@/lib/return-path";
import { signupStepsFor } from "@/lib/signup-steps";

const noop = () => () => {};

/** The path sign-up will return to: ?next= on this URL, else the remembered one. */
function returnPath(): string | null {
  try {
    return safeReturnPath(new URLSearchParams(window.location.search).get("next")) ?? peekReturnPath();
  } catch {
    return null;
  }
}

/**
 * The sign-up progress strip, on every screen of the flow: /signup (1),
 * /verify (2, then 3 when done), the first top-up (3) and /download (4).
 * The step names depend on where the customer is headed (lib/signup-steps.ts);
 * the server render shows the default four.
 */
export function SignupSteps({
  current,
  className,
  gpuFlowOnly = false,
}: {
  current: number;
  className?: string;
  /** Render nothing for a customer headed back to a CFD job or Studio: the
   *  top-up and download screens are not steps of their sign-up. */
  gpuFlowOnly?: boolean;
}) {
  const path = useSyncExternalStore(noop, returnPath, () => null);
  const steps = signupStepsFor(path);
  if (gpuFlowOnly && steps.length !== 4) return null;
  return <FlowSteps current={Math.min(current, steps.length + 1)} steps={steps} className={className} />;
}


