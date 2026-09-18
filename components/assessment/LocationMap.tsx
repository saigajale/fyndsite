"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type LatLng = { latitude: number; longitude: number };

const pinIcon = L.divIcon({
  className: "",
  html: `
    <span style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:34px;
      height:34px;
      border-radius:9999px 9999px 9999px 0;
      transform:rotate(45deg);
      background:#218B5A;
      box-shadow:0 2px 8px rgba(23,34,29,0.35);
      border:2px solid #ffffff;
    ">
      <span style="
        transform:rotate(-45deg);
        width:10px;
        height:10px;
        border-radius:9999px;
        background:#ffffff;
      "></span>
    </span>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function MapViewSync({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!hasCentered.current) {
      map.setView([center.latitude, center.longitude], zoom);
      hasCentered.current = true;
      return;
    }
    map.flyTo([center.latitude, center.longitude], map.getZoom(), {
      duration: 0.6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.latitude, center.longitude]);

  return null;
}

function ClickToPlacePin({ onMove }: { onMove: (point: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onMove({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

type LocationMapProps = {
  center: LatLng;
  marker: LatLng | null;
  zoom?: number;
  onPinMove: (point: LatLng) => void;
};

export default function LocationMap({
  center,
  marker,
  zoom = 15,
  onPinMove,
}: LocationMapProps) {
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewSync center={center} zoom={zoom} />
      <ClickToPlacePin onMove={onPinMove} />
      {marker && (
        <Marker
          position={[marker.latitude, marker.longitude]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const draggedMarker = event.target as L.Marker;
              const position = draggedMarker.getLatLng();
              onPinMove({ latitude: position.lat, longitude: position.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
