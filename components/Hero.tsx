import { ArrowRightIcon, MapPinIcon } from "./icons";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(33,139,90,0.13) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="mx-auto grid max-w-8xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-10 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-green-deep">
            <MapPinIcon className="h-3.5 w-3.5" />
            Now piloting in Vasai West, Maharashtra
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-6xl">
            Find the right location for your{" "}
            <span className="text-brand-green">next business.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">
            Fyndsol Location Intelligence helps you understand demand,
            competition, accessibility, nearby amenities and business fit
            before you choose a location.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#assessment"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-green-deep"
            >
              Evaluate a Location
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-border bg-brand-card px-6 py-3.5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-green"
            >
              Explore How It Works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-brand-muted">
            <span>Evidence-based insights</span>
            <span>Clear data sourcing</span>
            <span>Built for Indian markets</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative rounded-2xl border border-brand-border bg-brand-card p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Location snapshot
          </p>
          <p className="mt-1 text-base font-bold text-brand-text">
            Vasai West, Maharashtra
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
          <MapPinIcon className="h-5 w-5" />
        </span>
      </div>

      <div className="relative mt-6 h-52 overflow-hidden rounded-xl bg-brand-bg">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#E3EAE4 1px, transparent 1px), linear-gradient(90deg, #E3EAE4 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <ActivityRing className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2" />

        <span className="absolute left-[28%] top-[32%] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-orange text-white shadow-soft">
          <MapPinIcon className="h-3.5 w-3.5" />
        </span>
        <span className="absolute left-[70%] top-[62%] flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-green text-white shadow-soft">
          <MapPinIcon className="h-3 w-3" />
        </span>
        <span className="absolute left-[58%] top-[24%] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-green-deep text-white shadow-soft">
          <MapPinIcon className="h-2.5 w-2.5" />
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-brand-bg p-3">
          <p className="text-lg font-bold text-brand-green">High</p>
          <p className="text-xs text-brand-muted">Demand</p>
        </div>
        <div className="rounded-xl bg-brand-bg p-3">
          <p className="text-lg font-bold text-brand-orange">Moderate</p>
          <p className="text-xs text-brand-muted">Competition</p>
        </div>
        <div className="rounded-xl bg-brand-bg p-3">
          <p className="text-lg font-bold text-brand-green">Good</p>
          <p className="text-xs text-brand-muted">Access</p>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-brand-muted">
        Illustrative snapshot for demonstration purposes
      </p>
    </div>
  );
}

function ActivityRing({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-full w-full animate-pulse rounded-full border-4 border-brand-green/20" />
      <div className="absolute inset-3 rounded-full border-4 border-brand-green/30" />
      <div className="absolute inset-6 rounded-full border-4 border-brand-green/50" />
    </div>
  );
}
