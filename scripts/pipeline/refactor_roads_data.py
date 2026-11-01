import re

with open("src/data/roadsData.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract INDONESIA_REGIONS onwards
regions_match = re.search(r"(// Definisi Wilayah & Pulau di Seluruh Indonesia[\s\S]*)", content)
if not regions_match:
    print("Could not find INDONESIA_REGIONS!")
    exit(1)

regions_code = regions_match.group(1).strip()

new_roads_data_content = f"""// Data Ruas Jalan Terverifikasi JagaJalan
// Wilayah Fokus: SUMATERA UTARA (Fokus Pilot) & 20 KORIDOR ARTERI JALAN NASIONAL BERGEOMETRI PRESISI
// Terintegrasi dengan Kepala Daerah / Pejabat Penanggung Jawab, Data LPSE, dan SIGI PU

import sumutRoads from "./sumutRoadsData.json";
import nationalHighways from "./nationalHighwaysData.json";

// 1. Data Koridor Ruas Percontohan Sumatera Utara (Medan, Simalungun, Karo, Asahan)
export const SUMATERA_UTARA_ROADS = sumutRoads;

// 2. Data 20 Koridor Arteri Jalan Nasional Seluruh Indonesia (SK MenPUPR No. 1688/2022)
export const NATIONAL_HIGHWAYS_INDONESIA = nationalHighways;

// 3. Gabungan Seluruh Ruas Terdata JagaJalan
export const ALL_ROADS = [
  ...SUMATERA_UTARA_ROADS,
  ...NATIONAL_HIGHWAYS_INDONESIA,
];

// Default Active Segments: ALL_ROADS
export const ROAD_SEGMENTS = ALL_ROADS;

{regions_code}
"""

with open("src/data/roadsData.js", "w", encoding="utf-8") as f:
    f.write(new_roads_data_content)

with open("src/data/roadsData.js", "r", encoding="utf-8") as f:
    lines = len(f.readlines())

print(f"Refactor complete! roadsData.js dropped from 107,759 lines down to: {lines} lines!")
