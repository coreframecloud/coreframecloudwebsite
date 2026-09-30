"use client";

/**
 * Who this is built for — postures, not testimonials.
 *
 * THIS IS THE SECTION THAT REPLACED A REQUEST FOR FAKE REVIEWS. The brief
 * asked for testimonials; we have no customers to quote yet, and inventing
 * them is fabricating evidence — it also collapses the moment a real prospect
 * asks to speak to one of these studios.
 *
 * So these are second person, aspirational, and never presented as anyone's
 * words: no name, no photo, no quotation marks, no studio. A reader recognises
 * themselves rather than being told what a stranger thinks. When there are
 * real customers willing to be named, this section is what they replace.
 *
 * Duplicated once so the -50% translate loops seamlessly. Pauses on hover and
 * degrades to a static wrapped grid under prefers-reduced-motion, which the
 * keyframes in globals.css handle.
 */
const PROFILES: [string, string][] = [
  ["Interior designer", "You stopped promising 'by Friday' a long time ago. You'd like to start again."],
  ["Archviz freelancer", "You turn down the third project of the month because the second one is still rendering."],
  ["Architecture student", "Your thesis shouldn't be capped by what a four-year-old laptop can hold."],
  ["Studio principal", "Four designers, one machine that can render. You've done that maths already."],
  ["Mechanical engineer", "You need a workstation for six weeks, and a purchase order takes eight."],
  ["CFD analyst", "The solve runs on the cluster. Looking at the result shouldn't need a second machine."],
  ["HVAC designer", "The federated model opens. Eventually. You'd rather it just opened."],
  ["3D visualiser", "Your client has seen 8K. Going back to 2K is not a conversation you want."],
  ["Product designer", "Two hours of GPU a week doesn't justify a card that costs more than your laptop."],
  ["Design lead", "You hire for taste. You'd rather not lose people to hardware they can't fix."],
];

export function BuiltForStrip() {
  const doubled = [...PROFILES, ...PROFILES];
  return (
    <section className="cf-section pt-0">
      <div className="cf-strip" aria-label="Who Coreframe is built for">
        <div className="cf-track">
          {doubled.map(([role, line], i) => (
            <div key={`${role}-${i}`} className="cf-chip" aria-hidden={i >= PROFILES.length}>
              <p className="mb-3 font-mono text-[12px] leading-none font-medium tracking-[0.15em] text-blue uppercase">
                {role}
              </p>
              <p className="text-[17px] leading-[1.5] text-ink-2">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
