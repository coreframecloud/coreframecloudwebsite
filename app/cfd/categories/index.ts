import type { CfdCategoryId } from "@/lib/cfd-categories";
import { ductFields } from "./ducts";
import type { CategoryFields } from "./types";

/**
 * The field components of each LIVE category (lib/cfd-categories.ts).
 * A category missing here is shown as coming soon and cannot submit.
 *
 * Stored as CategoryFields<unknown>: a category's state only ever travels
 * from its own initial() back into its own validate/toPayload/file/Fields.
 */
export const CATEGORY_FIELDS: Partial<Record<CfdCategoryId, CategoryFields<unknown>>> = {
  ducts: ductFields as unknown as CategoryFields<unknown>,
};
