/**
 * The opening move, and the reason this page was rebuilt.
 *
 * The old hero led with the product — "A ₹6,00,000 workstation. Rented by the
 * hour." That is a feature, stated at someone who has not yet agreed they have
 * a problem. This one starts from where the visitor actually is: they have
 * arrived, so the job is no longer to attract them, it is to be worth their
 * next two minutes.
 *
 * Nothing here is a claim we would have to defend. "We give you back the hours
 * you currently spend waiting" is a description of the product, and the page
 * spends the next screen letting the reader price those hours themselves.
 */
export function ValueHero() {
  return (
    <section className="cf-section px-5">
      <div className="cf-col">
        <p className="cf-eyebrow mb-5">GPU workstations · Bengaluru</p>
        <h1 className="cf-display">
          Now that you&rsquo;re here &mdash; here is what we&rsquo;re worth to your studio.
        </h1>
        <p className="cf-lead mt-[22px]">
          We give you back the hours you currently spend waiting. A real Windows workstation with
          a current-generation RTX&nbsp;5080, opened from the laptop you already own, streamed in
          4K. You work; when you close it, the billing stops. No month to commit to and nothing
          to cancel.
        </p>
      </div>
    </section>
  );
}
