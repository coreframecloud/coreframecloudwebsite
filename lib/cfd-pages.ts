/**
 * The CFD pages, their paths and the date each one's content last changed
 * (SEO review 18 Oct 2026). One list so the sitemap's lastmod, the visible
 * "Last updated" line and the dateModified in each page's schema can never
 * disagree: the clinic case study shipped with dateModified 13 Oct and a
 * sitemap lastmod of 17 Oct.
 *
 * Bump `updated` when a page's wording or numbers change, not on every build.
 */
export type CfdPage = { path: string; name: string; updated: string };

export const CFD_HOME: CfdPage = { path: "/cfd", name: "CFD for ducts and pipes", updated: "2026-10-18" };

export const MESH_STUDY: CfdPage = {
  path: "/cfd/mesh-independence-study",
  name: "Mesh independence study (GCI)",
  updated: "2026-10-18",
};

export const HVAC_PAGE: CfdPage = {
  path: "/cfd/room-airflow-hvac",
  name: "Room airflow CFD for HVAC",
  updated: "2026-10-18",
};

/** The HVAC simulation service page (owner, 19 Oct 2026: "build pages 1–4, start with HVAC").
 *  It sells the Rooms / HVAC steady service; HVAC_PAGE is the guide behind it. */
export const HVAC_SERVICE: CfdPage = {
  path: "/cfd/hvac-simulation",
  name: "HVAC simulation service",
  updated: "2026-10-19",
};

export const CLINIC_CASE: CfdPage = {
  path: "/cfd/projects/clinic-floor-hvac",
  name: "HVAC CFD case study: a clinic floor",
  updated: "2026-10-18",
};

/** "18 October 2026" from "2026-10-18", in India time. */
export function updatedLabel(iso: string): string {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
