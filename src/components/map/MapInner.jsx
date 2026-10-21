"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Create custom orange marker icon matching the high-fidelity UI design
const createReportIcon = (category, isOverdue, isSelected) => {
  let bgColor = "#ea580c"; // Safety Orange
  if (isOverdue) bgColor = "#dc2626"; // Crimson Red for Overdue
  else if (category === "SUBSIDENCE") bgColor = "#d97706";

  if (isSelected) {
    return L.divIcon({
      className: "custom-map-marker-selected",
      html: `
        <div style="
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Large Radial Aura Halo (as seen in screenshot around Sawangan pin) -->
          <div style="
            position: absolute;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: rgba(234, 88, 12, 0.16);
            pointer-events: none;
          "></div>
          <div style="
            position: absolute;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(234, 88, 12, 0.28);
            pointer-events: none;
          "></div>
          <!-- Teardrop Location Pin SVG pointing down -->
          <div style="
            position: relative;
            transform: translateY(-8px);
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
          ">
            <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 14.5 40.5 16.2 41.8C16.65 42.1 17.35 42.1 17.8 41.8C19.5 40.5 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${bgColor}"/>
              <circle cx="17" cy="16" r="10" fill="#ffffff" fill-opacity="0.25"/>
              <!-- Exclamation Mark Inside Pin -->
              <circle cx="17" cy="14" r="5" fill="#ffffff"/>
              <path d="M17 12V14.5" stroke="${bgColor}" stroke-width="2" stroke-linecap="round"/>
              <circle cx="17" cy="17" r="1" fill="${bgColor}"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 46],
    });
  }

  // Regular non-selected pin with white warning triangle icon
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        ${isOverdue ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${bgColor}; opacity: 0.35; animation: ping 1.8s infinite;"></span>` : ""}
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- White Alert Triangle SVG Icon (matching screenshot exactly) -->
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function MapController({ center, onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (center && map) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);

  return null;
}

export default function MapInner({
  roads,
  reports,
  selectedRoad,
  selectedReport,
  onSelectRoad,
  onSelectReport,
  mapCenter,
  onMapReady,
}) {
  return (
    <MapContainer
      center={mapCenter || [-6.3985, 106.825]}
      zoom={11.5}
      zoomControl={false}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ width: "100%", height: "100%", minHeight: "680px" }}
    >
      <MapController center={mapCenter} onMapReady={onMapReady} />

      {/* CartoDB Positron / OSM Clean Light Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Road Segment Polylines */}
      {roads.map((road) => {
        let color = "#0d9488"; // Kota/Kab: Teal
        if (road.authority === "NASIONAL") color = "#2563eb"; // Nasional: Royal Blue
        if (road.authority === "PROVINSI") color = "#7c3aed"; // Provinsi: Vivid Purple

        const isSelected = selectedRoad?.id === road.id;

        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: isSelected ? "#ea580c" : color,
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 1 : 0.8,
              dashArray: road.condition === "RUSAK_BERAT" ? "5, 6" : undefined,
            }}
            eventHandlers={{
              click: () => onSelectRoad(road),
            }}
          />
        );
      })}

      {/* Citizen Report Markers */}
      {reports.map((report) => {
        const isOverdue = report.status === "OVERDUE";
        const isSelected = selectedReport?.id === report.id;
        const icon = createReportIcon(report.damageCategory, isOverdue, isSelected);

        return (
          <Marker
            key={report.id}
            position={report.coordinates}
            icon={icon}
            zIndexOffset={isSelected ? 1000 : 1}
            eventHandlers={{
              click: () => onSelectReport(report),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
