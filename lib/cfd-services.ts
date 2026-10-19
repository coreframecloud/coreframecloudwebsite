import { type Currency, type UsdRateCard } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, preprocessFee } from "@/lib/cfd-prices";
import { VERIFIED, verifiedFrom } from "@/lib/cfd-verified";
import { ROOMS_VALIDATION } from "@/lib/cfd-rooms";
import { HVAC_PAGE } from "@/lib/cfd-pages";

/**
 * The three CFD service tiles (owner, 19 Oct 2026: "build the three-tile
 * layout ... easy for a user to understand. If they want to go to details,
 * they can click on details."). Shown twice on /cfd: under the hero
 * (#services) and at the top of "Start a job" (#start), where choosing one
 * opens that service's form.
 *
 * Every price, turnaround and figure here comes from lib/cfd-prices.ts,
 * lib/cfd-verified.ts and lib/cfd-rooms.ts, in the page's one currency.
 * Draft (API package "quick", renamed 19 Oct 2026) stays on the quote (not a tile). Standard and Verified both use the
 * ducts form: POST /cfd-jobs takes no package preference, so Verified is
 * chosen on the quote after the mesh check.
 */

export type CfdServiceId = "standard" | "verified" | "rooms";

/**
 * The Rooms sample report. The PDF is being produced separately (19 Oct 2026).
 * Until it is in public/cfd/, the tile links to the Rooms page instead of a
 * missing file: put the PDF in place, then set ROOMS_SAMPLE_REPORT_LIVE = true.
 */
export const ROOMS_SAMPLE_REPORT = "/cfd/sample-report-rooms.pdf";
export const ROOMS_SAMPLE_REPORT_LIVE = false;

export type CfdServiceTile = {
  id: CfdServiceId;
  /** "Ducts & pipes" / "Rooms & HVAC" */
  area: string;
  name: string;
  /** One plain line under the name. */
  purpose: string;
  bullets: string[];
  turnaround: string;
  price: string;
  sample: { href: string; label: string; pdf: boolean };
  details: { href: string; label: string };
  /** Rooms: one short line, with the full claim under a Details disclosure. */
  validation?: { short: string; full: string };
};

/** "Validated against three published benchmark rooms." from the full claim. */
function firstSentence(t: string): string {
  const m = t.match(/^(.+?\.)(\s|$)/);
  return m ? m[1] : t;
}

export function cfdServiceTiles(cur: Currency, usd: UsdRateCard): CfdServiceTile[] {
  const meshCheck = `Starts with the mesh check, ${preprocessFee(cur, usd)}; the run is quoted after it.`;
  return [
    {
      id: "standard",
      area: "Ducts & pipes",
      name: "Standard",
      purpose: "The number you put in a client report.",
      bullets: [
        "Pressure drop and loss coefficient K",
        "PDF report you can attach for your client",
        "3D results viewer and the data files",
      ],
      turnaround: `Within ${CFD_NORMAL_HOURS} h, or Express in ${CFD_EXPRESS.hours} h at ${CFD_EXPRESS.multiple}× the price`,
      price: `${meshCheck} A cheaper Draft run, for comparing design options early, is on the quote too.`,
      sample: { href: "/cfd/sample-report.pdf", label: "See a sample report", pdf: true },
      details: { href: "#packages", label: "Details" },
    },
    {
      id: "verified",
      area: "Ducts & pipes",
      name: "Verified",
      purpose: "Standard on three meshes, with a ± band.",
      bullets: [
        "Everything in Standard, on three meshes",
        "Mesh-independence study with the grid convergence index (GCI)",
        "The result with its error band, in one line",
      ],
      turnaround: `Within ${VERIFIED.deliveryHours} h (no Express)`,
      price: `${verifiedFrom(cur).replace(/^from/, "From")}${cur === "USD" ? ", no GST" : ""}, plus the mesh check.`,
      sample: { href: `${VERIFIED.path}#example`, label: "See a worked example", pdf: false },
      details: { href: "#verified", label: "Details" },
    },
    {
      id: "rooms",
      area: "Rooms & HVAC",
      name: "Comfort study",
      purpose: "Air movement and comfort in one box-shaped room you describe.",
      bullets: [
        "Mean air speed, PMV/PPD and ADPI",
        "Temperature and air-speed maps",
        "PDF report; describe the room, no geometry file needed",
      ],
      turnaround: `Within ${CFD_NORMAL_HOURS} h of accepting the quote`,
      price: meshCheck,
      sample: ROOMS_SAMPLE_REPORT_LIVE
        ? { href: ROOMS_SAMPLE_REPORT, label: "See a sample report", pdf: true }
        : { href: HVAC_PAGE.path, label: "See what the report shows", pdf: false },
      details: { href: HVAC_PAGE.path, label: "Details" },
      validation: { short: firstSentence(ROOMS_VALIDATION), full: ROOMS_VALIDATION },
    },
  ];
}
