import { AlertIcon, CheckCircleIcon, MapPinIcon } from "./icons";

const STRENGTHS = [
  "Residential demand nearby",
  "Good accessibility",
  "Multiple activity drivers",
];

const WATCH_OUTS = ["Moderate competition", "Validate evening footfall"];

export default function ReportPreview() {
  return (
    <section className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          See what an assessment looks like
        </h2>
        <p className="mt-4 text-lg text-brand-muted">
          A sample of how Fyndsol presents its findings.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-brand-border bg-brand-card p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between border-b border-brand-border pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <MapPinIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold text-brand-text">
                Vasai West
              </p>
              <p className="text-xs text-brand-muted">Maharashtra</p>
            </div>
          </div>
          <span className="rounded-full bg-brand-bg px-3 py-1 text-xs font-semibold text-brand-muted">
            Business: Café
          </span>
        </div>

        <div className="flex items-center justify-between py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Location Suitability
            </p>
            <p className="mt-1 text-4xl font-extrabold text-brand-green">
              78<span className="text-lg text-brand-muted"> / 100</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-3 py-1.5 text-sm font-semibold text-brand-green-deep">
              <CheckCircleIcon className="h-4 w-4" />
              Suitable
            </span>
            <p className="mt-2 text-xs text-brand-muted">
              Confidence: Medium
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-brand-border pt-6 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-green-deep">
              <CheckCircleIcon className="h-4 w-4" />
              Strengths
            </p>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              {STRENGTHS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-orange">
              <AlertIcon className="h-4 w-4" />
              Watch-outs
            </p>
            <ul className="mt-3 space-y-2 text-sm text-brand-muted">
              {WATCH_OUTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 rounded-xl bg-brand-bg px-4 py-3 text-center text-xs font-medium text-brand-muted">
          Illustrative assessment preview — not live analysis
        </p>
      </div>
    </section>
  );
}
