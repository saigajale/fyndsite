import { BuildingIcon, CompassIcon, LayersIcon } from "./icons";

const STEPS = [
  {
    number: "01",
    title: "Choose your business",
    description:
      "Tell us what you're planning to open, from a café to a pharmacy.",
    icon: BuildingIcon,
  },
  {
    number: "02",
    title: "Select your location",
    description:
      "Confirm the area you want to evaluate, starting with Vasai West.",
    icon: CompassIcon,
  },
  {
    number: "03",
    title: "Get your location assessment",
    description:
      "Review demand, competition, accessibility and fit in one clear report.",
    icon: LayersIcon,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-brand-card py-20"
    >
      <div className="mx-auto max-w-8xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-brand-muted">
            Three simple steps to a clearer location decision.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center md:text-left">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-brand-orange">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-brand-text">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
