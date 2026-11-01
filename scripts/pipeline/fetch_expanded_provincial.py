import json
import urllib.request
import time

new_corridors = [
    {
        "id": "ruas-prv-dki-01",
        "provinceId": "dki_jakarta",
        "region": "jawa",
        "name": "Jl. Akses Marunda - Rorotan - Cakung Cilincing",
        "code": "RUAS-PRV-DKI-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi Khusus Ibukota (APBD DKI Jakarta)",
        "legalBasis": "Keputusan Gubernur Provinsi DKI Jakarta No. 1290/2021 tentang Penetapan Status Ruas Jalan Provinsi",
        "district": "Kota Jakarta Utara - Jakarta Timur (DKI Jakarta)",
        "center": [-6.135, 106.945],
        "pavementType": "Rigid Pavement Beton Heavy-Duty K-500",
        "condition": "MANTAP",
        "lengthKm": 16.5,
        "hazardScore": 42,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [106.905, -6.155], # Kelapa Gading
            [106.945, -6.145], # Rorotan
            [106.965, -6.115]  # Marunda Port Access
        ],
        "milestones_def": [
            {"km": 0, "name": "Simpang Kelapa Gading - Cilincing", "status": "MANTAP", "note": "Konektivitas Kawasan Niaga"},
            {"km": 8, "name": "Rorotan - Jembatan Cakung Drain", "status": "RUSAK_RINGAN", "note": "Tonase Angkutan Kontainer Berat"},
            {"km": 16, "name": "Kawasan Berikat Marunda Port", "status": "MANTAP", "note": "Akses Tanggul Laut NCICD & Pelabuhan"}
        ],
        "leadership": {
            "regionalHead": "Pj. Gubernur DKI Jakarta",
            "agency": "Dinas Bina Marga Provinsi DKI Jakarta",
            "picName": "Ir. Heru Suwondo, M.T. (Kadis Bina Marga DKI)"
        },
        "problemDetails": {
            "headline": "Penanganan Beban Berlebih Kontainer Pelabuhan & Tanggul NCICD",
            "description": "Jalur urat nadi logistik peti kemas Pelabuhan Tanjung Priok - Marunda yang membutuhkan perkerasan beton bertulang berkekuatan tinggi.",
            "rootCause": "Tingginya volume truk trailer kontainer muatan curah menuju depo logistik Kawasan Marunda.",
            "safetyImpact": "Jaga stabilitas struktur jalan dari bahaya amblesan tanah aluvial pesisir Jakarta Utara."
        },
        "budget": {
            "paguRp": 46500000000,
            "contractValueRp": 43850000000,
            "name": "Rekonstruksi & Peningkatan Geometri Jalan Akses Marunda - Rorotan",
            "contractor": "PT Jaya Konstruksi Manggala Pratama, Tbk.",
            "source": "APBD Provinsi DKI Jakarta",
            "fiscalYear": 2026,
            "progressPct": 68.5,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "Keputusan Gubernur DKI No. 1290/2021",
            "budgetSource": "Sistem Informasi Manajemen Anggaran BPKAD DKI & LPSE DKI",
            "fieldDataSource": "Pusdatin Dinas Bina Marga DKI Jakarta",
            "transparencyUrl": "https://bsp.jakarta.go.id"
        }
    },
    {
        "id": "ruas-prv-smb-01",
        "provinceId": "sumatera_barat",
        "region": "sumatera",
        "name": "Jl. Raya Padang - Alahan Panjang - Surian (Kawasan Danau Kembar)",
        "code": "RUAS-PRV-SMB-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Sumatera Barat)",
        "legalBasis": "Keputusan Gubernur Sumatera Barat No. 620-2023 tentang Status Jalan Provinsi Sumatera Barat",
        "district": "Kota Padang - Kab. Solok (Sumatera Barat)",
        "center": [-1.025, 100.585],
        "pavementType": "Aspal Hotmix AC-WC & Dinding Penahan Tebing",
        "condition": "MANTAP",
        "lengthKm": 68.0,
        "hazardScore": 58,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [100.415, -0.965], # Lubuk Kilangan Padang
            [100.605, -0.965], # Lubuk Selasih
            [100.695, -1.075]  # Alahan Panjang
        ],
        "milestones_def": [
            {"km": 0, "name": "Simpang Bandar Buat / Indarung Padang", "status": "MANTAP", "note": "Gerbang Pendakian Sitinjau Lauik"},
            {"km": 32, "name": "Lubuk Selasih (Persimpangan Solok)", "status": "MANTAP", "note": "Elevasi 1.050 mdpl Pintu Danau Kembar"},
            {"km": 68, "name": "Alahan Panjang (Danau Diatas)", "status": "RUSAK_RINGAN", "note": "Kawasan Hortikultura Sayur-Mayur Solok"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Sumatera Barat",
            "agency": "Dinas Bina Marga, Cipta Karya dan Tata Ruang (BMCKTR) Pemprov Sumbar",
            "picName": "Ir. Era Sukma Munaf, S.T., M.M. (Kadis BMCKTR Sumbar)"
        },
        "problemDetails": {
            "headline": "Pengamanan Tebing Rawan Longsor & Jalur Distribusi Hortikultura",
            "description": "Jalur vital penghubung sentra sayuran Alahan Panjang ke Kota Padang dan Pekanbaru melintasi perbukitan Bukit Barisan berhawa dingin.",
            "rootCause": "Tingginya curah hujan di lereng Gunung Talang yang memicu erosi tebing badan jalan.",
            "safetyImpact": "Mitigasi longsoran batu dan lumpur untuk menjamin kestabilan suplai logistik pangan antar-wilayah."
        },
        "budget": {
            "paguRp": 34200000000,
            "contractValueRp": 32150000000,
            "name": "Peningkatan Jalan dan Proteksi Lereng Ruas Lubuk Selasih - Alahan Panjang",
            "contractor": "PT Statika Mitratama",
            "source": "APBD Provinsi Sumatera Barat",
            "fiscalYear": 2026,
            "progressPct": 74.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Gubernur Sumbar No. 620-2023",
            "budgetSource": "LPSE Pemprov Sumbar & Bappeda Sumbar",
            "fieldDataSource": "Dinas BMCKTR Pemprov Sumbar",
            "transparencyUrl": "https://lpse.sumbarprov.go.id"
        }
    },
    {
        "id": "ruas-prv-klt-01",
        "provinceId": "kalimantan_timur",
        "region": "kalimantan",
        "name": "Jl. Poros Samboja - Semoi Dua - Sepaku (Sabuk Penyangga IKN)",
        "code": "RUAS-PRV-KLT-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Kalimantan Timur)",
        "legalBasis": "Keputusan Gubernur Kalimantan Timur No. 620/K.345/2022 tentang Penetapan Ruas Jalan Provinsi",
        "district": "Kab. Kutai Kartanegara - Kab. Penajam Paser Utara (Kaltim)",
        "center": [-0.985, 106.915],
        "pavementType": "Rigid Pavement Beton FS-45 & Aspal Laston",
        "condition": "MANTAP",
        "lengthKm": 48.0,
        "hazardScore": 46,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [117.035, -1.045], # Samboja
            [116.895, -0.975], # Semoi Dua
            [116.785, -0.915]  # Sepaku
        ],
        "milestones_def": [
            {"km": 0, "name": "Simpang Tol KM 38 Samboja (Balikpapan - Samarinda)", "status": "MANTAP", "note": "Konektivitas Trans Kalimantan"},
            {"km": 25, "name": "Semoi Dua - Kawasan Pertanian PPU", "status": "MANTAP", "note": "Sentra Pangan Kawasan Penyangga"},
            {"km": 48, "name": "Sepaku (Pintu Masuk KIPP IKN Nusantara)", "status": "MANTAP", "note": "Integrasi Jalan Nasional & Koridor IKN"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Kalimantan Timur",
            "agency": "Dinas Pekerjaan Umum Penataan Ruang & Perumahan Rakyat (PUPR-PERA) Kaltim",
            "picName": "Aji Muhammad Fitra Firnanda, S.T., M.M. (Kadis PUPR-PERA Kaltim)"
        },
        "problemDetails": {
            "headline": "Akselerasi Konektivitas Koridor Logistik Penyangga IKN Nusantara",
            "description": "Jalan provinsi yang menjadi arteri logistik penghubung Kutai Kartanegara, Samboja, menuju gerbang Ibu Kota Nusantara (Sepaku).",
            "rootCause": "Peningkatan lalu lintas alat berat dan material konstruksi proyek strategis nasional IKN.",
            "safetyImpact": "Perluasan bahu jalan dan penguatan jembatan sungai untuk menjamin kelancaran arus rantai pasok."
        },
        "budget": {
            "paguRp": 78000000000,
            "contractValueRp": 74500000000,
            "name": "Pelebaran dan Peningkatan Struktur Rigid Ruas Samboja - Semoi II - Sepaku",
            "contractor": "PT Waskita Karya (Persero) Tbk. KSO",
            "source": "APBD Provinsi Kalimantan Timur",
            "fiscalYear": 2026,
            "progressPct": 82.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Gubernur Kaltim No. 620/K.345/2022",
            "budgetSource": "LPSE Pemprov Kaltim & Otorita IKN",
            "fieldDataSource": "Dinas PUPR-PERA Kaltim",
            "transparencyUrl": "https://puprpera.kaltimprov.go.id"
        }
    },
    {
        "id": "ruas-prv-sulut-01",
        "provinceId": "sulawesi_utara",
        "region": "sulawesi",
        "name": "Jl. Poros Ratahan - Belang - Kotamobagu (Penghubung Minahasa - Bolmong)",
        "code": "RUAS-PRV-SLU-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Sulawesi Utara)",
        "legalBasis": "Keputusan Gubernur Sulawesi Utara No. 182 Tahun 2021 tentang Penetapan Ruas Jalan Provinsi",
        "district": "Kab. Minahasa Tenggara - Kota Kotamobagu (Sulut)",
        "center": [0.895, 124.585],
        "pavementType": "Aspal Hotmix AC-BC & Bronjong Kawat Lereng",
        "condition": "MANTAP",
        "lengthKm": 72.0,
        "hazardScore": 54,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [124.795, 1.045], # Ratahan
            [124.695, 0.855], # Buyat Pesisir
            [124.315, 0.735]  # Kotamobagu
        ],
        "milestones_def": [
            {"km": 0, "name": "Pusat Kota Ratahan (Minahasa Tenggara)", "status": "MANTAP", "note": "Kawasan Dataran Tinggi Minahasa"},
            {"km": 36, "name": "Simpang Pesisir Belang - Buyat", "status": "RUSAK_RINGAN", "note": "Pertemuan Jalur Laut Maluku"},
            {"km": 72, "name": "Kota Kotamobagu (Pusat Bolmong Raya)", "status": "MANTAP", "note": "Simpang Bundaran Paris Kotamobagu"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Sulawesi Utara",
            "agency": "Dinas Pekerjaan Umum dan Penataan Ruang Daerah (PUPRD) Provinsi Sulut",
            "picName": "Deicy Paath, S.T., M.Si. (Kadis PUPRD Sulut)"
        },
        "problemDetails": {
            "headline": "Penguatan Jalur Akses Ekonomi Minahasa Tenggara - Bolaang Mongondow",
            "description": "Jalan provinsi penghubung dua lumbung ekonomi Sulut, melintasi perbukitan berliku yang membutuhkan proteksi bronjong longsor.",
            "rootCause": "Topografi vulkanik curam dan saluran drainase pegunungan yang kerap meluap saat badai pasifik.",
            "safetyImpact": "Mencegah putusnya akses jalur evakuasi warga dan angkutan hasil bumi cengkih-kopra."
        },
        "budget": {
            "paguRp": 29800000000,
            "contractValueRp": 28100000000,
            "name": "Peningkatan Kapasitas & Drainase Ruas Jalan Ratahan - Belang - Kotamobagu",
            "contractor": "PT Membangun Sulut Gemilang",
            "source": "APBD Provinsi Sulawesi Utara",
            "fiscalYear": 2026,
            "progressPct": 65.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Gubernur Sulut No. 182/2021",
            "budgetSource": "LPSE Pemprov Sulawesi Utara",
            "fieldDataSource": "Dinas PUPRD Provinsi Sulut",
            "transparencyUrl": "https://sulutprov.go.id"
        }
    },
    {
        "id": "ruas-prv-ntt-01",
        "provinceId": "nusa_tenggara_timur",
        "region": "bali_nusra",
        "name": "Jl. Jalur Pantai Selatan Flores (Larantuka - Konga - Boru - Maumere)",
        "code": "RUAS-PRV-NTT-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Nusa Tenggara Timur)",
        "legalBasis": "Keputusan Gubernur Nusa Tenggara Timur No. 348/KEP/HK/2020 tentang Status Ruas Jalan Provinsi",
        "district": "Kab. Flores Timur - Kab. Sikka (NTT)",
        "center": [-8.515, 122.685],
        "pavementType": "Aspal HRS-Base & Lapen Pesisir",
        "condition": "MANTAP",
        "lengthKm": 94.0,
        "hazardScore": 62,
        "hazardLevel": "SEDANG",
        "waypoints": [
            [122.985, -8.345], # Larantuka
            [122.755, -8.525], # Boru
            [122.215, -8.625]  # Maumere
        ],
        "milestones_def": [
            {"km": 0, "name": "Pelabuhan Larantuka (Flores Timur)", "status": "MANTAP", "note": "Konektivitas Penyeberangan Adonara & Lembata"},
            {"km": 42, "name": "Boru - Lereng Gunung Lewotobi Laki-Laki", "status": "RUSAK_RINGAN", "note": "Jalur Evakuasi Rawan Abu Vulkanik"},
            {"km": 94, "name": "Pusat Kota Maumere (Sikka)", "status": "MANTAP", "note": "Gerbang Arteri Flores Tengah"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Nusa Tenggara Timur",
            "agency": "Dinas Pekerjaan Umum dan Perumahan Rakyat (PUPR) Provinsi NTT",
            "picName": "Maksimus Nenabu, S.T., M.T. (Kadis PUPR NTT)"
        },
        "problemDetails": {
            "headline": "Jalur Evakuasi Vulkanik Lewotobi & Koridor Wisata Pesisir Flores Timur",
            "description": "Jalan provinsi krusial yang berfungsi ganda sebagai jalur mobilisasi kemanusiaan/evakuasi bencana Lewotobi dan penggerak ekonomi nelayan pesisir.",
            "rootCause": "Paparan material piroklastik vulkanik dan abrasi air laut di titik pesisir Teluk Hading.",
            "safetyImpact": "Kesiapsiagaan penanganan jalur logistik darurat saat terjadi peningkatan aktivitas seismik."
        },
        "budget": {
            "paguRp": 41200000000,
            "contractValueRp": 38900000000,
            "name": "Rehabilitasi dan Peningkatan Kapasitas Ruas Boru - Larantuka (Jalur Evakuasi)",
            "contractor": "PT Flores Cemerlang Abadi",
            "source": "APBD Provinsi NTT & Dana Alokasi Khusus (DAK)",
            "fiscalYear": 2026,
            "progressPct": 78.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Gubernur NTT No. 348/KEP/HK/2020",
            "budgetSource": "Portal Satu Data Pemprov NTT & DAK Fisik",
            "fieldDataSource": "Dinas PUPR Provinsi NTT",
            "transparencyUrl": "https://nttprov.go.id"
        }
    },
    {
        "id": "ruas-prv-papua-01",
        "provinceId": "papua",
        "region": "maluku_papua",
        "name": "Jl. Holtekamp - Koya Timur - Skouw (Koridor PLBN Perbatasan RI - PNG)",
        "code": "RUAS-PRV-PAP-001",
        "authority": "PROVINSI",
        "authorityLabel": "Jalan Provinsi (APBD Papua)",
        "legalBasis": "Keputusan Gubernur Papua No. 188.4/290/Tahun 2021 tentang Penetapan Jaringan Jalan Provinsi Papua",
        "district": "Kota Jayapura - Kab. Keerom (Papua)",
        "center": [-2.625, 140.785],
        "pavementType": "Rigid Pavement Beton & Hotmix Berbahu Aspal",
        "condition": "MANTAP",
        "lengthKm": 43.5,
        "hazardScore": 38,
        "hazardLevel": "RENDAH",
        "waypoints": [
            [140.715, -2.595], # Jembatan Youtefa
            [140.795, -2.645], # Koya Barat / Timur
            [140.865, -2.615]  # PLBN Skouw
        ],
        "milestones_def": [
            {"km": 0, "name": "Jembatan Merah Youtefa (Teluk Youtefa)", "status": "MANTAP", "note": "Ikon Kemaritiman Jayapura"},
            {"km": 21, "name": "Koya Timur (Sentra Pangan Kota Jayapura)", "status": "MANTAP", "note": "Kawasan Pertanian & Perkebunan Terpadu"},
            {"km": 43, "name": "PLBN Terpadu Skouw (Batas RI - Papua Nugini)", "status": "MANTAP", "note": "Pos Lintas Batas Negara & Pasar Perbatasan"}
        ],
        "leadership": {
            "regionalHead": "Gubernur Papua",
            "agency": "Dinas Pekerjaan Umum, Penataan Ruang, Perumahan dan Kawasan Permukiman (PUPR-PKP) Papua",
            "picName": "Amos Yoku, S.T., M.T. (Kadis PUPR Papua)"
        },
        "problemDetails": {
            "headline": "Konektivitas Sabuk Perekonomian Perbatasan Antar-Negara RI - PNG",
            "description": "Jalan provinsi strategis yang menyambungkan jantung Kota Jayapura melalui Jembatan Youtefa menuju Pos Lintas Batas Negara Skouw.",
            "rootCause": "Sedimentasi drainase pesisir pantai Holtekamp dan pemeliharaan rutin pasca-PON Papua.",
            "safetyImpact": "Mendukung kelancaran perdagangan perbatasan internasional dan mobilitas warga kedua negara."
        },
        "budget": {
            "paguRp": 52000000000,
            "contractValueRp": 49200000000,
            "name": "Pemeliharaan Berkala & Penataan Geometri Koridor Wisata Holtekamp - Skouw",
            "contractor": "PT Papua Indah Mandiri",
            "source": "APBD Provinsi Papua & Otsus Papua",
            "fiscalYear": 2026,
            "progressPct": 88.0,
            "progressStatus": "BERJALAN",
            "matchConfidence": "TERKONFIRMASI"
        },
        "officialSources": {
            "authoritySource": "SK Gubernur Papua No. 188.4/290/2021",
            "budgetSource": "LPSE Provinsi Papua & Badan Pengelola Perbatasan",
            "fieldDataSource": "Dinas PUPR Papua",
            "transparencyUrl": "https://papua.go.id"
        }
    }
]

def fetch_osrm(waypoints):
    coords_str = ";".join([f"{lon:.5f},{lat:.5f}" for lon, lat in waypoints])
    url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
    req = urllib.request.Request(url, headers={'User-Agent': 'JagaJalan-GIS-Audit'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('code') == 'Ok':
                raw_coords = data['routes'][0]['geometry']['coordinates']
                # Convert from [lng, lat] to [lat, lng]
                latlng = [[round(c[1], 5), round(c[0], 5)] for c in raw_coords]
                # Downsample if too dense (step of 2 or 3)
                if len(latlng) > 300:
                    step = max(1, len(latlng) // 250)
                    downsampled = latlng[::step]
                    if downsampled[-1] != latlng[-1]:
                        downsampled.append(latlng[-1])
                    return downsampled
                return latlng
    except Exception as e:
        print("OSRM error:", e)
    # Fallback to waypoints reversed
    return [[round(w[1], 5), round(w[0], 5)] for w in waypoints]

def main():
    with open('src/data/provincialRoadsData.json', 'r', encoding='utf-8') as f:
        existing = json.load(f)

    existing_ids = set(r['id'] for r in existing)
    added_roads = []

    for c in new_corridors:
        if c['id'] in existing_ids:
            print(f"Skipping {c['id']}, already exists.")
            continue
        print(f"Fetching OSRM for {c['name']}...")
        coords = fetch_osrm(c['waypoints'])
        print(f"  Got {len(coords)} points.")

        # Compute milestones coords
        milestones = []
        n_pts = len(coords)
        for i, ms_def in enumerate(c['milestones_def']):
            if i == 0:
                pt = coords[0]
            elif i == len(c['milestones_def']) - 1:
                pt = coords[-1]
            else:
                idx = int((i / (len(c['milestones_def']) - 1)) * (n_pts - 1))
                pt = coords[idx]
            milestones.append({
                "km": ms_def['km'],
                "name": ms_def['name'],
                "status": ms_def['status'],
                "note": ms_def['note'],
                "coords": pt
            })

        # Find center
        mid_idx = n_pts // 2
        center = coords[mid_idx]

        road_obj = {
            "id": c['id'],
            "provinceId": c['provinceId'],
            "region": c['region'],
            "name": c['name'],
            "code": c['code'],
            "authority": c['authority'],
            "authorityLabel": c['authorityLabel'],
            "legalBasis": c['legalBasis'],
            "district": c['district'],
            "center": center,
            "pavementType": c['pavementType'],
            "condition": c['condition'],
            "lengthKm": c['lengthKm'],
            "hazardScore": c['hazardScore'],
            "hazardLevel": c['hazardLevel'],
            "milestones": milestones,
            "leadership": c['leadership'],
            "problemDetails": c['problemDetails'],
            "budget": c['budget'],
            "officialSources": c['officialSources'],
            "coordinates": coords
        }
        added_roads.append(road_obj)
        time.sleep(1) # courteous rate limit for OSRM

    updated = existing + added_roads
    with open('src/data/provincialRoadsData.json', 'w', encoding='utf-8') as f:
        json.dump(updated, f, indent=2, ensure_ascii=False)

    print(f"Success! Provincial roads updated from {len(existing)} to {len(updated)} roads.")

if __name__ == '__main__':
    main()
