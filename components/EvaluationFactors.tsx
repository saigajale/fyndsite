import {
  ActivityIcon,
  BuildingIcon,
  LayersIcon,
  RouteIcon,
  TargetIcon,
  UsersIcon,
} from "./icons";

const FACTORS = [
  {
    title: "Local Demand",
    description:
      "Understand surrounding population and activity indicators.",
    icon: UsersIcon,
  },
  {
    title: "Competition",
    description: "Identify similar businesses and market saturation.",
    icon: TargetIcon,
  },
  {
    title: "Accessibility",
    description:
      "Evaluate roads, transport access and ease of reaching the location.",
    icon: RouteIcon,
  },
  {
    title: "Business Fit",
    description:
      "Understand whether the area matches the selected business type.",
    icon: BuildingIcon,
  },
  {
    title: "Nearby Amenities",
    description:
      "Discover schools, colleges, offices, hospitals and residential areas.",
    icon: LayersIcon,
  },
  {
    title: "Location Activity",
    description:
      "Estimate the level of movement and activity around the selected location.",
    icon: ActivityIcon,
  },
];

export default function EvaluationFactors() {
  return (
    <section id="use-cases" className="mx-auto max-w-8xl px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          What Fyndsol evaluates
        </h2>
        <p className="mt-4 text-lg text-brand-muted">
          A structured view of the factors that matter most when choosing a
          location.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORS.map((factor) => (
          <div
            key={factor.title}
            className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-soft transition-shadow hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <factor.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-brand-text">
              {factor.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {factor.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
