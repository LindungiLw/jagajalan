"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle2, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";

export default function CivicInspectionRig() {
  // Severity slider state: 0.15 (mild) to 0.95 (critical)
  const [severity, setSeverity] = useState(0.65);
  const [activePreset, setActivePreset] = useState("sedang");

  // Real physical/technical parameters derived from the model
  const diameterCm = Math.round(15 + severity * 70); // 25 cm - 85 cm
  const depthCm = Math.round(3 + severity * 19);     // 4 cm - 22 cm
  const pciScore = Math.min(98, Math.round(20 + severity * 78)); // Pavement Condition Index (risk)

  // Authority & SLA calculation based on official road classification logic
  const isCritical = pciScore >= 80;
  const isWarning = pciScore >= 50 && pciScore < 80;

  const authority = severity > 0.75 
    ? { title: "Dinas Bina Marga Sumut / Inpres APBN", level: "Nasional / Prov", tag: "Intervensi IJD", color: "text-blue-700 bg-blue-50 border-blue-200" }
    : { title: "Dinas SDABMBK Kota Medan", level: "Jalan Kota", tag: "APBD 2026", color: "text-teal-700 bg-teal-50 border-teal-200" };

  const slaDays = isCritical ? 7 : 14;

  const handleSelectPreset = (presetKey, val) => {
    setActivePreset(presetKey);
    setSeverity(val);
  };

  // Isometric 30-degree projection helper: [x, y, z] in mm/units -> [screenX, screenY]
  // Center is [320, 240] inside a 640x440 viewBox
  const rad = Math.PI / 6;
  const cos30 = Math.cos(rad);
  const sin30 = Math.sin(rad);

  const iso = (x, y, z) => {
    const sx = 320 + (x - y) * cos30;
    const sy = 250 + (x + y) * sin30 - z;
    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
  };

  const isoPt = (x, y, z) => {
    const sx = 320 + (x - y) * cos30;
    const sy = 250 + (x + y) * sin30 - z;
    return [sx, sy];
  };

  // Needle angle for the Dial Indicator: 0% -> -120deg, 100% -> +120deg
  const needleAngle = -120 + severity * 240;

  // Pothole radius on surface:
  const potholeRx = 20 + severity * 35;
  const potholeRy = 11 + severity * 19;
  const potholeDepth = 4 + severity * 18;

  return (
    <div className="bg-[#FAF7F2] rounded-[8px] ring-1 ring-orange-200/60 p-4 sm:p-6 space-y-4 font-sans text-slate-900 shadow-xs">
      
      {/* Anatomy Framed Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-200/50 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-orange-700 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-[4px] tracking-tight">
            Fig 1 · Model Inspeksi
          </span>
          <span className="text-xs font-semibold text-slate-800">
            Civic Verification Test-Rig
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <Cpu className="w-3.5 h-3.5 text-orange-600" />
          <span>Audit Geometri &amp; Respon Fisik Sistem</span>
        </div>
      </div>

      {/* Main Isometric Machine SVG Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[440px] bg-gradient-to-b from-stone-50/80 to-stone-100/60 rounded-[6px] border border-stone-200/70 overflow-hidden flex items-center justify-center shadow-inner">
        
        <svg
          viewBox="0 0 640 440"
          className="w-full h-full select-none"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            {/* Soft Ambient Halo Shadow underneath the Machine Base */}
            <radialGradient id="rigHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Asphalt Texture Pattern */}
            <pattern id="asphaltSpecks" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#334155" />
              <circle cx="2" cy="2" r="0.6" fill="#1e293b" />
              <circle cx="6" cy="5" r="0.8" fill="#475569" />
              <circle cx="3" cy="7" r="0.5" fill="#0f172a" />
            </pattern>

            {/* Water Puddle Gradient */}
            <linearGradient id="puddleWater" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.95" />
            </linearGradient>

            {/* Laser Scan Shader Line */}
            <linearGradient id="laserBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* 1. SOFT HALO (Under Base Plate) */}
          <ellipse cx="320" cy="335" rx="230" ry="60" fill="url(#rigHalo)" />

          {/* 2. BASE FEET (4 Corner Feet) */}
          {[
            [-145, -70],
            [145, -70],
            [-145, 70],
            [145, 70],
          ].map(([fx, fy], idx) => {
            const pBase = isoPt(fx, fy, -16);
            const pTop = isoPt(fx, fy, -8);
            return (
              <g key={`foot-${idx}`}>
                <ellipse cx={pBase[0]} cy={pBase[1]} rx="9" ry="5" fill="#a8a29e" stroke="#78716c" strokeWidth="0.6" />
                <path
                  d={`M ${pBase[0] - 9} ${pBase[1]} L ${pTop[0] - 8} ${pTop[1]} A 8 4 0 0 0 ${pTop[0] + 8} ${pTop[1]} L ${pBase[0] + 9} ${pBase[1]} Z`}
                  fill="#d6d3d1"
                  stroke="#78716c"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}

          {/* 3. HEAVY GRANITE/STEEL BASE SLAB */}
          {/* Base bottom side (front-left and front-right) */}
          {/* Front-left side: x=-160 to 160, y=85, z=-8 to 0 */}
          <path
            d={`M ${iso(-160, 85, -8)} L ${iso(160, 85, -8)} L ${iso(160, 85, 0)} L ${iso(-160, 85, 0)} Z`}
            fill="#d6d3d1"
            stroke="#a8a29e"
            strokeWidth="0.6"
          />
          {/* Front-left side face */}
          <path
            d={`M ${iso(-160, -85, -8)} L ${iso(-160, 85, -8)} L ${iso(-160, 85, 0)} L ${iso(-160, -85, 0)} Z`}
            fill="#b8b2a8"
            stroke="#928b80"
            strokeWidth="0.6"
          />
          {/* Base Top Surface (z = 0) */}
          <path
            d={`M ${iso(-160, -85, 0)} L ${iso(160, -85, 0)} L ${iso(160, 85, 0)} L ${iso(-160, 85, 0)} Z`}
            fill="#f5f5f4"
            stroke="#d6d3d1"
            strokeWidth="0.8"
          />

          {/* Inset Base Precision Groove */}
          <path
            d={`M ${iso(-152, -78, 0.2)} L ${iso(152, -78, 0.2)} L ${iso(152, 78, 0.2)} L ${iso(-152, 78, 0.2)} Z`}
            fill="none"
            stroke="#d6d3d1"
            strokeWidth="0.8"
          />

          {/* Corner Screw Dots on Base */}
          {[
            [-150, -76],
            [150, -76],
            [-150, 76],
            [150, 76],
          ].map(([sx, sy], idx) => {
            const pt = isoPt(sx, sy, 0.5);
            return (
              <g key={`screw-${idx}`}>
                <circle cx={pt[0]} cy={pt[1]} r="1.6" fill="#e7e5e4" stroke="#78716c" strokeWidth="0.4" />
                <circle cx={pt[0]} cy={pt[1]} r="0.6" fill="#57534e" />
              </g>
            );
          })}

          {/* Laser-Etched Front Ruler Strip (z = 0.5) */}
          <path
            d={`M ${iso(-120, 72, 0.4)} L ${iso(120, 72, 0.4)} L ${iso(120, 77, 0.4)} L ${iso(-120, 77, 0.4)} Z`}
            fill="#e7e5e4"
            stroke="#a8a29e"
            strokeWidth="0.5"
          />
          {/* Ruler Millimeter Ticks */}
          {[-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100].map((tx, idx) => (
            <line
              key={`tick-${idx}`}
              x1={isoPt(tx, 72, 0.5)[0]}
              y1={isoPt(tx, 72, 0.5)[1]}
              x2={isoPt(tx, 75, 0.5)[0]}
              y2={isoPt(tx, 75, 0.5)[1]}
              stroke="#57534e"
              strokeWidth={idx % 2 === 0 ? "0.8" : "0.5"}
            />
          ))}

          {/* Engraved Machine Label Plate */}
          <path
            d={`M ${iso(-145, 20, 0.4)} L ${iso(-145, 55, 0.4)} L ${iso(-135, 55, 0.4)} L ${iso(-135, 20, 0.4)} Z`}
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="0.5"
          />

          {/* 4. ASPHALT ROAD SPECIMEN BLOCK (z = 0 to 24) */}
          {/* Aggregate Base Layer Front (z: 0 to 12) */}
          <path
            d={`M ${iso(-110, 45, 0)} L ${iso(110, 45, 0)} L ${iso(110, 45, 12)} L ${iso(-110, 45, 12)} Z`}
            fill="#94a3b8"
            stroke="#64748b"
            strokeWidth="0.6"
          />
          {/* Aggregate Left Face */}
          <path
            d={`M ${iso(-110, -45, 0)} L ${iso(-110, 45, 0)} L ${iso(-110, 45, 12)} L ${iso(-110, -45, 12)} Z`}
            fill="#7e8c9f"
            stroke="#64748b"
            strokeWidth="0.6"
          />

          {/* Asphalt Wearing Course Front (z: 12 to 24) */}
          <path
            d={`M ${iso(-110, 45, 12)} L ${iso(110, 45, 12)} L ${iso(110, 45, 24)} L ${iso(-110, 45, 24)} Z`}
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="0.6"
          />
          {/* Asphalt Wearing Course Left Face */}
          <path
            d={`M ${iso(-110, -45, 12)} L ${iso(-110, 45, 12)} L ${iso(-110, 45, 24)} L ${iso(-110, -45, 24)} Z`}
            fill="#0f172a"
            stroke="#020617"
            strokeWidth="0.6"
          />

          {/* Asphalt Top Surface (AC-WC) with Center Pothole Cutout */}
          <path
            d={`M ${iso(-110, -45, 24)} L ${iso(110, -45, 24)} L ${iso(110, 45, 24)} L ${iso(-110, 45, 24)} Z`}
            fill="url(#asphaltSpecks)"
            stroke="#1e293b"
            strokeWidth="0.8"
          />

          {/* White Lane Marking Stripe on Asphalt Surface */}
          <path
            d={`M ${iso(-110, -2, 24.2)} L ${iso(-60, -2, 24.2)} L ${iso(-60, 2, 24.2)} L ${iso(-110, 2, 24.2)} Z`}
            fill="#f8fafc"
            opacity="0.85"
          />
          <path
            d={`M ${iso(60, -2, 24.2)} L ${iso(110, -2, 24.2)} L ${iso(110, 2, 24.2)} L ${iso(60, 2, 24.2)} Z`}
            fill="#f8fafc"
            opacity="0.85"
          />

          {/* THE POTHOLE CAVITY (Depression in Asphalt) */}
          {/* Outer Cavity Perimeter */}
          <g transform={`translate(${isoPt(0, 0, 24.5)[0]}, ${isoPt(0, 0, 24.5)[1]})`}>
            {/* Crater Wall Shading */}
            <ellipse cx="0" cy="0" rx={potholeRx} ry={potholeRy} fill="#090d16" stroke="#ea580c" strokeWidth="0.8" strokeDasharray="3,2" />
            
            {/* Pothole Floor Depression (shifted down) */}
            <ellipse
              cx="0"
              cy={potholeDepth * 0.9}
              rx={potholeRx * 0.75}
              ry={potholeRy * 0.7}
              fill={severity > 0.3 ? "url(#puddleWater)" : "#18181b"}
              stroke="#0f172a"
              strokeWidth="0.6"
            />

            {/* Water Reflection Ripples if water present */}
            {severity > 0.3 && (
              <path
                d={`M ${-potholeRx * 0.4} ${potholeDepth * 0.85} Q 0 ${potholeDepth * 0.75} ${potholeRx * 0.3} ${potholeDepth * 0.9}`}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="0.8"
                opacity="0.7"
              />
            )}
          </g>

          {/* 5. TWIN VERTICAL CHROME GANTRY POSTS */}
          {/* Left Column */}
          <path
            d={`M ${iso(-120, -5, 0)} L ${iso(-115, -5, 0)} L ${iso(-115, -5, 120)} L ${iso(-120, -5, 120)} Z`}
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="0.6"
          />
          {/* Right Column */}
          <path
            d={`M ${iso(115, -5, 0)} L ${iso(120, -5, 0)} L ${iso(120, -5, 120)} L ${iso(115, -5, 120)} Z`}
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="0.6"
          />

          {/* 6. DUAL HORIZONTAL STAINLESS GUIDE RAILS */}
          {/* Lower Rail (z = 96) */}
          <path
            d={`M ${iso(-120, -4, 96)} L ${iso(120, -4, 96)} L ${iso(120, 0, 96)} L ${iso(-120, 0, 96)} Z`}
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />
          {/* Upper Rail (z = 108) */}
          <path
            d={`M ${iso(-120, -4, 108)} L ${iso(120, -4, 108)} L ${iso(120, 0, 108)} L ${iso(-120, 0, 108)} Z`}
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />

          {/* 7. SLIDING AI OPTICAL CARRIAGE & SENSOR HEAD (Centered at x = 0) */}
          {/* Carriage Solid Body (z = 90 to 118) */}
          <path
            d={`M ${iso(-28, -14, 92)} L ${iso(28, -14, 92)} L ${iso(28, 14, 92)} L ${iso(-28, 14, 92)} Z`}
            fill="#f8fafc"
            stroke="#64748b"
            strokeWidth="0.8"
          />
          <path
            d={`M ${iso(-28, 14, 92)} L ${iso(28, 14, 92)} L ${iso(28, 14, 114)} L ${iso(-28, 14, 114)} Z`}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="0.8"
          />
          <path
            d={`M ${iso(28, -14, 92)} L ${iso(28, 14, 92)} L ${iso(28, 14, 114)} L ${iso(28, -14, 114)} Z`}
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="0.8"
          />

          {/* Knurled Brass Adjustment Crown on Top */}
          <ellipse
            cx={isoPt(0, 0, 118)[0]}
            cy={isoPt(0, 0, 118)[1]}
            rx="8"
            ry="4"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="0.6"
          />

          {/* Vertical Micrometer Probe Shaft (Lowers into Pothole) */}
          <line
            x1={isoPt(0, 0, 92)[0]}
            y1={isoPt(0, 0, 92)[1]}
            x2={isoPt(0, 0, 24 - potholeDepth)[0]}
            y2={isoPt(0, 0, 24 - potholeDepth)[1]}
            stroke="#c2410c"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Probe Tip Contact Bead */}
          <circle
            cx={isoPt(0, 0, 24 - potholeDepth)[0]}
            cy={isoPt(0, 0, 24 - potholeDepth)[1]}
            r="2.5"
            fill="#f97316"
            stroke="#9a3412"
            strokeWidth="0.6"
          />

          {/* AI OPTICAL SCANNER LASER CONE (Projected down onto Pothole) */}
          <polygon
            points={`
              ${isoPt(0, 0, 92)[0]},${isoPt(0, 0, 92)[1]}
              ${isoPt(-potholeRx * 0.7, 0, 24)[0]},${isoPt(-potholeRx * 0.7, 0, 24)[1]}
              ${isoPt(potholeRx * 0.7, 0, 24)[0]},${isoPt(potholeRx * 0.7, 0, 24)[1]}
            `}
            fill="url(#laserBeam)"
          />

          {/* Laser Contour Scan Lines on Ground */}
          <ellipse
            cx={isoPt(0, 0, 24.8)[0]}
            cy={isoPt(0, 0, 24.8)[1]}
            rx={potholeRx * 1.05}
            ry={potholeRy * 1.05}
            fill="none"
            stroke="#ea580c"
            strokeWidth="0.8"
            strokeDasharray="2,3"
            opacity="0.85"
          />

          {/* 8. PRECISION DIAL GAUGE (Right Bracket at x = 120, z = 75) */}
          {/* Dial Bracket Arm */}
          <path
            d={`M ${iso(116, 0, 75)} L ${iso(136, 0, 75)}`}
            stroke="#475569"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Dial Housing (Screen Space Circle for perfect clarity) */}
          <g transform={`translate(${isoPt(142, 0, 75)[0]}, ${isoPt(142, 0, 75)[1]})`}>
            {/* Outer Chrome Bezel */}
            <circle cx="0" cy="0" r="28" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
            <circle cx="0" cy="0" r="25" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

            {/* Dial Calibration Ticks (0 - 100 PCI Risk Scale) */}
            {Array.from({ length: 13 }).map((_, i) => {
              const deg = -120 + i * 20;
              const radT = (deg * Math.PI) / 180;
              const x1 = Math.cos(radT) * 22;
              const y1 = Math.sin(radT) * 22;
              const x2 = Math.cos(radT) * (i % 3 === 0 ? 17 : 19);
              const y2 = Math.sin(radT) * (i % 3 === 0 ? 17 : 19);
              return (
                <line
                  key={`dial-tick-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i > 8 ? "#dc2626" : i > 5 ? "#d97706" : "#16a34a"}
                  strokeWidth={i % 3 === 0 ? "1.2" : "0.6"}
                />
              );
            })}

            {/* Scale Label */}
            <text x="0" y="12" textAnchor="middle" fontSize="6" fontFamily="var(--font-mono)" fill="#64748b" fontWeight="bold">
              PCI RISK
            </text>

            {/* Rotating Indicator Needle */}
            <g transform={`rotate(${needleAngle})`}>
              <polygon points="-1.5,0 0,-21 1.5,0 0,4" fill="#c2410c" />
              <circle cx="0" cy="0" r="3" fill="#1e293b" />
              <circle cx="0" cy="0" r="1" fill="#ffffff" />
            </g>
          </g>

          {/* 9. JURISDICTION AUDIT BADGE (Mounted on Base Front-Right) */}
          <g transform={`translate(${isoPt(75, 42, 28)[0]}, ${isoPt(75, 42, 28)[1]})`}>
            <rect
              x="-45"
              y="-12"
              width="90"
              height="24"
              rx="4"
              fill={severity > 0.75 ? "#eff6ff" : "#f0fdfa"}
              stroke={severity > 0.75 ? "#3b82f6" : "#14b8a6"}
              strokeWidth="0.8"
            />
            <text x="0" y="-1" textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fontWeight="bold" fill={severity > 0.75 ? "#1e40af" : "#0f766e"}>
              {severity > 0.75 ? "SK: JALAN NASIONAL" : "SK: JALAN KOTA MEDAN"}
            </text>
            <text x="0" y="7" textAnchor="middle" fontSize="5.5" fontFamily="var(--font-mono)" fill="#64748b">
              {severity > 0.75 ? "SUMBER: APBN (IJD)" : "SUMBER: APBD (SDABMBK)"}
            </text>
          </g>
        </svg>

        {/* Live HUD Floating Indicators */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-[5px] border border-stone-200/80 shadow-xs flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-slate-700">
            DIAMETER: <strong className="text-slate-900">{diameterCm} cm</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-[11px] font-semibold text-slate-700">
            KEDALAMAN: <strong className="text-slate-900">{depthCm} cm</strong>
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-[5px] border border-stone-200/80 shadow-xs flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500">Skor Bahaya (PCI):</span>
          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
            isCritical ? "bg-red-100 text-red-700" : isWarning ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
          }`}>
            {pciScore} / 100
          </span>
        </div>
      </div>

      {/* Interactive Controls & Real-Time Parameter Toggles */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-[6px] border border-orange-200/40">
          
          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-600" />
              <span>Simulasi Kerusakan:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { key: "ringan", label: "Ringan (18 cm)", val: 0.2 },
                { key: "sedang", label: "Sedang (48 cm)", val: 0.55 },
                { key: "kritis", label: "Kritis (82 cm)", val: 0.88 },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p.key, p.val)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer ${
                    activePreset === p.key
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continuous Severity Slider */}
          <div className="flex items-center gap-2.5 w-full sm:w-64">
            <span className="text-[10px] font-mono text-slate-400">10cm</span>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.01"
              value={severity}
              onChange={(e) => {
                setSeverity(parseFloat(e.target.value));
                setActivePreset("custom");
              }}
              className="flex-1 accent-orange-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              title="Geser dimensi kerusakan jalan"
            />
            <span className="text-[10px] font-mono text-slate-400">90cm</span>
          </div>
        </div>

        {/* Real-time System Reaction Readout Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Metric 1: Instansi Penanggung Jawab */}
          <div className="p-2.5 rounded-[5px] bg-white border border-slate-200/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Instansi Berwenang
              </p>
              <p className="text-xs font-bold text-slate-800">
                {authority.title}
              </p>
              <span className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded border ${authority.color}`}>
                {authority.level} · {authority.tag}
              </span>
            </div>
          </div>

          {/* Metric 2: Batas Waktu Tindak Lanjut (UU 25/2009) */}
          <div className="p-2.5 rounded-[5px] bg-white border border-slate-200/80 flex items-start gap-2.5">
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isCritical ? "text-red-600" : "text-amber-500"}`} />
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Target Respons Resmi
              </p>
              <p className="text-xs font-bold text-slate-800">
                Maksimal {slaDays} Hari Kerja
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kepatuhan Standar Layanan Publik
              </p>
            </div>
          </div>

          {/* Metric 3: Eskalasi Ombudsman */}
          <div className="p-2.5 rounded-[5px] bg-white border border-slate-200/80 flex items-start gap-2.5">
            <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${isCritical ? "text-red-600" : "text-slate-400"}`} />
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Status Maladministrasi
              </p>
              <p className={`text-xs font-bold ${isCritical ? "text-red-700" : "text-slate-700"}`}>
                {isCritical ? "Siaga Draf Laporan RI" : "Pemantauan Reguler"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isCritical ? "Otomatis jika lewat SLA" : "Menunggu verifikasi lapangan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Anatomy Standard Caption & Legend */}
      <div className="pt-2 border-t border-orange-200/40 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p>
          <strong className="text-slate-700">Prinsip Kerja Mesin:</strong> Perubahan dimensi lubang fisik langsung menggerakkan jarum dial gauge, mengubah kalkulasi skor risiko, dan menentukan apakah perbaikan masuk anggaran APBD kota atau bantuan fiskal Inpres APBN.
        </p>
        <span className="text-[10px] font-mono text-slate-400 shrink-0">
          Metode: Pavement Condition Index (PCI)
        </span>
      </div>

    </div>
  );
}

