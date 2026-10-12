This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ad tracking environment variables

Set in Vercel → Project → Settings → Environment Variables (Production, and
Preview if wanted). All are optional and all are `NEXT_PUBLIC_*`, so they are
inlined at **build** time: redeploy after adding or changing one. Names only —
never commit values (`.env*` is gitignored).

| Variable | What it turns on |
|---|---|
| `NEXT_PUBLIC_GA4_ID` | GA4 measurement id, `G-…`. Unset = the existing property `G-BX4WY4GBSZ`; `off` = no GA4. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta pixel (digits only). Unset = no pixel loaded. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads tag, e.g. `AW-…`. Unset = no Ads tag. |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_SIGNUP` | Ads conversion label sent on `sign_up` |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD` | Ads conversion label sent on WhatsApp `generate_lead` |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_PURCHASE` | Ads conversion label sent on wallet `purchase` |
| `NEXT_PUBLIC_GOOGLE_ADS_LABEL_FIRST_TOPUP` | Ads conversion label sent on the first paid top-up (`first_topup`, the intro offer). Make this the primary bid conversion. |

The labels are optional: without them, mark the GA4 events `sign_up`,
`generate_lead`, `purchase` and `first_topup` as key events and import them
into Google Ads. Conversions are sent from `trackConversion` in
`lib/analytics.ts`, which also pushes `cf_<name>` events to `dataLayer` for a
future Tag Manager container. Consent Mode v2 defaults (denied in the EEA, UK
and Switzerland, granted elsewhere) are set in `app/layout.tsx` before any
`config` call.

## Control-plane API base

Every customer page (login, verify, My Activity, top-up, magic link, header,
org admin, CFD intake, rate card, download route) reaches the control plane
through ONE constant, `API_BASE` in `lib/api-base.ts`:

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_CONTROL_PLANE_API` | API base URL, e.g. `https://staging.example.com/api`. Unset = `https://control.coreframecloud.com/api` (production, unchanged). |

Like every `NEXT_PUBLIC_*` variable it is read at **build** time (the API
base is inlined into the client bundles and the CSP header is baked into the
build), so rebuild after changing it. Only an `https://` URL is accepted; `http://localhost` / `http://127.0.0.1`
are accepted only under `next dev` (non-production). Anything else falls back
to the production API. The CSP `connect-src` in `next.config.ts` always allows
the production origin and adds the configured origin when it differs. The
`/tools`, `/dwg-check`, `/r/*` and Studio rewrites in `next.config.ts` still
point at production on purpose.

The signup country pickers load `GET /auth/countries` from that API (every
country it accepts); the bundled list in `lib/validation.ts` is only the
offline fallback.
