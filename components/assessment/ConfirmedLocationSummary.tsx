import { CheckCircleIcon, MapPinIcon } from "@/components/icons";
import type { SiteLocation } from "@/lib/location/types";

const SOURCE_LABEL: Record<SiteLocation["source"], string> = {
  search: "Search result",
  map_pin: "Adjusted on map",
  current_location: "Current location",
};

export default function ConfirmedLocationSummary({
  location,
}: {
  location: SiteLocation;
}) {
  return (
    <div className="rounded-2xl border border-brand-green/30 bg-brand-green/5 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-green-deep">
        <CheckCircleIcon className="h-4 w-4" />
        Site location confirmed
      </div>

      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
          <MapPinIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-bold text-brand-text">{location.name}</p>
          <p className="mt-0.5 text-sm text-brand-muted">
            {location.formattedAddress}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-brand-border pt-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Latitude
          </dt>
          <dd className="mt-1 text-sm font-medium text-brand-text">
            {location.latitude.toFixed(6)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Longitude
          </dt>
          <dd className="mt-1 text-sm font-medium text-brand-text">
            {location.longitude.toFixed(6)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Source
          </dt>
          <dd className="mt-1 text-sm font-medium text-brand-text">
            {SOURCE_LABEL[location.source]}
          </dd>
        </div>
      </dl>
    </div>
  );
}
