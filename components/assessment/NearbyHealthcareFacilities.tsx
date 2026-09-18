import type { HealthcareCategory, NearbyHealthcarePlace } from "@/lib/healthcare/types";
import type { CategoryDisplayState } from "./categoryDisplay";

const CATEGORY_LABEL: Record<HealthcareCategory, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  doctor: "Doctor",
  polyclinic: "Polyclinic",
  pharmacy: "Pharmacy",
  dentist: "Dentist",
  diagnostic_lab: "Diagnostic Lab",
  healthcare_centre: "Healthcare Centre",
  nursing_home: "Nursing Home",
  veterinary: "Veterinary",
  ambulance: "Ambulance",
  other: "Other",
};

type NearbyHealthcareFacilitiesProps = {
  state: CategoryDisplayState<NearbyHealthcarePlace>;
  radiusMetres: number;
};

export default function NearbyHealthcareFacilities({
  state,
  radiusMetres,
}: NearbyHealthcareFacilitiesProps) {
  const places = state.status === "ok" ? state.data : [];

  const counts = {
    total: places.length,
    hospitals: places.filter((place) => place.category === "hospital").length,
    clinicsDoctors: places.filter((place) =>
      (["clinic", "doctor", "polyclinic"] as HealthcareCategory[]).includes(place.category),
    ).length,
    pharmacies: places.filter((place) => place.category === "pharmacy").length,
    diagnosticLabs: places.filter((place) => place.category === "diagnostic_lab").length,
    veterinary: places.filter((place) => place.category === "veterinary").length,
    otherHealthcare: places.filter((place) =>
      (
        ["healthcare_centre", "nursing_home", "ambulance", "other", "dentist"] as HealthcareCategory[]
      ).includes(place.category),
    ).length,
  };

  return (
    <div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-6 shadow-soft">
      <h3 className="text-sm font-bold text-brand-text">
        Nearby Healthcare Facilities
      </h3>
      <p className="mt-1 text-xs text-brand-muted">
        Healthcare facilities within {(radiusMetres / 1000).toFixed(1)} km of
        your proposed site.
      </p>

      {state.status === "idle" && (
        <p className="mt-4 text-sm text-brand-muted">
          Click &ldquo;Run Site Analysis&rdquo; to load nearby healthcare
          facilities.
        </p>
      )}

      {state.status === "loading" && (
        <p className="mt-4 text-sm text-brand-muted">
          Loading nearby healthcare facilities…
        </p>
      )}

      {(state.status === "error" || state.status === "unavailable") && (
        <p className="mt-4 rounded-xl bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
          {state.message}
        </p>
      )}

      {state.status === "ok" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <StatCard label="Total" value={counts.total} />
            <StatCard label="Hospitals" value={counts.hospitals} />
            <StatCard label="Clinics/Doctors" value={counts.clinicsDoctors} />
            <StatCard label="Pharmacies" value={counts.pharmacies} />
            <StatCard label="Diagnostic Labs" value={counts.diagnosticLabs} />
            <StatCard label="Veterinary" value={counts.veterinary} />
            <StatCard label="Other Healthcare" value={counts.otherHealthcare} />
          </div>

          {places.length === 0 ? (
            <p className="mt-6 text-sm text-brand-muted">
              No healthcare places were found within this radius in
              OpenStreetMap.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-brand-muted">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Category</th>
                    <th className="py-2 pr-4 font-semibold">Distance</th>
                    <th className="py-2 pr-4 font-semibold">Address</th>
                    <th className="py-2 pr-4 font-semibold">Contact</th>
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
                        {place.distanceMetres} m
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {place.address ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-brand-muted">
                        {place.phone || place.website ? (
                          <div className="flex flex-col gap-0.5">
                            {place.phone && <span>{place.phone}</span>}
                            {place.website &&
                              (/^https?:\/\//i.test(place.website) ? (
                                <a
                                  href={place.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-green hover:underline"
                                >
                                  Website
                                </a>
                              ) : (
                                <span>{place.website}</span>
                              ))}
                          </div>
                        ) : (
                          "—"
                        )}
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
        a verified business directory, and is not guaranteed to be complete.
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
