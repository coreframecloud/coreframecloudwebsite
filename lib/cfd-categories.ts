/**
 * CFD categories (verticals) offered on /cfd-intake.
 *
 * Owner, 13 Oct 2026: "as we add more verticals to CFD, the form input
 * changes". Each category is one entry here (what it is, whether it takes
 * jobs, the fixed values the API needs) plus its field component in
 * app/cfd-intake/categories/. Adding a vertical = add an entry here and
 * register its fields in app/cfd-intake/categories/index.ts. A category
 * without registered fields is shown as "coming soon" and never submits.
 *
 * `api` values are sent as-is to POST /cfd-jobs (CfdJobCreate field names).
 * They are chosen to pass the API's scope rules (apps/api/app/services/
 * cfd_rules.py) and the runner's case generator: see the duct notes in
 * app/cfd-intake/categories/ducts.tsx before changing them.
 */

export type CfdCategoryId = "ducts" | "rooms";

export type CfdCategory = {
  id: CfdCategoryId;
  /** Tab label. */
  label: string;
  status: "live" | "coming_soon";
  /** One line under the tab. */
  summary: string;
  /** Fixed POST /cfd-jobs fields for this category. Live categories only. */
  api?: {
    applicationType: string;
    domainType: string;
    solverSoftware: string;
    kpi: string;
  };
  /** Coming soon: the inputs the form will ask for, listed as a note. */
  futureInputs?: string[];
};

export const CFD_CATEGORIES: CfdCategory[] = [
  {
    id: "ducts",
    label: "Ducts and pipes",
    status: "live",
    summary: "Pressure drop and loss coefficient for a duct, pipe, bend, reducer, valve or fitting, from one STL.",
    api: {
      // No "hvac"/"room"/"indoor" keyword: those apply the 2-50 m room size check.
      applicationType: "Duct / pipe internal flow (pressure drop)",
      domainType: "Internal flow (duct / pipe)",
      solverSoftware: "OpenFOAM (Coreframe)",
      kpi: "Pressure drop and loss coefficient",
    },
  },
  {
    id: "rooms",
    label: "Rooms / HVAC",
    status: "coming_soon",
    summary:
      "Room air movement and comfort for HVAC designers. Released once it passes our validation cases, so the numbers are ones you can hand on.",
    futureInputs: [
      "Room size (length, width and height), or the room's geometry",
      "Supply and return diffusers: where they are, their size and the airflow through each",
      "Heat loads: equipment, lighting and solar gains",
      "Occupancy: how many people, and where",
    ],
  },
];

export const DEFAULT_CFD_CATEGORY: CfdCategoryId = "ducts";

export function cfdCategory(id: CfdCategoryId): CfdCategory {
  return CFD_CATEGORIES.find((c) => c.id === id) ?? CFD_CATEGORIES[0];
}
