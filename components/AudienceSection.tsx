import { ArrowRightIcon, BuildingIcon, UsersIcon } from "./icons";

export default function AudienceSection() {
  return (
    <section className="bg-brand-card py-20">
      <div className="mx-auto max-w-8xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Built for both sides of a location decision
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div
            id="business-owners"
            className="rounded-2xl border border-brand-border bg-brand-bg p-8 shadow-soft"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <UsersIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-brand-text">
              For Business Owners
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              Choose a location with more confidence before investing in your
              next outlet.
            </p>
            <a
              href="#assessment"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-green-deep"
            >
              Find a Business Location
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div
            id="property-owners"
            className="rounded-2xl border border-brand-border bg-brand-bg p-8 shadow-soft"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-brand-text">
              For Property Owners
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">
              Understand what types of businesses may fit your property and
              surrounding market.
            </p>
            <a
              href="#assessment"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-card px-5 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-orange"
            >
              Evaluate My Property
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
