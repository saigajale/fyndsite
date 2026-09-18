"use client";

import { useEffect, useRef, useState } from "react";
import LocationSearch from "./LocationSearch";
import ConfirmedLocationSummary from "./ConfirmedLocationSummary";
import BusinessUseCaseSelector from "./BusinessUseCaseSelector";
import NearbyHealthcareFacilities from "./NearbyHealthcareFacilities";
import AccessibilityResults from "./AccessibilityResults";
import LocationMap from "./LocationMapLoader";
import { toCategoryDisplayState, type SiteAnalysisState } from "./categoryDisplay";
import { CompassIcon, MapPinIcon } from "@/components/icons";
import { reverseGeocode } from "@/lib/location/client";
import { runSiteAnalysis } from "@/lib/site-analysis/client";
import type { GeocodeResult, SiteLocation } from "@/lib/location/types";
import {
  DEFAULT_BUSINESS_USE_CASE,
  type BusinessUseCaseValue,
} from "@/lib/assessment/types";
import type { LatLng } from "./LocationMap";

// Kept as a named constant (rather than an unexplained literal), used only
// for display text — the actual radius is decided server-side by
// lib/site-analysis/service.ts and must be kept in sync with this value.
const SITE_ANALYSIS_RADIUS_METRES = 2000;

// Approximate centre of Vasai West, Maharashtra — used only as the default
// map view before any location has been searched or selected.
const PILOT_DEFAULT_CENTER: LatLng = { latitude: 19.3868, longitude: 72.8296 };

const STATUS_COPY: Record<SiteLocation["source"], string> = {
  search: "Search result selected",
  map_pin: "Location adjusted on map",
  current_location: "Using current location",
};

function describeGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Please allow location access or search manually.";
    case error.POSITION_UNAVAILABLE:
    case error.TIMEOUT:
    default:
      return "Your location could not be detected. Please try again or select the location on the map.";
  }
}

export default function SiteLocationPicker() {
  const [location, setLocation] = useState<SiteLocation | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [locatingCurrentPosition, setLocatingCurrentPosition] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [businessUseCase, setBusinessUseCase] = useState<BusinessUseCaseValue>(
    DEFAULT_BUSINESS_USE_CASE,
  );
  const [analysis, setAnalysis] = useState<SiteAnalysisState>({
    status: "idle",
  });
  const pendingMoveRef = useRef<LatLng | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);

  // Any change to the confirmed site (a new search result, a dragged pin, a
  // fresh current-location fix, or re-opening for edits) invalidates a
  // previous analysis — it must be re-run explicitly, never silently reused.
  function resetAnalysis() {
    analysisAbortRef.current?.abort();
    setAnalysis({ status: "idle" });
  }

  function handleSearchSelect(result: GeocodeResult) {
    setGeoError(null);
    resetAnalysis();
    reverseAbortRef.current?.abort();
    setResolvingAddress(false);
    setLocation({
      name: result.name,
      formattedAddress: result.formattedAddress,
      latitude: result.latitude,
      longitude: result.longitude,
      source: "search",
      confirmed: false,
      providerPlaceId: result.providerPlaceId,
    });
  }

  function handlePinMove(point: LatLng) {
    setGeoError(null);
    resetAnalysis();
    setLocation((current) =>
      current
        ? {
            ...current,
            latitude: point.latitude,
            longitude: point.longitude,
            source: "map_pin",
            confirmed: false,
            providerPlaceId: undefined,
          }
        : {
            name: "Selected point",
            formattedAddress: "Resolving address…",
            latitude: point.latitude,
            longitude: point.longitude,
            source: "map_pin",
            confirmed: false,
          },
    );
    pendingMoveRef.current = point;
  }

  function handleUseCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setGeoError("Your browser does not support location detection.");
      return;
    }

    setGeoError(null);
    setLocatingCurrentPosition(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocatingCurrentPosition(false);
        const point: LatLng = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        resetAnalysis();
        reverseAbortRef.current?.abort();
        setLocation({
          name: "Detected location",
          formattedAddress: "Resolving address…",
          latitude: point.latitude,
          longitude: point.longitude,
          source: "current_location",
          confirmed: false,
        });
        pendingMoveRef.current = point;
      },
      (error) => {
        setLocatingCurrentPosition(false);
        setGeoError(describeGeolocationError(error));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  // Debounce reverse-geocoding so a drag gesture or a quick series of map
  // clicks only triggers one lookup, instead of one per intermediate move.
  useEffect(() => {
    if (!pendingMoveRef.current) return;
    const point = pendingMoveRef.current;

    reverseAbortRef.current?.abort();
    const controller = new AbortController();
    reverseAbortRef.current = controller;

    const timeout = setTimeout(() => {
      setResolvingAddress(true);
      reverseGeocode(point.latitude, point.longitude, controller.signal)
        .then((result) => {
          if (!result) return;
          setLocation((current) =>
            current && current.latitude === point.latitude && current.longitude === point.longitude
              ? {
                  ...current,
                  name: result.name,
                  formattedAddress: result.formattedAddress,
                }
              : current,
          );
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
        })
        .finally(() => setResolvingAddress(false));
    }, 600);

    pendingMoveRef.current = null;
    return () => clearTimeout(timeout);
  }, [location?.latitude, location?.longitude]);

  function handleConfirm() {
    setLocation((current) => (current ? { ...current, confirmed: true } : current));
  }

  function handleEdit() {
    resetAnalysis();
    setLocation((current) => (current ? { ...current, confirmed: false } : current));
  }

  async function handleRunAnalysis() {
    // Guards against duplicate/simultaneous requests: a click while a
    // request is already in flight, or with no confirmed location, is a
    // no-op rather than firing a second overlapping fetch.
    if (!location || analysis.status === "loading") return;

    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    setAnalysis({ status: "loading" });

    try {
      const response = await runSiteAnalysis(
        {
          site: {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            formattedAddress: location.formattedAddress,
            source: location.source,
          },
          businessUseCase,
        },
        controller.signal,
      );
      setAnalysis({ status: "ready", response });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setAnalysis({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Site analysis is temporarily unavailable.",
      });
    }
  }

  const mapCenter: LatLng = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : PILOT_DEFAULT_CENTER;
  const mapMarker: LatLng | null = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-soft">
          <LocationSearch onSelect={handleSearchSelect} />

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locatingCurrentPosition}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/5 px-5 py-3 text-sm font-semibold text-brand-orange transition-colors hover:bg-brand-orange/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <CompassIcon className="h-4 w-4" />
            {locatingCurrentPosition
              ? "Detecting your location…"
              : "Use my current location"}
          </button>

          {geoError && (
            <p className="mt-3 rounded-xl bg-brand-orange/10 px-4 py-3 text-xs font-medium text-brand-orange">
              {geoError}
            </p>
          )}

          {!location && !geoError && (
            <p className="mt-6 rounded-xl bg-brand-bg px-4 py-4 text-sm text-brand-muted">
              Search for an address or landmark, use your current location,
              or click on the map to see it here. You will be able to
              fine-tune the exact spot before confirming.
            </p>
          )}

          {location && (
            <div className="mt-6 space-y-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  location.confirmed
                    ? "bg-brand-green/10 text-brand-green-deep"
                    : "bg-brand-orange/10 text-brand-orange"
                }`}
              >
                {location.confirmed
                  ? "Location confirmed"
                  : STATUS_COPY[location.source]}
              </span>

              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-text">
                    {location.source === "current_location" && !location.confirmed
                      ? "Detected location"
                      : location.name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {resolvingAddress
                      ? "Updating address…"
                      : location.formattedAddress}
                  </p>
                </div>
              </div>

              {!location.confirmed ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-green-deep"
                >
                  Confirm this location
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full rounded-full border border-brand-border bg-brand-bg px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-green"
                >
                  Edit location
                </button>
              )}

              <p className="text-xs text-brand-muted">
                {location.source === "current_location" && !location.confirmed
                  ? "The address may be approximate. Move the pin if needed."
                  : "Drag the pin or click anywhere on the map to fine-tune the exact site."}
              </p>
            </div>
          )}
        </div>

        {location?.confirmed && (
          <div className="mt-6">
            <ConfirmedLocationSummary location={location} />

            <div className="mt-6 rounded-2xl border border-brand-border bg-brand-card p-6 shadow-soft">
              <BusinessUseCaseSelector
                value={businessUseCase}
                onChange={setBusinessUseCase}
              />

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={analysis.status === "loading"}
                className="mt-5 w-full rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-green-deep disabled:cursor-not-allowed disabled:opacity-70"
              >
                {analysis.status === "loading"
                  ? "Running analysis…"
                  : "Run Site Analysis"}
              </button>
            </div>

            <NearbyHealthcareFacilities
              state={toCategoryDisplayState(
                analysis,
                (response) => response.categories.healthcare,
              )}
              radiusMetres={SITE_ANALYSIS_RADIUS_METRES}
            />
            <AccessibilityResults
              state={toCategoryDisplayState(
                analysis,
                (response) => response.categories.accessibility,
              )}
              radiusMetres={SITE_ANALYSIS_RADIUS_METRES}
            />
          </div>
        )}
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-brand-border shadow-soft lg:col-span-3 lg:h-[560px]">
        <LocationMap
          center={mapCenter}
          marker={mapMarker}
          onPinMove={handlePinMove}
        />
        {!location && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-[500] flex justify-center px-4">
            <span className="rounded-full border border-brand-border bg-brand-card/95 px-4 py-2 text-xs font-medium text-brand-muted shadow-soft">
              Search, use current location, or click the map to place a pin
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
