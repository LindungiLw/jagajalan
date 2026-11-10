"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Custom pin marker matching JagaJalan orange signature
const createMiniMapPinIcon = () => {
  return L.divIcon({
    className: "custom-mini-picker-pin",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <span style="
          position: absolute;
          bottom: 1px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 6px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.28);
          filter: blur(1.5px);
        "></span>
        <div style="
          position: relative;
          transform: translateY(-8px);
          filter: drop-shadow(0 4px 6px rgba(194, 65, 12, 0.45));
        ">
          <svg width="30" height="38" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 14.5 40.5 16.2 41.8C16.65 42.1 17.35 42.1 17.8 41.8C19.5 40.5 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="#c2410c"/>
            <circle cx="17" cy="15" r="9" fill="#ffffff" fill-opacity="0.25"/>
            <circle cx="17" cy="14" r="5" fill="#ffffff"/>
            <circle cx="17" cy="14" r="2.5" fill="#c2410c"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 36],
  });
};

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      if (onLocationChange && e.latlng) {
        onLocationChange(
          Number(e.latlng.lat.toFixed(5)),
          Number(e.latlng.lng.toFixed(5))
        );
      }
    },
  });
  return null;
}

export default function MiniGisPickerInner({ lat, lng, onLocationChange }) {
  const pinIcon = useMemo(() => createMiniMapPinIcon(), []);

  const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : -6.2088;
  const safeLng = typeof lng === "number" && !isNaN(lng) ? lng : 106.8456;

  return (
    <MapContainer
      center={[safeLat, safeLng]}
      zoom={15}
      scrollWheelZoom={false}
      dragging={true}
      doubleClickZoom={true}
      className="w-full h-full z-0"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapRecenter lat={safeLat} lng={safeLng} />
      <MapClickHandler onLocationChange={onLocationChange} />
      <Marker
        position={[safeLat, safeLng]}
        icon={pinIcon}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            if (onLocationChange && position) {
              onLocationChange(
                Number(position.lat.toFixed(5)),
                Number(position.lng.toFixed(5))
              );
            }
          },
        }}
      />
    </MapContainer>
  );
}

