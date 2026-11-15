import { COMPANY } from "@/lib/company";

/**
 * "Trouble opening the Mac app?" (15 Nov 2026), collapsed by default, on
 * /download (Mac side, before and after the click) and on the /download/mac
 * chooser. The three messages macOS actually shows, each with the one thing to
 * do about it. Sizes come from the release feed (latest-mac.yml) so a customer
 * can compare the file in Finder; a copied or cut-short .dmg is what produces
 * "is damaged". No hooks: renders on the server (chooser) and in the client
 * download page alike.
 */

export type MacHelpSizes = { arm64?: number | null; x64?: number | null };

// One decimal, decimal megabytes: what Finder's Get Info shows (271.7 MB).
export function formatMacSize(bytes: number | null | undefined): string | null {
  if (!bytes) return null;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

const WHATSAPP_DISPLAY = "+91 63668 89488";
const SUPPORT_EMAIL = "support@coreframecloud.com";

export function MacHelp({ sizes, className = "" }: { sizes: MacHelpSizes; className?: string }) {
  const arm = formatMacSize(sizes.arm64);
  const intel = formatMacSize(sizes.x64);
  const link = "text-blue underline underline-offset-4";
  return (
    <details
      className={`group rounded-cf border border-rule bg-paper px-4 py-1 transition open:border-blue/25 ${className}`}
    >
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-sm leading-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        Trouble opening the Mac app?
        <span aria-hidden className="shrink-0 text-xl leading-none font-light text-blue">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>

      <div className="space-y-5 pt-1 pb-4 text-sm leading-6 text-ink-2">
        <section>
          <h3 className="font-semibold text-ink">&ldquo;…is damaged and can&apos;t be opened&rdquo;</h3>
          <p className="mt-1">
            The file was cut short or changed on the way, for example copied from another device
            with AirDrop, LocalSend or a messaging app. Download it again directly on this Mac,
            from this page.
          </p>
          {(arm || intel) && (
            <p className="mt-1">
              Check the size in Finder (select the .dmg, then File → Get Info):{" "}
              {arm && (
                <span className="whitespace-nowrap">
                  Apple silicon <strong className="text-ink">{arm}</strong>
                </span>
              )}
              {arm && intel ? ", " : ""}
              {intel && (
                <span className="whitespace-nowrap">
                  Intel <strong className="text-ink">{intel}</strong>
                </span>
              )}
              .
            </p>
          )}
        </section>

        <section>
          <h3 className="font-semibold text-ink">&ldquo;…is not supported on this Mac&rdquo;</h3>
          <p className="mt-1">
            You have the version for the other chip. Apple menu → About This Mac: &ldquo;Chip:
            Apple M…&rdquo; means Apple silicon, &ldquo;Processor: Intel&rdquo; means Intel.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-5">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a route handler that 302s to the .dmg: a plain link, never a prefetching <Link> */}
            <a href="/download/mac/apple-silicon" className={`inline-flex min-h-[44px] items-center ${link}`}>
              Download for Apple silicon
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a route handler that 302s to the .dmg: a plain link, never a prefetching <Link> */}
            <a href="/download/mac/intel" className={`inline-flex min-h-[44px] items-center ${link}`}>
              Download for Intel
            </a>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-ink">
            &ldquo;…can&apos;t be opened because Apple cannot check it&rdquo;
          </h3>
          <p className="mt-1">
            Connect needs macOS 11 Big Sur or later. The app is signed and notarized by Apple, so
            this message normally means the Mac runs an older macOS. Check the version under Apple
            menu → About This Mac.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-ink">Still stuck?</h3>
          <p className="mt-1">
            WhatsApp{" "}
            <span className="font-semibold whitespace-nowrap text-ink select-all">{WHATSAPP_DISPLAY}</span>{" "}
            (
            <a href={COMPANY.whatsapp} target="_blank" rel="noreferrer" className={link}>
              open chat
            </a>
            ) or email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={`break-words select-all ${link}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </details>
  );
}
