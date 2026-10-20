"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Create clean, minimal map marker icon suitable for light mode dashboard
const createReportIcon = (category, isOverdue) => {
  let color = "#d97706"; // Amber default for pending/in-progress
  if (isOverdue) color = "#dc2626"; // Crimson Red for overdue response
  else if (category === "POTHOLE_CRITICAL") color = "#ea580c"; // Safety Orange
  else color = "#d97706";

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isOverdue ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ""}
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${color};
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
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
}) {
  return (
    <MapContainer
      center={mapCenter || [-6.3985, 106.825]}
      zoom={12}
      scrollWheelZoom={true}
      className="w-full h-full min-h-[540px]"
    >
      <ChangeMapView center={mapCenter} />

      {/* Standard OpenStreetMap Clean Light Tiles */}
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
              color: isSelected ? "#0f172a" : color,
              weight: isSelected ? 7 : 5,
              opacity: isSelected ? 1 : 0.85,
              dashArray: road.condition === "RUSAK_BERAT" ? "6, 8" : undefined,
            }}
            eventHandlers={{
              click: () => onSelectRoad(road),
            }}
          >
            <Popup>
              <div className="p-1 text-xs text-slate-800">
                <span className="font-bold text-slate-900 text-sm block">{road.name}</span>
                <span className="text-slate-500 block mt-0.5">Kode Ruas: {road.code}</span>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold"
                  style={{
                    backgroundColor: road.authority === "NASIONAL" ? "#dbeafe" : road.authority === "PROVINSI" ? "#f3e8ff" : "#ccfbf1",
                    color: road.authority === "NASIONAL" ? "#1e40af" : road.authority === "PROVINSI" ? "#6b21a8" : "#115e59",
                  }}
                >
                  Wewenang: {road.authority}
                </div>
                <p className="mt-1.5 text-slate-700">{road.authorityLabel}</p>
                <div className="mt-2 text-[11px] text-orange-700 font-bold bg-orange-50 p-1.5 rounded border border-orange-200">
                  Alokasi APBD: Rp {(road.budget?.paguRp / 1000000000).toFixed(1)} Miliar
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* Citizen Report Markers */}
      {reports.map((report) => {
        const isOverdue = report.status === "OVERDUE";
        const icon = createReportIcon(report.damageCategory, isOverdue);

        return (
          <Marker
            key={report.id}
            position={report.coordinates}
            icon={icon}
            eventHandlers={{
              click: () => onSelectReport(report),
            }}
          >
            <Popup>
              <div className="p-1 text-xs max-w-xs text-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold text-slate-900 font-mono">{report.ticketCode}</span>
                  {isOverdue && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      OVERDUE SLA
                    </span>
                  )}
                </div>
                <p className="text-slate-800 font-medium">{report.roadName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{report.address}</p>

                <div className="mt-2 p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-orange-700 font-bold">Kategori AI: {report.categoryLabel}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">Skor Bahaya: {report.hazardScore}/100</div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500">
                  Instansi: <strong className="text-slate-800">{report.authorityLabel}</strong>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
