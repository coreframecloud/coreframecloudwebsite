/**
 * CFD categories (verticals) offered on /cfd.
 *
 * Owner, 13 Oct 2026: "as we add more verticals to CFD, the form input
 * changes". Each category is one entry here (what it is, whether it takes
 * jobs, the fixed values the API needs) plus its field component in
 * app/cfd/categories/. Adding a vertical = add an entry here and
 * register its fields in app/cfd/categories/index.ts. A category
 * without registered fields is shown as "coming soon" and never submits.
 *
 * `api` values are sent as-is to POST /cfd-jobs (CfdJobCreate field names).
 * They are chosen to pass the API's scope rules (apps/api/app/services/
 * cfd_rules.py) and the runner's case generator: see the duct notes in
 * app/cfd/categories/ducts.tsx before changing them.
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
      solverSoftware: "Coreframe CFD",
      kpi: "Pressure drop and loss coefficient",
    },
  },
  {
    // 16 Oct 2026: hidden (owner) after the heated-floor benchmark. 17 Oct 2026: steady tier released
    // (owner: "release the steady tier if we are clear about it"), with the validation wording in
    // lib/cfd-rooms.ts. Goes with CFD_HVAC_ROOMS_ENABLED=true in the API ("coming_soon" = 409 there).
    id: "rooms",
    label: "Rooms / HVAC",
    status: "live",
    summary:
      "Room air movement and comfort for HVAC designers: air speed, temperature, PMV/PPD and ADPI for one box-shaped room you describe. No geometry file needed.",
    api: {
      // The quote is an HVAC room quote because the job carries an `hvac` block (the runner reports mode "hvac");
      // this text is for people and emails. Tested: apps/api tests/test_cfd_cloud.py (SITE_ROOM_BODY).
      applicationType: "HVAC / Indoor air (room comfort)",
      domainType: "Internal flow (room)",
      solverSoftware: "Coreframe CFD",
      kpi: "Air speed, temperature, PMV/PPD, ADPI",
    },
    futureInputs: [
      "Room size (length, width and height)",
      "Supply and return diffusers: where they are, their size and the airflow through each",
      "Heat loads: people, equipment and lighting",
    ],
  },
];

export const DEFAULT_CFD_CATEGORY: CfdCategoryId = "ducts";

export function cfdCategory(id: CfdCategoryId): CfdCategory {
  return CFD_CATEGORIES.find((c) => c.id === id) ?? CFD_CATEGORIES[0];
}
