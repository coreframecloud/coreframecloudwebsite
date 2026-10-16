import Image from "next/image";
import type { Block, MaybeBlock } from "@/lib/blog/types";
import { walkthroughVideoObject } from "@/components/home/landing/walkthrough-section";
import { JsonLd } from "@/components/seo/json-ld";
import { RichText } from "./rich-text";
import { Callout, ExplainFigure, Hl, SectionHead, Stamp, Statement } from "@/components/cfd-explainer";

/** Rich text with one phrase wrapped in the highlighter. */
function WithHl({ text, hl }: { text: string; hl?: string }) {
  const at = hl ? text.indexOf(hl) : -1;
  if (!hl || at < 0) return <RichText text={text} />;
  return (
    <>
      <RichText text={text.slice(0, at)} />
      <Hl>{hl}</Hl>
      <RichText text={text.slice(at + hl.length)} />
    </>
  );
}

/** Heading ids, so a section can be linked to directly. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const P = "mt-5 text-[17px] leading-[1.75] text-ink-2";

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case "p":
      return (
        <p key={i} className={P}>
          <RichText text={b.text} />
        </p>
      );
    case "h2":
      return (
        <h2 key={i} id={slugify(b.text)} className="cf-section-title mt-14 scroll-mt-24">
          {b.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="mt-9 font-display text-[22px] leading-snug font-semibold text-ink">
          {b.text}
        </h3>
      );
    case "ul":
    case "ol": {
      const Tag = b.type;
      return (
        <Tag
          key={i}
          className={`mt-5 space-y-3 pl-6 text-[17px] leading-[1.7] text-ink-2 ${b.type === "ul" ? "list-disc" : "list-decimal"} marker:text-ink-3`}
        >
          {b.items.map((item, j) => (
            <li key={j} className="pl-1">
              <RichText text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case "note":
      return (
        <div key={i} className="cf-note mt-7 text-[16px] leading-[1.7] text-ink">
          <RichText text={b.text} />
        </div>
      );
    case "figure":
      return (
        <figure key={i} className="mt-8">
          <Image
            src={b.src}
            alt={b.alt}
            width={b.width}
            height={b.height}
            sizes="(max-width: 720px) 100vw, 680px"
            className="h-auto w-full rounded-cf border border-rule bg-paper-2"
          />
          {b.caption ? (
            <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">{b.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "video":
      return (
        <figure key={i} className="mt-8">
          <JsonLd data={walkthroughVideoObject(b.youtubeId)} />
          {/* Same embed as the landing page's walkthrough section: the
              privacy-enhanced host, lazy, and allowed by frame-src in
              next.config.ts. */}
          <div className="overflow-hidden rounded-cf border border-rule">
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${b.youtubeId}`}
              title={b.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {b.caption ? (
            <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">{b.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "spec": {
      const w = Math.max(...b.rows.map(([k]) => k.length)) + 2;
      return (
        <div key={i} className="mt-7">
          {b.label ? <p className="cf-eyebrow mb-4">{b.label}</p> : null}
          <div className="cf-term">
            <pre>
              {b.rows.map(([k, v], j) => (
                <span key={j}>
                  <span className="k">{k.padEnd(w, " ")}</span>
                  <span className="v">{v}</span>
                  {j < b.rows.length - 1 ? "\n" : null}
                </span>
              ))}
            </pre>
          </div>
        </div>
      );
    }
    case "sectionHead":
      return (
        <div key={i} id={slugify(b.title)} className="mt-14 scroll-mt-24">
          <SectionHead n={b.n} tint={b.tint} eyebrow={b.eyebrow} title={b.title}>
            {b.text ? <RichText text={b.text} /> : null}
          </SectionHead>
        </div>
      );
    case "callout":
      return (
        <div key={i} className="mt-8">
          <Callout source={b.source}>
            <WithHl text={b.text} hl={b.hl} />
          </Callout>
        </div>
      );
    case "statement":
      return (
        <div key={i} className="mt-8">
          <Statement big={b.big} caption={b.caption} />
        </div>
      );
    case "explainFigure":
      return (
        <div key={i} className="mt-8">
          <ExplainFigure
            src={b.src}
            alt={b.alt}
            width={b.width}
            height={b.height}
            maxWidth={b.maxWidth}
            sizes="(max-width: 720px) 100vw, 680px"
            stamp={b.stamp ? <Stamp decorative>{b.stamp}</Stamp> : undefined}
            labels={b.labels}
            caption={b.caption}
          />
        </div>
      );
    case "table":
      return (
        <div key={i} className="mt-7 overflow-x-auto rounded-cf border border-rule bg-paper-2">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule">
                {b.head.map((h, j) => (
                  <th key={j} scope="col" className="px-4 py-3 font-semibold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {b.rows.map((row, j) => (
                <tr key={j} className="align-top">
                  {row.map((cell, k) =>
                    k === 0 ? (
                      <th key={k} scope="row" className="px-4 py-3 font-medium text-ink">
                        {cell}
                      </th>
                    ) : (
                      <td key={k} className="px-4 py-3 text-ink-2">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function ArticleBody({ blocks }: { blocks: MaybeBlock[] }) {
  return <>{blocks.filter((b): b is Block => Boolean(b)).map(renderBlock)}</>;
}
