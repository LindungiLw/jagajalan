"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Create custom milestone marker for key KM boundaries along National Highways
const createMilestoneIcon = (status, isSelected) => {
  let color = "#2563eb"; // Blue for Mantap
  if (status === "RUSAK_BERAT") color = "#dc2626"; // Crimson
  else if (status === "RUSAK_RINGAN") color = "#d97706"; // Amber

  return L.divIcon({
    className: "custom-milestone-marker",
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #ffffff;
          border: 2px solid ${color};
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
          color: ${color};
          font-family: monospace;
          letter-spacing: -0.5px;
        ">
          KM
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Create custom locator icon for clicked / detected geospatial point
const createDetectedLocationIcon = () => {
  return L.divIcon({
    className: "custom-detected-marker",
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(13, 148, 136, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0d9488;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

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
          <!-- Large Radial Aura Halo -->
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

function MapController({ center, zoom = 11.5, onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (center && map) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

// Click anywhere on map to detect jurisdiction & responsible official
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export default function MapInner({
  roads,
  reports,
  selectedRoad,
  selectedReport,
  detectedPoint,
  onSelectRoad,
  onSelectReport,
  onMapClick,
  mapCenter,
  mapZoom = 11.5,
  onMapReady,
}) {
  return (
    <MapContainer
      center={mapCenter || [3.5952, 98.6722]}
      zoom={mapZoom}
      zoomControl={false}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ width: "100%", height: "100%", minHeight: "680px" }}
    >
      <MapController center={mapCenter} zoom={mapZoom} onMapReady={onMapReady} />
      <MapClickHandler onMapClick={onMapClick} />

      {/* CartoDB Positron / OSM Clean Light Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Road Segment Polylines */}
      {roads.map((road) => {
        let color = "#0d9488"; // Kota/Kab: Teal
        let badgeBg = "bg-teal-50 text-teal-800 border-teal-200";
        if (road.authority === "NASIONAL") {
          color = "#2563eb"; // Nasional: Royal Blue
          badgeBg = "bg-blue-50 text-blue-800 border-blue-200";
        }
        if (road.authority === "PROVINSI") {
          color = "#7c3aed"; // Provinsi: Vivid Purple
          badgeBg = "bg-purple-50 text-purple-800 border-purple-200";
        }

        const isSelected = selectedRoad?.id === road.id;

        return (
          <React.Fragment key={road.id}>
            {/* Click hit area expander */}
            <Polyline
              positions={road.coordinates}
              pathOptions={{
                color: "transparent",
                weight: 18,
                opacity: 0,
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            />

            {/* Visual polyline */}
            <Polyline
              positions={road.coordinates}
              pathOptions={{
                color: isSelected ? "#ea580c" : color,
                weight: isSelected ? 7 : 5,
                opacity: isSelected ? 1 : 0.85,
                dashArray: road.condition === "RUSAK_BERAT" ? "6, 6" : undefined,
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs">
                  <div className="font-bold text-slate-900">{road.name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {road.authorityLabel} • PIC: {road.leadership?.regionalHead}
                  </div>
                </div>
              </Tooltip>

              <Popup className="jagajalan-leaflet-popup">
                <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold border ${badgeBg}`}>
                      {road.authority}
                    </span>
                    <span className="text-[10px] font-sans tabular-nums text-slate-400 font-bold">{road.code}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{road.name}</h4>
                    <p className="text-[10px] text-slate-500">{road.district} • {road.lengthKm} KM</p>
                    {road.leadership?.regionalHead && (
                      <div className="text-[9.5px] font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded-[5px] border border-slate-200 mt-1">
                        PIC: {road.leadership.regionalHead}
                      </div>
                    )}
                  </div>

                  {/* Problem snippet */}
                  <div className="bg-orange-50/80 rounded-[5px] p-2 border border-orange-100 space-y-1">
                    <div className="text-[10px] font-bold text-orange-900 flex items-center gap-1">
                      <span>⚠️ Masalah:</span>
                      <span className="font-semibold text-orange-800">{road.problemDetails?.headline || road.condition}</span>
                    </div>
                    <div className="text-[9px] text-slate-600 line-clamp-2">
                      {road.problemDetails?.description}
                    </div>
                  </div>

                  {/* Construction project snippet */}
                  {road.budget && (
                    <div className="bg-slate-50 rounded-[5px] p-2 border border-slate-200/80 space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-800 flex items-center justify-between">
                        <span>🏗️ Proyek:</span>
                        <span className="text-orange-700 font-black">
                          Rp {((road.budget.paguRp || 0) / 1000000000).toFixed(1)} M
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-600 line-clamp-1 font-medium">
                        {road.budget.name}
                      </div>
                      <div className="text-[8px] text-slate-400">
                        Kontraktor: {road.budget.contractor || "Dalam Pengadaan"}
                      </div>
                    </div>
                  )}

                  {/* Official Sources cited */}
                  <div className="text-[8.5px] text-slate-500 border-t border-slate-100 pt-1 flex items-center justify-between">
                    <span>Sumber: {road.officialSources?.budgetSource ? "SiRUP / LPSE" : "SK KemenPU"}</span>
                    <span className="text-emerald-700 font-bold">✓ Terverifikasi</span>
                  </div>

                  <button
                    onClick={() => onSelectRoad(road)}
                    className="w-full py-1.5 px-2 rounded-[5px] text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 text-center transition-colors cursor-pointer block"
                  >
                    Buka Detail Lengkap di Panel →
                  </button>
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
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
          >
            <Tooltip sticky>
              <div className="font-sans text-xs">
                <div className="font-bold text-slate-900">{report.ticketCode} • {report.roadName}</div>
                <div className="text-[10px] text-slate-500">
                  {report.categoryLabel} • Skor Bahaya: {report.hazardScore}/100
                </div>
              </div>
            </Tooltip>

            <Popup className="jagajalan-leaflet-popup">
              <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="font-sans tabular-nums text-[9px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded-[4px]">
                    {report.ticketCode}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] ${
                    isOverdue ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {isOverdue ? "SLA Overdue >14 Hari" : "Dalam Pengerjaan"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">{report.roadName}</h4>
                  <p className="text-[10px] text-slate-500">{report.address}</p>
                </div>

                <div className="bg-slate-50 p-2 rounded-[4px] border border-slate-200 text-[10px] space-y-1">
                  <div className="font-semibold text-slate-800 flex justify-between">
                    <span>Kategori:</span>
                    <span className="font-bold text-orange-700">{report.categoryLabel}</span>
                  </div>
                  <div className="font-semibold text-slate-800 flex justify-between">
                    <span>Estimasi Bahaya AI:</span>
                    <span className="font-bold text-rose-600">{report.hazardScore}/100 ({report.hazardLevel})</span>
                  </div>
                </div>

                {report.matchingBudget && (
                  <div className="text-[9px] text-slate-600 bg-orange-50/60 p-1.5 rounded-[4px] border border-orange-100">
                    <span className="font-bold text-orange-900">Proyek Terhubung: </span>
                    {report.matchingBudget.packageName} (Rp {((report.matchingBudget.paguRp || 0) / 1000000000).toFixed(1)} M)
                  </div>
                )}

                <div className="text-[8.5px] text-slate-400 border-t border-slate-100 pt-1">
                  Dasar Hukum: {report.legalBasis}
                </div>

                <button
                  onClick={() => onSelectReport(report)}
                  className="w-full py-1.5 px-2 rounded-[4px] text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 text-center transition-colors cursor-pointer block"
                >
                  Buka Detail Aduan di Panel →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Key Milestone Boundary Points along National Highways */}
      {roads.map((road) => {
        if (!road.milestones || road.milestones.length === 0) return null;
        const isRoadSelected = selectedRoad?.id === road.id;

        return road.milestones.map((ms, idx) => {
          if (!ms || !ms.coords || !Array.isArray(ms.coords) || ms.coords.length < 2) return null;
          const msIcon = createMilestoneIcon(ms.status, isRoadSelected);

          return (
            <Marker
              key={`${road.id}-ms-${idx}`}
              position={ms.coords}
              icon={msIcon}
              zIndexOffset={isRoadSelected ? 500 : 50}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="bg-blue-600 text-white text-[9px] px-1 py-0.2 rounded font-sans tabular-nums font-bold">KM {ms.km}</span>
                    <span>{ms.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {road.name} • Kondisi: {ms.status}
                  </div>
                </div>
              </Tooltip>

              <Popup className="jagajalan-leaflet-popup">
                <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="font-sans tabular-nums text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-[4px]">
                      PATOK KM {ms.km}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{ms.status}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{ms.name}</h4>
                    <p className="text-[10px] text-slate-500">{road.name}</p>
                    <p className="text-[9px] text-slate-600 mt-1 italic">"{ms.note}"</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-[4px] border border-slate-200 text-[9px] space-y-0.5">
                    <div className="text-slate-500">Penanggung Jawab:</div>
                    <div className="font-bold text-slate-800">{road.leadership?.regionalHead}</div>
                    <div className="text-slate-600">{road.leadership?.agency}</div>
                  </div>
                  <button
                    onClick={() => onSelectRoad(road)}
                    className="w-full py-1.5 px-2 rounded-[4px] text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 text-center transition-colors cursor-pointer block"
                  >
                    Buka Detail Koridor Nasional →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        });
      })}

      {/* Detected Location Click Marker */}
      {detectedPoint && detectedPoint.coordinates && (
        <Marker
          position={detectedPoint.coordinates}
          icon={createDetectedLocationIcon()}
          zIndexOffset={2000}
        >
          <Tooltip permanent direction="top" offset={[0, -18]}>
            <div className="font-sans text-xs bg-teal-900 text-white px-2 py-1 rounded-[4px] shadow-lg font-bold">
              🎯 Titik Terdeteksi: {detectedPoint.provinceName}
            </div>
          </Tooltip>
          <Popup className="jagajalan-leaflet-popup" autoPan>
            <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="font-bold text-[9px] text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded-[4px]">
                  DETEKSI GEOSPASIAL
                </span>
                <span className="text-[9px] font-sans tabular-nums font-bold text-slate-400">
                  {detectedPoint.coordinates[0].toFixed(3)}, {detectedPoint.coordinates[1].toFixed(3)}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{detectedPoint.provinceName} ({detectedPoint.island})</h4>
                <p className="text-[10px] text-teal-700 font-bold">{detectedPoint.authorityLabel}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-[4px] border border-slate-200 text-[9.5px] space-y-1">
                <div>
                  <span className="text-slate-500">Penanggung Jawab: </span>
                  <span className="font-bold text-slate-900">{detectedPoint.leadership?.regionalHead}</span>
                </div>
                <div>
                  <span className="text-slate-500">Instansi: </span>
                  <span className="font-medium text-slate-800">{detectedPoint.leadership?.agency}</span>
                </div>
                {detectedPoint.nearestRoad && (
                  <div className="pt-1 border-t border-slate-200/80 text-[8.5px] text-slate-600">
                    Koridor Nasional Terdekat: <span className="font-semibold">{detectedPoint.nearestRoad.name}</span> (~{detectedPoint.distanceToNearestNationalKm} km)
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
