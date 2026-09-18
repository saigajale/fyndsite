"use client";

import dynamic from "next/dynamic";

// Kept in its own module, separate from SiteLocationPicker.tsx, so editing
// SiteLocationPicker.tsx during development never re-evaluates this
// dynamic() call. Next.js Fast Refresh re-runs a file's module-scope code
// on every edit to that file; if dynamic() were declared inside
// SiteLocationPicker.tsx (as it previously was), each edit there produced
// a brand new lazy-loaded component wrapper, which React treats as a
// different component type at the same JSX position — triggering an
// unmount of the previous LocationMap (and its underlying Leaflet Map
// instance) and a mount of a new one, without the two being perfectly
// synchronized. Leaflet then briefly has two Map instances contending for
// the same DOM container, throwing "Map container is being reused by
// another instance" and a TileLayer appendChild crash. Isolating the
// dynamic() call in this rarely-edited file keeps its wrapper identity
// stable across edits anywhere else in the app.
const LocationMapLoader = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-bg text-sm text-brand-muted">
      Loading map…
    </div>
  ),
});

export default LocationMapLoader;
