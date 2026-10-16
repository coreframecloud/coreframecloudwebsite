import type { ComponentType } from "react";

/**
 * What a live CFD category plugs into the intake form (app/cfd/cfd-job-form.tsx).
 *
 * The form owns what every job has (job name, company, notes, the account,
 * submitting, the upload and the "job received" screen). A category owns its
 * own inputs: its state, how it is checked, the POST /cfd-jobs fields it adds,
 * and the geometry file to upload after submitting, if any.
 */
export type CategoryFields<S> = {
  initial: () => S;
  /** Human-readable list of what is missing or wrong; empty when ready. */
  validate: (state: S) => string[];
  /** Fields merged into the POST /cfd-jobs body (CfdJobCreate names). */
  toPayload: (state: S) => Record<string, unknown>;
  /** Geometry to upload once the job exists, or null (e.g. dimensions only). */
  file: (state: S) => File | null;
  /** "Next, on your job page" first step, when it is not "confirm the inlet" (e.g. a described room). */
  nextFirstStep?: string;
  /** Shown after submitting when there was no file to upload (default: the straight-duct note). */
  skippedNote?: string;
  Fields: ComponentType<{ state: S; set: (patch: Partial<S>) => void }>;
};
