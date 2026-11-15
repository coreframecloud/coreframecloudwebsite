import type { Metadata } from "next";
import Link from "next/link";
import { MacHelp } from "@/components/download/mac-help";
import { fetchMacRelease } from "@/lib/client-release";

/**
 * /download/mac: the chip chooser behind the short link support hands out
 * (15 Nov 2026). It never picks a chip: a customer with an Intel Mac was sent
 * the Apple silicon DMG by a default and macOS refused to open it. Each choice
 * is a plain link to a short link that 302s to the current file
 * (lib/client-short-link.ts). Public, like those links: the files are public
 * on /releases/ and this server cannot see the site's session.
 */
export const metadata: Metadata = {
  title: { absolute: "Download Coreframe Connect for Mac" },
  description: "Choose your Mac's chip to download Coreframe Connect.",
  alternates: { canonical: "/download" },
  robots: { index: false, follow: true },
};

const CHOICES = [
  { href: "/download/mac/apple-silicon", title: "Apple silicon", sub: "M1 and later" },
  { href: "/download/mac/intel", title: "Intel", sub: "Older Macs with an Intel processor" },
];

export default async function MacChooser() {
  // Sizes for the help section, read on the server from the same feed the
  // short links use. Feed down: the help still shows, without sizes.
  const mac = await fetchMacRelease();
  return (
    <main className="cf-section px-5">
      <div className="mx-auto w-full max-w-[520px]">
        <h1 className="cf-display">Coreframe Connect for Mac</h1>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Pick your Mac&apos;s chip. The download starts straight away.
        </p>

        <div className="mt-8 rounded-cf border border-rule bg-paper-2 p-6 sm:p-8">
          <p className="mb-2 text-sm leading-5 text-ink-2">Your Mac&apos;s chip</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHOICES.map((c) => (
              <a
                key={c.href}
                href={c.href}
                className="flex min-h-[44px] flex-col rounded-cf border border-rule-strong bg-paper p-4 transition-colors hover:border-ink"
              >
                <span className="text-lg leading-6 font-semibold text-ink">{c.title}</span>
                <span className="mt-1 text-sm leading-5 text-ink-2">{c.sub}</span>
              </a>
            ))}
          </div>
          <p className="mt-1 text-xs leading-5 text-ink-3">
            Not sure? Apple menu → About This Mac: &ldquo;Chip: Apple M…&rdquo; = Apple silicon,
            &ldquo;Processor: Intel&rdquo; = Intel.
          </p>
          <p className="mt-5 text-sm leading-6 text-ink-2">
            Open the .dmg and drag Coreframe Cloud Connect into Applications. If macOS says the
            app is not supported on this Mac, you picked the other chip: come back and choose
            again.
          </p>

          <MacHelp sizes={{ arm64: mac?.arm64?.size, x64: mac?.x64?.size }} className="mt-6" />
        </div>

        <p className="mt-6 text-center text-sm text-ink-2">
          <Link href="/download" className="inline-flex min-h-[44px] items-center text-blue underline underline-offset-4">
            All downloads, including Windows
          </Link>
        </p>
      </div>
    </main>
  );
}
