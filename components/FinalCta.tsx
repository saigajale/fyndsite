import { ArrowRightIcon } from "./icons";

export default function FinalCta() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
      <div className="rounded-2xl bg-brand-green-deep px-6 py-16 text-center shadow-card sm:px-12">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your next business decision starts with the right location.
        </h2>
        <a
          href="#assessment"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-green-deep shadow-soft transition-colors hover:bg-brand-bg"
        >
          Evaluate a Location
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
