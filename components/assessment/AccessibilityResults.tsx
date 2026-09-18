import type { AccessibilityCategory, AccessibilityEntity } from "@/lib/accessibility/types";
import type { CategoryDisplayState } from "./categoryDisplay";

const CATEGORY_LABEL: Record<AccessibilityCategory, string> = {
  railway_station: "Railway Station",
  bus_stop: "Bus Stop",
  major_road: "Major Road",
  road: "Road",
  other: "Other",
};

type AccessibilityResultsProps = {
  state: CategoryDisplayState<AccessibilityEntity>;
  radiusMetres: number;
};

export default function AccessibilityResults({
  state,
  radiusMetres,
}: AccessibilityResultsProps) {
  const places = state.status === "ok" ? state.data : [];

  const counts = {
    total: places.length,
    railwayStations: places.filter((place) => place.category === "railway_station").length,
    busStops: places.filter((place) => place.category === "bus_stop").length,
    majorRoads: places.filter((place) => place.category === "major_road").length,
    roads: places.filter((place) => place.category === "road").length,
  };

  return (
    <div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-6 shadow-soft">
      <h3 className="text-sm font-bold text-brand-text">Accessibility &amp; Transport</h3>
      <p className="mt-1 text-xs text-brand-muted">
        Roads, railway stations and bus stops within{" "}
        {(radiusMetres / 1000).toFixed(1)} km of your proposed site.
      </p>

      {state.status === "idle" && (
        <p className="mt-4 text-sm text-brand-muted">
          Click &ldquo;Run Site Analysis&rdquo; to load nearby accessibility
          data.
        </p>
      )}

      {state.status === "loading" && (
        <p className="mt-4 text-sm text-brand-muted">
          Loading nearby accessibility data…
        </p>
      )}

      {(state.status === "error" || state.status === "unavailable") && (
        <p className="mt-4 rounded-xl bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
          {state.message}
        </p>
      )}

      {state.status === "ok" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total" value={counts.total} />
            <StatCard label="Railway Stations" value={counts.railwayStations} />
            <StatCard label="Bus Stops" value={counts.busStops} />
            <StatCard label="Major Roads" value={counts.majorRoads} />
            <StatCard label="Roads" value={counts.roads} />
          </div>

          {places.length === 0 ? (
            <p className="mt-6 text-sm text-brand-muted">
              No accessibility features were found within this radius in
              OpenStreetMap.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-brand-muted">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Category</th>
                    <th className="py-2 pr-4 font-semibold">Road Class</th>
                    <th className="py-2 pr-4 font-semibold">Distance</th>
                    <th className="py-2 pr-4 font-semibold">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((place) => (
                    <tr key={place.id} className="border-b border-brand-border last:border-0">
                      <td className="py-2 pr-4 font-medium text-brand-text">
                        {place.name ?? (
                          <span className="italic text-brand-muted">
                            Unnamed place
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {CATEGORY_LABEL[place.category]}
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {place.roadClass ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {place.distanceMetres} m
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {place.address ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-xs text-brand-muted">
        Data source: OpenStreetMap contributors. Coverage and accuracy depend
        on OpenStreetMap mapping in this area. This list is source data, not
        a verified record, and is not guaranteed to be complete.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-brand-bg px-3 py-3 text-center shadow-soft">
      <p className="text-lg font-bold text-brand-text">{value}</p>
      <p className="mt-0.5 text-[11px] text-brand-muted">{label}</p>
    </div>
  );
}
