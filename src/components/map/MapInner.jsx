"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, WMSTileLayer, Marker, Polyline, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";
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

// Helper to split coordinates if there is an ocean-crossing jump (>55km) into clean multi-polyline segments
const getPolylinePositions = (coords) => {
  if (!coords || !coords.length) return [];
  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) return coords;

  const segments = [];
  let currentSegment = [coords[0]];
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    if (!p1 || !p2) continue;
    const dLat = (p2[0] - p1[0]) * 111;
    const dLng = (p2[1] - p1[1]) * 111 * Math.cos((p1[0] * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist > 55) {
      segments.push(currentSegment);
      currentSegment = [p2];
    } else {
      currentSegment.push(p2);
    }
  }
  segments.push(currentSegment);
  return segments.length > 1 ? segments : coords;
};

// Create custom marker icon matching the high-fidelity UI design & live status
const createReportIcon = (
  category,
  isOverdue,
  isSelected,
  isLiveCitizenReport = false,
  status = ""
) => {
  const isCompleted = status === "SELESAI";
  const isVerified = status === "TERVERIFIKASI";
  const isInProgress = status === "DALAM_PENGERJAAN";

  let bgColor = "#ea580c"; // Safety Orange
  let haloRgbaOuter = "rgba(234, 88, 12, 0.16)";
  let haloRgbaInner = "rgba(234, 88, 12, 0.28)";

  if (isCompleted) {
    bgColor = "#059669"; // Emerald Green for Completed
    haloRgbaOuter = "rgba(5, 150, 105, 0.16)";
    haloRgbaInner = "rgba(5, 150, 105, 0.28)";
  } else if (isVerified) {
    bgColor = "#2563eb"; // Blue for Verified by Agency
    haloRgbaOuter = "rgba(37, 99, 235, 0.16)";
    haloRgbaInner = "rgba(37, 99, 235, 0.28)";
  } else if (isInProgress) {
    bgColor = "#d97706"; // Amber for In Progress
    haloRgbaOuter = "rgba(217, 119, 6, 0.16)";
    haloRgbaInner = "rgba(217, 119, 6, 0.28)";
  } else if (isOverdue) {
    bgColor = "#dc2626"; // Crimson Red for Overdue
    haloRgbaOuter = "rgba(220, 38, 38, 0.18)";
    haloRgbaInner = "rgba(220, 38, 38, 0.30)";
  } else if (category === "SUBSIDENCE") {
    bgColor = "#d97706";
  }

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
            background: ${haloRgbaOuter};
            pointer-events: none;
          "></div>
          <div style="
            position: absolute;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: ${haloRgbaInner};
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
              <circle cx="17" cy="14" r="5.5" fill="#ffffff"/>
              ${
                isCompleted || isVerified
                  ? `<path d="M14.5 14L16.3 15.8L19.8 12.3" stroke="${bgColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
                  : `<path d="M17 12V14.5" stroke="${bgColor}" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="17" r="1" fill="${bgColor}"/>`
              }
            </svg>
          </div>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 46],
    });
  }

  // Regular non-selected pin
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
        ${
          (isOverdue || isLiveCitizenReport) && !isCompleted
            ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${bgColor}; opacity: 0.38; animation: ping 1.6s infinite;"></span>`
            : ""
        }
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
          ${
            isCompleted || isVerified
              ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
              : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
          }
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

// Click anywhere on map to detect jurisdiction & responsible official + track zoom level
function MapClickHandler({ onMapClick, onZoomChange, onViewportChange }) {
  const map = useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
    zoomend() {
      const z = map.getZoom();
      if (onZoomChange) {
        onZoomChange(z);
      }
      if (onViewportChange) {
        const c = map.getCenter();
        onViewportChange({ center: [c.lat, c.lng], zoom: z });
      }
    },
    moveend() {
      if (onViewportChange) {
        const c = map.getCenter();
        onViewportChange({ center: [c.lat, c.lng], zoom: map.getZoom() });
      }
    },
  });
  return null;
}

export default function MapInner({
  roads,
  liveViewportRoads = [],
  reports,
  selectedRoad,
  selectedReport,
  detectedPoint,
  onSelectRoad,
  onSelectReport,
  onMapClick,
  onReportAtPoint,
  onViewportChange,
  showReportsLayer = true,
  showSigiNationalWms = false,
  showSigiRegionalWms = false,
  mapCenter,
  mapZoom = 11.5,
  onMapReady,
}) {
  const [currentZoom, setCurrentZoom] = useState(mapZoom);

  // Urutkan layer agar Jalan Provinsi, Kabupaten, Kota, dan Desa selalu di-render di atas Jalan Nasional
  const sortedRoads = useMemo(() => {
    const rank = { NASIONAL: 1, PROVINSI: 2, KABUPATEN: 3, KOTA_KAB: 3, KOTA: 4, DESA: 5 };
    const seen = new Set();
    const combined = [];
    for (const r of [...roads, ...(liveViewportRoads || [])]) {
      if (r && r.id && !seen.has(r.id)) {
        seen.add(r.id);
        combined.push(r);
      }
    }
    return combined.sort((a, b) => {
      if (selectedRoad?.id === a.id) return 1;
      if (selectedRoad?.id === b.id) return -1;
      return (rank[a.authority] || 1) - (rank[b.authority] || 1);
    });
  }, [roads, liveViewportRoads, selectedRoad?.id]);

  return (
    <MapContainer
      center={mapCenter || [3.5952, 98.6722]}
      zoom={mapZoom}
      zoomControl={false}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    >
      <MapController center={mapCenter} zoom={mapZoom} onMapReady={onMapReady} />
      <MapClickHandler
        onMapClick={onMapClick}
        onZoomChange={setCurrentZoom}
        onViewportChange={onViewportChange}
      />

      {/* CartoDB Positron / OSM Clean Light Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Official Pusdatin Kementerian PU (SIGI ASTV2) WMS Layer: 3.306 Ruas Jalan Nasional */}
      {showSigiNationalWms && (
        <WMSTileLayer
          url="https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_nasional.map"
          layers="jalan_nasional"
          format="image/png"
          transparent={true}
          version="1.3.0"
          opacity={0.88}
        />
      )}

      {/* Official Pusdatin Kementerian PU (SIGI ASTV2) WMS Layer: Jaringan Jalan Daerah */}
      {showSigiRegionalWms && (
        <WMSTileLayer
          url="https://sigi.pu.go.id/cgi-bin/mapserv?map=/etc/mapserver/jalan_daerah.map"
          layers="jalan_daerah"
          format="image/png"
          transparent={true}
          version="1.3.0"
          opacity={0.82}
        />
      )}

      {/* Road Segment Polylines */}
      {sortedRoads.map((road) => {
        // Distinct, high-contrast, user-friendly palette matching the platform design (5-Tier UU 2/2022)
        let color = "#0d9488"; // Kota: Ocean Teal
        let hoverColor = "#0f766e";
        let badgeBg = "bg-teal-50 text-teal-800 border-teal-200";
        let popupBtnBg = "bg-teal-600 hover:bg-teal-700";

        if (road.authority === "NASIONAL") {
          color = "#2563eb"; // Nasional: Royal Blue (KemenPU)
          hoverColor = "#1d4ed8";
          badgeBg = "bg-blue-50 text-blue-800 border-blue-200";
          popupBtnBg = "bg-blue-600 hover:bg-blue-700";
        } else if (road.authority === "PROVINSI") {
          color = "#9333ea"; // Provinsi: Royal Purple (Bina Marga Pemprov)
          hoverColor = "#7e22ce";
          badgeBg = "bg-purple-50 text-purple-800 border-purple-200";
          popupBtnBg = "bg-purple-600 hover:bg-purple-700";
        } else if (road.authority === "KABUPATEN") {
          color = "#059669"; // Kabupaten: Deep Emerald (Dinas PUPR Pemkab)
          hoverColor = "#047857";
          badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
          popupBtnBg = "bg-emerald-600 hover:bg-emerald-700";
        } else if (road.authority === "KOTA") {
          color = "#0d9488"; // Kota: Ocean Teal (Dinas PU Pemkot)
          hoverColor = "#0f766e";
          badgeBg = "bg-teal-50 text-teal-800 border-teal-200";
          popupBtnBg = "bg-teal-600 hover:bg-teal-700";
        } else if (road.authority === "DESA") {
          color = "#d97706"; // Desa: Warm Amber-Gold (Dana Desa / Pemdes UU 6/2014)
          hoverColor = "#b45309";
          badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
          popupBtnBg = "bg-amber-600 hover:bg-amber-700";
        }

        const isSelected = selectedRoad?.id === road.id;
        const isRegionalOrLocal = road.authority !== "NASIONAL";
        const polylinePositions = getPolylinePositions(road.coordinates);

        return (
          <React.Fragment key={road.id}>
            {/* Click hit area expander */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: "transparent",
                weight: 20,
                opacity: 0,
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            />

            {/* Subtle white contrast casing for Provincial, Kabupaten & Kota roads so they pop against National lines */}
            {!isSelected && isRegionalOrLocal && (
              <Polyline
                positions={polylinePositions}
                pathOptions={{
                  color: "#ffffff",
                  weight: 7,
                  opacity: 0.85,
                  lineCap: "round",
                  lineJoin: "round",
                }}
                interactive={false}
              />
            )}

            {/* Selected High-Contrast Glow / Outline Casing */}
            {isSelected && (
              <>
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{
                    color: "#ea580c",
                    weight: 10,
                    opacity: 0.35,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 8,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </>
            )}

            {/* Visual polyline - clean continuous solid line without disjointed dashes */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: color,
                weight: isSelected ? 5.5 : isRegionalOrLocal ? 4.8 : 4.2,
                opacity: isSelected ? 1 : 0.92,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{
                click: () => onSelectRoad(road),
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs p-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span
                      className="w-3 h-1.5 rounded-[2px] shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <span>{road.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${badgeBg}`}>
                      {road.authority}
                    </span>
                    <span>• {road.district || road.provinceName} • {road.lengthKm} KM</span>
                  </div>
                  {road.leadership?.regionalHead && (
                    <div className="text-[9.5px] text-slate-600 font-semibold mt-1">
                      PIC: {road.leadership.regionalHead}
                    </div>
                  )}
                </div>
              </Tooltip>

              <Popup className="jagajalan-leaflet-popup">
                <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold border ${badgeBg}`}>
                      {road.authority}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-slate-400 font-bold">{road.code}</span>
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
                        <span className="text-orange-700 font-mono tabular-nums font-black">
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

                  <div className="space-y-1">
                    {onReportAtPoint && (
                      <button
                        onClick={() =>
                          onReportAtPoint({
                            coordinates: road.center,
                            roadSegmentId: road.id,
                            streetName: road.name,
                            district: road.district,
                            authority: road.authority,
                            authorityLabel: road.authorityLabel,
                            legalBasis: road.legalBasis,
                            leadership: road.leadership,
                            budget: road.budget,
                            source: "GIS_ROAD_POPUP",
                          })
                        }
                        className="w-full py-1.5 px-2 rounded-[6px] text-[10px] font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] text-center transition-colors cursor-pointer block"
                      >
                        Laporkan Kerusakan di Ruas Ini →
                      </button>
                    )}
                    <button
                      onClick={() => onSelectRoad(road)}
                      className="w-full py-1 px-2 rounded-[6px] text-[9.5px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center transition-colors cursor-pointer block"
                    >
                      Buka Detail Lengkap di Panel
                    </button>
                  </div>
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        );
      })}

      {/* Citizen Report Markers (Real-Time GIS Layer) */}
      {showReportsLayer &&
        reports.map((report) => {
          if (!Array.isArray(report.coordinates) || report.coordinates.length < 2) return null;
          const isOverdue = report.status === "OVERDUE" || Boolean(report.isResponseOverdue);
          const isCompleted = report.status === "SELESAI";
          const isVerified = report.status === "TERVERIFIKASI";
          const isInProgress = report.status === "DALAM_PENGERJAAN";
          const isSelected = selectedReport?.id === report.id;
          const icon = createReportIcon(
            report.damageCategory,
            isOverdue,
            isSelected,
            Boolean(report.isLiveCitizenReport),
            report.status
          );

          const statusPillText = isCompleted
            ? "✓ Selesai Diperbaiki"
            : isInProgress
            ? "⚒ Dalam Perbaikan Dinas"
            : isVerified
            ? "✓ Verifikasi Diterima Dinas"
            : isOverdue
            ? "⚠ Melewati Tenggat Respons"
            : "⏳ Menunggu Verifikasi";

          const statusPillClass = isCompleted
            ? "bg-emerald-100 text-emerald-800"
            : isInProgress
            ? "bg-orange-100 text-orange-800"
            : isVerified
            ? "bg-blue-100 text-blue-800"
            : isOverdue
            ? "bg-rose-100 text-rose-800"
            : "bg-amber-100 text-amber-800";

          return (
            <Marker
              key={`${report.id}-${report.status || "OPEN"}`}
              position={report.coordinates}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : report.isLiveCitizenReport ? 400 : 1}
              eventHandlers={{
                click: () => onSelectReport(report),
              }}
            >
              <Tooltip sticky>
                <div className="font-sans text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono tabular-nums">{report.ticketCode}</span>
                    <span>• {report.roadName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${statusPillClass}`}>
                      {statusPillText}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {report.categoryLabel} • Indeks Bahaya: <span className="font-mono tabular-nums font-bold">{report.hazardScore}/100</span>
                  </div>
                </div>
              </Tooltip>

              <Popup className="jagajalan-leaflet-popup">
                <div className="p-1 space-y-2 font-sans max-w-[260px] text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 gap-1.5">
                    <span className="font-mono tabular-nums text-[9px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded-[4px]">
                      {report.ticketCode}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] ${statusPillClass}`}>
                      {statusPillText}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">{report.roadName}</h4>
                    <p className="text-[10px] text-slate-500">{report.address}</p>
                    <p className="text-[9.5px] font-mono tabular-nums text-slate-400 mt-0.5">
                      GIS: {Number(report.coordinates[0]).toFixed(5)}, {Number(report.coordinates[1]).toFixed(5)}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-[5px] border border-orange-200/50 text-[10px] space-y-1">
                    <div className="font-semibold text-slate-800 flex justify-between">
                      <span>Kategori:</span>
                      <span className="font-bold text-orange-700">{report.categoryLabel}</span>
                    </div>
                    <div className="font-semibold text-slate-800 flex justify-between">
                      <span>Indeks Bahaya:</span>
                      <span className="font-mono tabular-nums font-bold text-rose-600">{report.hazardScore}/100 ({report.hazardLevel})</span>
                    </div>
                  </div>

                  {report.updates?.[0]?.note && (
                    <div className="text-[9.5px] text-slate-700 bg-emerald-50/80 p-1.5 rounded-[5px] border border-emerald-200/70">
                      <span className="font-bold text-emerald-900">Tindak Lanjut Dinas: </span>
                      <span>{report.updates[0].note}</span>
                    </div>
                  )}

                  {report.matchingBudget && (
                    <div className="text-[9px] text-slate-600 bg-orange-50/60 p-1.5 rounded-[5px] border border-orange-100">
                      <span className="font-bold text-orange-900">Proyek Terhubung: </span>
                      {report.matchingBudget.packageName || report.matchingBudget.name} (Rp {((report.matchingBudget.paguRp || 0) / 1000000000).toFixed(1)} M)
                    </div>
                  )}

                  <div className="text-[8.5px] text-slate-400 border-t border-slate-100 pt-1">
                    Dasar Hukum: {report.legalBasis}
                  </div>

                  <button
                    onClick={() => onSelectReport(report)}
                    className="w-full py-1.5 px-2 rounded-[6px] text-[10px] font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] text-center transition-colors cursor-pointer block"
                  >
                    Buka Detail Aduan di Panel →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Key Milestone Boundary Points along Highways (Shown on selected road or when zoomed in >= 8 to prevent cluttering city/provincial layers) */}
      {roads.map((road) => {
        if (!road.milestones || road.milestones.length === 0) return null;
        const isRoadSelected = selectedRoad?.id === road.id;
        if (!isRoadSelected && currentZoom < 8) return null;

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
                    <span className="bg-[#c2410c] text-white text-[9px] px-1 py-0.2 rounded-[4px] font-sans tabular-nums font-bold">KM {ms.km}</span>
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
                    <span className="font-sans tabular-nums text-[9px] font-bold text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded-[4px]">
                      PATOK KM {ms.km}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{ms.status}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{ms.name}</h4>
                    <p className="text-[10px] text-slate-500">{road.name}</p>
                    <p className="text-[9px] text-slate-600 mt-1 italic">"{ms.note}"</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-[5px] border border-orange-200/50 text-[9px] space-y-0.5">
                    <div className="text-slate-500">Penanggung Jawab:</div>
                    <div className="font-bold text-slate-800">{road.leadership?.regionalHead}</div>
                    <div className="text-slate-600">{road.leadership?.agency}</div>
                  </div>
                  <button
                    onClick={() => onSelectRoad(road)}
                    className="w-full py-1.5 px-2 rounded-[6px] text-[10px] font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] text-center transition-colors cursor-pointer block"
                  >
                    Buka Detail Koridor Nasional →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        });
      })}

      {/* Detected Location Click Marker & Live Snapped Street Polyline */}
      {detectedPoint && detectedPoint.streetGeometry && detectedPoint.streetGeometry.length >= 2 && (
        <>
          <Polyline
            positions={detectedPoint.streetGeometry}
            pathOptions={{
              color: "#ffffff",
              weight: 10,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
            interactive={false}
          />
          <Polyline
            positions={detectedPoint.streetGeometry}
            pathOptions={{
              color: "#ea580c",
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {detectedPoint && detectedPoint.coordinates && (
        <Marker
          position={detectedPoint.coordinates}
          icon={createDetectedLocationIcon()}
          zIndexOffset={2000}
        >
          <Tooltip permanent direction="top" offset={[0, -18]}>
            <div className="font-sans text-xs bg-[#c2410c] text-white px-2.5 py-1 rounded-[6px] shadow-lg font-bold">
              🎯 {detectedPoint.streetName || `Titik Terdeteksi: ${detectedPoint.provinceName}`}
            </div>
          </Tooltip>
          <Popup className="jagajalan-leaflet-popup" autoPan>
            <div className="p-1 space-y-2 font-sans max-w-[270px] text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="font-bold text-[9px] text-orange-800 bg-orange-100 px-1.5 py-0.5 rounded-[4px]">
                  {detectedPoint.roadClassLabel || "DETEKSI GEOSPASIAL"}
                </span>
                <span className="text-[9px] font-sans tabular-nums font-bold text-slate-400">
                  {detectedPoint.coordinates[0].toFixed(4)}, {detectedPoint.coordinates[1].toFixed(4)}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">
                  {detectedPoint.streetName || `${detectedPoint.provinceName} (${detectedPoint.island})`}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{detectedPoint.district}</p>
                <p className="text-[10px] text-teal-700 font-bold mt-0.5">{detectedPoint.authorityLabel}</p>
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
                <div>
                  <span className="text-slate-500">Dasar Hukum: </span>
                  <span className="font-medium text-slate-700">{detectedPoint.legalBasis}</span>
                </div>
              </div>
              {onReportAtPoint && (
                <button
                  onClick={() => onReportAtPoint(detectedPoint)}
                  className="w-full py-1.5 px-2.5 rounded-[6px] text-[10.5px] font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] text-center transition-colors cursor-pointer block shadow-2xs"
                >
                  Laporkan Kerusakan di Titik Ini →
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
