/**
 * Rooms / HVAC (steady tier), released 17 Oct 2026 (owner: "release the steady
 * tier if we are clear about it").
 *
 * ROOMS_VALIDATION is the customer-facing validation claim, word for word. The
 * same words are in the quote (control plane apps/api/app/services/cfd_hvac.py
 * VALIDATION_TEXT) and the PDF report (cfd-runner/hvac_post.py). Keep the three
 * in step. Never claim surface heat-transfer accuracy, and do not name the
 * benchmark authors here.
 */
export const ROOMS_VALIDATION =
  "Validated against three published benchmark rooms. Air-flow pattern and air speeds meet the published acceptance criteria. Temperatures in the occupied zone agree with measurements to within about 0.3 K, but did not meet the strict ±5 % benchmark criterion in the heated-floor case. Air temperatures within a few centimetres of heated or cooled surfaces are less reliable.";

/** What a Rooms job delivers (the steady analysis). */
export const ROOMS_DELIVERS =
  "room averages (mean air speed, PMV/PPD, ADPI) and temperature and air-speed maps in a PDF report";

/** The transient (premium) tier stays off in the API (cfd_hvac_transient_enabled = False). */
export const ROOMS_TRANSIENT_OFFERED = false;
