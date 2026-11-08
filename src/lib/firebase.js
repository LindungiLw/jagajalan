import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const COMPOSITE_INDEX_DEFINITIONS = [
  {
    collection: "reports",
    fields: ["authority ASC", "status ASC", "reportDate DESC"],
    purpose: "Query laporan warga per wewenang dinas dan status SLA secara terindeks O(log N)",
  },
  {
    collection: "reports",
    fields: ["roadSegmentId ASC", "reportDate DESC"],
    purpose: "Agregasi laporan warga pada koridor ruas jalan spesifik tanpa full-collection scan",
  },
  {
    collection: "reports",
    fields: ["spatialCellId ASC", "hazardScore DESC"],
    purpose: "Pemetaan viewport GIS berbasis grid geospasial (Bounding-Box Spatial Partitioning)",
  },
  {
    collection: "roads",
    fields: ["provinceId ASC", "authority ASC"],
    purpose: "Pemuatan ruas jalan tersegmen per provinsi dan yurisdiksi penyelenggara jalan",
  },
];

export const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return (
    typeof apiKey === "string" &&
    apiKey.trim() !== "" &&
    !apiKey.includes("ExampleApiKey") &&
    typeof projectId === "string" &&
    projectId.trim() !== "" &&
    !projectId.includes("example")
  );
};

let app = null;
let db = null;
let storage = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Inisialisasi Firebase dilewati:", error.message);
  }
}

export function computeSpatialCellId(lat, lng, precisionDeg = 0.5) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return "CELL_UNKNOWN";
  const latBucket = Math.floor(latNum / precisionDeg);
  const lngBucket = Math.floor(lngNum / precisionDeg);
  return `GRID_${latBucket}_${lngBucket}`;
}

export function getDatabaseScalabilityMetrics() {
  return {
    engine: isFirebaseConfigured()
      ? "Cloud Firestore + In-Memory Spatial & Hash Index Cache"
      : "In-Memory Multi-Index Engine + Persistent JSON Write-Behind Store",
    indexingStrategy: "COMPOSITE_HASH_AND_SPATIAL_GRID_INDEX",
    compositeIndexes: COMPOSITE_INDEX_DEFINITIONS,
    paginationSupport: "Cursor & Offset Pagination (?page=&limit=)",
    spatialQuerySupport: "Bounding-Box Viewport Filtering (?bbox=minLng,minLat,maxLng,maxLat)",
  };
}

export { app, db, storage, auth };
