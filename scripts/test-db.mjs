/**
 * JagaJalan - Firebase Connection Diagnostic Tool
 * Memverifikasi konfigurasi .env.local dan koneksi ke Cloud Firestore.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

console.log("\n=======================================================");
console.log("🔍 JagaJalan — Firebase Connection Diagnostic Tool");
console.log("=======================================================\n");

// 1. Cek file .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envLocalPath)) {
  console.error("❌ Berkas .env.local TIDAK DITEMUKAN di root proyek!");
  console.log("   Silakan buat berkas .env.local terlebih dahulu dari template .env.example.");
  process.exit(1);
}
console.log("✅ Berkas .env.local ditemukan di:", envLocalPath);

// 2. Baca isi .env.local manual untuk memastikan nilai ter-load jika node --env-file tidak otomatis mem-parse format tertentu
const envContent = fs.readFileSync(envLocalPath, "utf-8");
const envVars = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
    // Set ke process.env jika belum ada
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

// 3. Verifikasi variabel penting
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || envVars.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || envVars.NEXT_PUBLIC_FIREBASE_APP_ID;

console.log("\n📋 Status Variabel Environment Firebase (Masked):");
console.log("- NEXT_PUBLIC_FIREBASE_PROJECT_ID    :", projectId ? `✅ Terisi (${projectId})` : "❌ KOSONG");
console.log("- NEXT_PUBLIC_FIREBASE_API_KEY       :", apiKey ? `✅ Terisi (${apiKey.substring(0, 8)}... panjang: ${apiKey.length})` : "❌ KOSONG");
console.log("- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN   :", authDomain ? `✅ Terisi (${authDomain})` : "❌ KOSONG");
console.log("- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", storageBucket ? `✅ Terisi (${storageBucket})` : "❌ KOSONG");
console.log("- NEXT_PUBLIC_FIREBASE_APP_ID        :", appId ? `✅ Terisi (${appId.substring(0, 10)}...)` : "❌ KOSONG");

// Check if still placeholder
if (apiKey && apiKey.includes("ExampleApiKey")) {
  console.warn("\n⚠️ PERINGATAN: NEXT_PUBLIC_FIREBASE_API_KEY masih menggunakan nilai contoh dari .env.example!");
}
if (projectId && projectId.includes("example")) {
  console.warn("⚠️ PERINGATAN: NEXT_PUBLIC_FIREBASE_PROJECT_ID masih menggunakan nilai contoh!");
}

if (!apiKey || !projectId) {
  console.error("\n❌ Gagal: NEXT_PUBLIC_FIREBASE_API_KEY atau NEXT_PUBLIC_FIREBASE_PROJECT_ID belum diisi.");
  console.log("   Silakan cek berkas .env.local Anda.");
  process.exit(1);
}

// 4. Inisialisasi Firebase App
console.log("\n🚀 Menginisialisasi Firebase SDK...");
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId,
};

let app;
try {
  app = initializeApp(firebaseConfig, "diagnostic-test-" + Date.now());
  console.log("✅ Inisialisasi Firebase App Client BERHASIL!");
} catch (err) {
  console.error("❌ Gagal menginisialisasi Firebase App:", err.message);
  process.exit(1);
}

// 5. Tes Koneksi ke Cloud Firestore
console.log("📡 Menguji koneksi ke Cloud Firestore database...");
const db = getFirestore(app);

async function testFirestore() {
  try {
    const testDocRef = doc(db, "_connection_test", "ping");
    
    // Coba baca dokumen test
    console.log("   Mencoba membaca dokumen uji di Firestore (`_connection_test/ping`)...");
    const docSnap = await getDoc(testDocRef);
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    console.log("   Status dokumen uji:", docSnap.exists() ? "Ditemukan" : "Belum ada (Koneksi Database Aktif & Terbuka)");

    // Coba tulis dokumen test ping
    try {
      console.log("   Mencoba menulis dokumen uji (`_connection_test/ping`)...");
      await setDoc(testDocRef, {
        lastConnectedAt: new Date().toISOString(),
        testedBy: "JagaJalan Diagnostic",
        status: "ONLINE",
      });
      console.log("✅ UJI TULIS (WRITE) KE FIRESTORE BERHASIL!");
      
      // Bersihkan dokumen uji
      await deleteDoc(testDocRef);
      console.log("✅ UJI HAPUS (CLEANUP) DOKUMEN UJI BERHASIL!");
    } catch (writeErr) {
      if (writeErr.code === "permission-denied") {
        console.log("ℹ️ Catatan Uji Tulis: Izin Tulis (Write) dibatasi oleh Firestore Security Rules.");
        console.log("   (Ini normal jika Firestore Anda menggunakan aturan mode produksi / require auth).");
      } else {
        console.warn("⚠️ Catatan Uji Tulis:", writeErr.message);
      }
    }

    console.log("\n🎉 HASIL: APLIKASI SUDAH BERHASIL TERHUBUNG KE FIREBASE FIRESTORE!\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Gagal terhubung ke Cloud Firestore!");
    console.error("   Kode Error:", err.code || "UNKNOWN");
    console.error("   Pesan Error:", err.message);

    if (err.code === "permission-denied") {
      console.log("\n💡 ANALISIS:");
      console.log("   Koneksi ke server Firebase BERHASIL, tetapi 'Firestore Security Rules' Anda");
      console.log("   menolak akses baca/tulis unauthenticated.");
      console.log("   Solusi:");
      console.log("   1. Buka Firebase Console: https://console.firebase.google.com/project/" + projectId + "/firestore/rules");
      console.log("   2. Sesuaikan aturan Security Rules untuk koleksi publik (seperti 'reports' dan 'roads').");
    } else if (err.code === "unavailable" || err.message.includes("Could not reach Cloud Firestore backend")) {
      console.log("\n💡 ANALISIS:");
      console.log("   Firestore Database mungkin belum dibuat (created) di project Firebase ini.");
      console.log("   Solusi:");
      console.log("   1. Buka Firebase Console: https://console.firebase.google.com/project/" + projectId + "/firestore");
      console.log("   2. Klik 'Create database', pilih lokasi (misal: asia-southeast2 / Jakarta), lalu klik 'Enable'.");
    } else if (err.message.includes("API key not valid") || err.code === "invalid-api-key") {
      console.log("\n💡 ANALISIS: Nilai API Key tidak valid. Mohon periksa kembali API Key di Firebase Console.");
    }

    process.exit(1);
  }
}

testFirestore();
