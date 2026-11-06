"use client";

import React, { useEffect, useState } from "react";

export default function SerpentineRoadBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes globalHighwayFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -192;
          }
        }
        .animate-global-road {
          animation: globalHighwayFlow 18s linear infinite;
        }
        .animate-global-road-slow {
          animation: globalHighwayFlow 28s linear infinite;
        }
      `}</style>

      {/* Parallax SVG Container that subtly shifts with scroll */}
      <div
        className="w-full h-full will-change-transform transition-transform duration-75 ease-out"
        style={{ transform: `translateY(${scrollY * 0.04}px)` }}
      >
        <svg
          viewBox="0 0 1440 2600"
          fill="none"
          preserveAspectRatio="xMidYMin slice"
          className="w-full h-full"
        >
          <defs>
            {/* Warm Asphalt Surface Gradient */}
            <linearGradient id="globalRoadSurface" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.02" />
              <stop offset="35%" stopColor="#ea580c" stopOpacity="0.045" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.025" />
            </linearGradient>

            {/* Glowing Shoulder Stroke Gradient */}
            <linearGradient id="globalShoulderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.12" />
              <stop offset="30%" stopColor="#d97706" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#c2410c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.14" />
            </linearGradient>
          </defs>

          {/* 1. OUTER CONTOUR TOPOGRAPHY GUIDES (Geospatial Survey Lines) */}
          <path
            d="M 1080,-50 C 980,350 240,480 200,850 C 160,1220 1260,1320 1200,1720 C 1140,2080 340,2180 420,2650"
            stroke="#d97706"
            strokeWidth="1.25"
            strokeDasharray="6 14"
            strokeOpacity="0.08"
          />
          <path
            d="M 820,-50 C 720,350 -20,480 -60,850 C -100,1220 1000,1320 940,1720 C 880,2080 80,2180 160,2650"
            stroke="#d97706"
            strokeWidth="1"
            strokeDasharray="4 12"
            strokeOpacity="0.06"
          />

          {/* 2. ASPHALT ROAD BED (Wide Ribbon) */}
          <path
            d="M 960,-50 C 860,350 360,480 320,850 C 280,1220 1140,1320 1080,1720 C 1020,2080 460,2180 540,2650"
            stroke="url(#globalRoadSurface)"
            strokeWidth="96"
            strokeLinecap="round"
          />

          {/* 3. LEFT ROAD SHOULDER */}
          <path
            d="M 912,-50 C 812,350 312,480 272,850 C 232,1220 1092,1320 1032,1720 C 972,2080 412,2180 492,2650"
            stroke="url(#globalShoulderGrad)"
            strokeWidth="1.75"
          />

          {/* 4. RIGHT ROAD SHOULDER */}
          <path
            d="M 1008,-50 C 908,350 408,480 368,850 C 328,1220 1188,1320 1128,1720 C 1068,2080 508,2180 588,2650"
            stroke="url(#globalShoulderGrad)"
            strokeWidth="1.75"
          />

          {/* 5. INNER LEFT LANE GUIDE (Slow Dash Flow) */}
          <path
            d="M 936,-50 C 836,350 336,480 296,850 C 256,1220 1116,1320 1056,1720 C 996,2080 436,2180 516,2650"
            stroke="#d97706"
            strokeWidth="1.25"
            strokeDasharray="8 26"
            strokeOpacity="0.14"
            className="animate-global-road-slow"
          />

          {/* 6. CENTER HIGHWAY DIVIDING LINE (Animated Continuous Flow) */}
          <path
            d="M 960,-50 C 860,350 360,480 320,850 C 280,1220 1140,1320 1080,1720 C 1020,2080 460,2180 540,2650"
            stroke="#c2410c"
            strokeWidth="2.5"
            strokeDasharray="16 22"
            strokeOpacity="0.28"
            strokeLinecap="round"
            className="animate-global-road"
          />

          {/* 7. INNER RIGHT LANE GUIDE (Slow Dash Flow) */}
          <path
            d="M 984,-50 C 884,350 384,480 344,850 C 304,1220 1164,1320 1104,1720 C 1044,2080 484,2180 564,2650"
            stroke="#d97706"
            strokeWidth="1.25"
            strokeDasharray="8 26"
            strokeOpacity="0.14"
            className="animate-global-road-slow"
          />

          {/* 8. SCATTERED KILOMETER WAYPOINT TICKS (Highway milestones) */}
          <circle cx="960" cy="80" r="3" fill="#ea580c" fillOpacity="0.3" />
          <circle cx="560" cy="460" r="3" fill="#ea580c" fillOpacity="0.3" />
          <circle cx="320" cy="850" r="3.5" fill="#c2410c" fillOpacity="0.35" />
          <circle cx="700" cy="1260" r="3" fill="#ea580c" fillOpacity="0.3" />
          <circle cx="1080" cy="1720" r="3.5" fill="#c2410c" fillOpacity="0.35" />
          <circle cx="740" cy="2140" r="3" fill="#ea580c" fillOpacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
