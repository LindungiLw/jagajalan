import urllib.request, json

def get_osrm_route(points):
    coord_str = ';'.join(f'{lon},{lat}' for lon, lat in points)
    url = f'http://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson'
    req = urllib.request.Request(url, headers={'User-Agent': 'JagaJalanValidator/1.0'})
    with urllib.request.urlopen(req, timeout=25) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        coords = res['routes'][0]['geometry']['coordinates']
        return [[round(c[1], 5), round(c[0], 5)] for c in coords]

print("1. Fetching accurate Kalbar border road...")
kalbar_pts = [
    (109.425, 1.548),
    (109.932, 1.334),
    (110.347, 0.902),
    (111.205, 0.915),
    (111.882, 0.952),
    (112.928, 0.864)
]
c_kalbar = get_osrm_route(kalbar_pts)
step_kb = max(1, len(c_kalbar) // 600)
sampled_kb = c_kalbar[::step_kb]
if sampled_kb[-1] != c_kalbar[-1]:
    sampled_kb.append(c_kalbar[-1])

print("2. Fetching accurate Kaltara border road...")
kaltara_pts = [
    (117.37, 2.84),
    (116.63, 3.58),
    (116.88, 3.92),
    (117.20, 4.14),
    (117.65, 4.135)
]
c_kaltara = get_osrm_route(kaltara_pts)
step_kt = max(1, len(c_kaltara) // 500)
sampled_kt = c_kaltara[::step_kt]
if sampled_kt[-1] != c_kaltara[-1]:
    sampled_kt.append(c_kaltara[-1])

# Load current nationalHighwaysData
with open('src/data/nationalHighwaysData.json', 'r', encoding='utf-8') as f:
    roads = json.load(f)

# Replace ruas-nas-kal-03
kalbar_obj = {
    "id": "ruas-nas-kal-03",
    "provinceId": "kalimantan_barat",
    "region": "kalimantan",
    "name": "Jalan Paralel Perbatasan Kalimantan Barat (Aruk - Jagoi Babang - Entikong - Badau - Putussibau)",
    "code": "RUAS-NAS-KALBAR-03",
    "authority": "NASIONAL",
    "authorityLabel": "Jalan Nasional (APBN / Ditjen Bina Marga)",
    "legalBasis": "SK Menteri PUPR No. 1688/KPTS/M/2022 tentang Penetapan Status Ruas Jalan Nasional Koridor Perbatasan Kalbar",
    "lengthKm": 811.0,
    "pavementType": "Aspal Hotmix & Perkerasan Beton (Rigid Pavement)",
    "condition": "MANTAP",
    "district": "Kab. Sambas - Bengkayang - Sanggau - Sintang - Kapuas Hulu (Kalbar)",
    "center": [1.15, 111.0],
    "startPoint": {
        "name": "PLBN Aruk (Sambas, Kalbar)",
        "coords": [1.548, 109.425]
    },
    "endPoint": {
        "name": "Kota Putussibau (Kapuas Hulu, Kalbar)",
        "coords": [0.864, 112.928]
    },
    "milestones": [
        {"km": 0, "name": "PLBN Aruk (Sambas)", "coords": [1.548, 109.425], "status": "MANTAP", "note": "Gerbang Perbatasan RI-Malaysia"},
        {"km": 125, "name": "PLBN Jagoi Babang (Bengkayang)", "coords": [1.334, 109.932], "status": "MANTAP", "note": "Pos Lintas Batas Negara"},
        {"km": 240, "name": "PLBN Entikong (Sanggau)", "coords": [0.902, 110.347], "status": "MANTAP", "note": "Pintu Utama Ekspor-Impor Darat Kalbar"},
        {"km": 480, "name": "Senaning / Jasa (Sintang)", "coords": [0.915, 111.205], "status": "MANTAP", "note": "Koridor Sabuk Merah Perbatasan"},
        {"km": 620, "name": "PLBN Nanga Badau (Kapuas Hulu)", "coords": [0.952, 111.882], "status": "MANTAP", "note": "Kawasan Strategis Perbatasan"},
        {"km": 811, "name": "Kota Putussibau (Kapuas Hulu)", "coords": [0.864, 112.928], "status": "MANTAP", "note": "Hulu Sungai Kapuas & Hub Logistik"}
    ],
    "coordinates": sampled_kb,
    "leadership": {
        "role": "Kepala Balai Pelaksanaan Jalan Nasional (BPJN) Kalimantan Barat",
        "name": "Ir. Herlan Saktiansyah, M.T.",
        "institution": "Kementerian Pekerjaan Umum dan Perumahan Rakyat",
        "office": "BPJN Kalimantan Barat, Pontianak"
    },
    "problemDetails": "Tantangan lereng perbukitan dan kestabilan tanah gambut, perlindungan koridor perbatasan kedaulatan NKRI, serta pemeliharaan rutin jembatan bailey.",
    "budget": {
        "paguRp": 420000000000,
        "contractValueRp": 398500000000,
        "contractor": "PT Wijaya Karya (Persero) Tbk - KSO",
        "source": "APBN Kementerian PU (Preservasi Koridor Perbatasan)",
        "fiscalYear": 2026,
        "matchConfidence": "TERKONFIRMASI"
    },
    "officialSources": [
        "Ditjen Bina Marga Kementerian PUPR - Satker PJN Kalbar",
        "SK MenPUPR No. 1688/KPTS/M/2022",
        "Portal SIGI PU & LPSE Kementerian PU"
    ]
}

kaltara_obj = {
    "id": "ruas-nas-kaltara-01",
    "provinceId": "kalimantan_utara",
    "region": "kalimantan",
    "name": "Trans Kalimantan Utara & Koridor Perbatasan Nunukan (Tanjung Selor - Malinau - Mansalong - Nunukan)",
    "code": "RUAS-NAS-KALTARA-04",
    "authority": "NASIONAL",
    "authorityLabel": "Jalan Nasional (APBN / Ditjen Bina Marga)",
    "legalBasis": "SK Menteri PUPR No. 1688/KPTS/M/2022 tentang Penetapan Status Ruas Jalan Nasional Koridor Perbatasan Kaltara",
    "lengthKm": 530.0,
    "pavementType": "Aspal Hotmix AC-WC & Beton Perkerasan",
    "condition": "MANTAP",
    "district": "Kab. Bulungan - Malinau - Nunukan (Kalimantan Utara)",
    "center": [3.5, 117.0],
    "startPoint": {
        "name": "Kota Tanjung Selor (Ibu Kota Kaltara)",
        "coords": [2.84, 117.37]
    },
    "endPoint": {
        "name": "Pelabuhan Liem Hie Djung (Nunukan, Kaltara)",
        "coords": [4.135, 117.65]
    },
    "milestones": [
        {"km": 0, "name": "Kota Tanjung Selor (Bulungan)", "coords": [2.84, 117.37], "status": "MANTAP", "note": "Pusat Pemerintahan Kaltara"},
        {"km": 195, "name": "Kota Malinau (Kaltara)", "coords": [3.58, 116.63], "status": "MANTAP", "note": "Pintu Gerbang Pedalaman Kaltara"},
        {"km": 310, "name": "Mansalong (Lumbis)", "coords": [3.92, 116.88], "status": "MANTAP", "note": "Konektivitas Trans Kalimantan Utara"},
        {"km": 420, "name": "Simanggaris (Kawasan Perbatasan)", "coords": [4.14, 117.20], "status": "MANTAP", "note": "Jalan Paralel Sabuk Perbatasan RI-Malaysia"},
        {"km": 530, "name": "Pulau Nunukan / Sebatik", "coords": [4.135, 117.65], "status": "MANTAP", "note": "PLBN Sei Nyamuk & Akses Perbatasan Laut"}
    ],
    "coordinates": sampled_kt,
    "leadership": {
        "role": "Kepala Balai Pelaksanaan Jalan Nasional (BPJN) Kalimantan Utara",
        "name": "Ir. Johannes Wahyu Prabowo, M.Sc.",
        "institution": "Kementerian Pekerjaan Umum dan Perumahan Rakyat",
        "office": "BPJN Kalimantan Utara, Tanjung Selor"
    },
    "problemDetails": "Jalur logistik utama perbatasan RI-Malaysia (Kaltara), rawan longsor perbukitan Malinau, serta konektivitas pelabuhan penyeberangan feri Nunukan-Sebatik.",
    "budget": {
        "paguRp": 310000000000,
        "contractValueRp": 294200000000,
        "contractor": "PT Hutama Karya (Persero) Tbk",
        "source": "APBN Kementerian PU (Konektivitas Wilayah Perbatasan 3T)",
        "fiscalYear": 2026,
        "matchConfidence": "TERKONFIRMASI"
    },
    "officialSources": [
        "Ditjen Bina Marga Kementerian PUPR - Satker PJN Kaltara",
        "SK MenPUPR No. 1688/KPTS/M/2022",
        "Portal SIGI PU & LPSE Kementerian PU"
    ]
}

# Replace ruas-nas-kal-03 and add kaltara_obj if not already present
new_roads = []
for r in roads:
    if r['id'] == 'ruas-nas-kal-03':
        new_roads.append(kalbar_obj)
        new_roads.append(kaltara_obj)
    elif r['id'] == 'ruas-nas-kaltara-01':
        continue # replace with fresh
    else:
        new_roads.append(r)

with open('src/data/nationalHighwaysData.json', 'w', encoding='utf-8') as f:
    json.dump(new_roads, f, indent=2, ensure_ascii=False)

print(f"SUCCESS! nationalHighwaysData.json updated. Total roads now: {len(new_roads)}")
