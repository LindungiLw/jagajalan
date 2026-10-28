/**
 * JagaJalan Platform - Firestore Seeder Script
 * Mengunggah seluruh koridor Jalan Nasional, Jalan Provinsi, dan Ruas Pilot ke Cloud Firestore
 * Tersegmentasi per Provinsi dan Kewenangan untuk mendukung Dynamic On-Demand Streaming.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc } from "firebase/firestore";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("🚀 JagaJalan — Cloud Firestore Roads Seeder");
console.log("=======================================================\n");

// 1. Baca .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envLocalPath)) {
  console.error("❌ .env.local tidak ditemukan.");
  process.exit(1);
}

const envContent = fs.readFileSync(envLocalPath, "utf-8");
const conf = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    const k = trimmed.slice(0, eqIdx).trim();
    let v = trimmed.slice(eqIdx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    conf[k] = v;
  }
}

const firebaseConfig = {
  apiKey: conf.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: conf.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: conf.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: conf.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: conf.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: conf.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: conf.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log(`📡 Menghubungkan ke Firebase Project: "${firebaseConfig.projectId}"...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Baca dataset
const nasHighways = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/nationalHighwaysData.json"), "utf-8"));
const prvRoads = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/provincialRoadsData.json"), "utf-8"));
const cityRoads = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/cityRegencyRoadsData.json"), "utf-8"));
const sumutRoads = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/sumutRoadsData.json"), "utf-8"));

console.log(`📊 Membaca Dataset:`);
console.log(`   - Jalan Nasional   : ${nasHighways.length} koridor`);
console.log(`   - Jalan Provinsi   : ${prvRoads.length} koridor`);
console.log(`   - Jalan Kota/Kab   : ${cityRoads.length} koridor`);
console.log(`   - Pilot Sumut      : ${sumutRoads.length} ruas`);

const allRoads = [...sumutRoads, ...nasHighways, ...prvRoads, ...cityRoads];
// Remove duplicates by ID if any
const roadMap = new Map();
for (const r of allRoads) {
  roadMap.set(r.id, r);
}
const uniqueRoads = Array.from(roadMap.values());
console.log(`   - Total Unik       : ${uniqueRoads.length} ruas\n`);

async function seed() {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const road of uniqueRoads) {
      const roadRef = doc(db, "roads", road.id);
      
      // Transform nested 2D array [[lat, lng], ...] into array of objects [{ lat, lng }, ...]
      // to comply with Firestore's document model
      const points = (road.coordinates || []).map((c) => ({
        lat: Number(c[0]),
        lng: Number(c[1]),
      }));

      // Milestones coords
      const milestones = (road.milestones || []).map((ms) => ({
        ...ms,
        coords: ms.coords ? [Number(ms.coords[0]), Number(ms.coords[1])] : null,
      }));

      const roadData = {
        ...road,
        coordinates: points,
        milestones: milestones,
        center: road.center ? [Number(road.center[0]), Number(road.center[1])] : null,
        updatedAt: new Date().toISOString(),
        cloudSynced: true,
      };

      batch.set(roadRef, roadData, { merge: true });
      count++;
    }

    console.log(`⏳ Melakukan Batch Commit ${count} dokumen ke koleksi 'roads'...`);
    await batch.commit();
    console.log(`✅ BERHASIL! ${count} ruas jalan telah disimpan di Cloud Firestore!`);

    // Tulis dokumen ringkasan metadata sistem
    const metaRef = doc(db, "metadata", "road_system");
    await writeBatch(db)
      .set(metaRef, {
        totalRoads: count,
        nationalCount: nasHighways.length,
        provincialCount: prvRoads.length,
        sumutPilotCount: sumutRoads.length,
        lastSeededAt: new Date().toISOString(),
        dataSource: "PUSDATIN SIGI Kementerian PU x SK MenPUPR 1688/2022 x SK Gubernur Se-Indonesia",
        nationalProvincialNetworkSummary: {
          totalProvincialKmIndonesia: 54544.75,
          totalNationalKmIndonesia: 47017.0,
          totalKabupatenKotaKmIndonesia: 445000.0,
          totalProvinces: 38,
        }
      })
      .commit();

    console.log(`✅ Metadata ringkasan geospasial 'metadata/road_system' berhasil diperbarui!`);
    console.log(`\n🎉 SEEDING SELESAI SEMPURNA!`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Gagal melakukan seeding:`, error);
    process.exit(1);
  }
}

seed();
