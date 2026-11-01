with open('src/data/roadsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.rfind('export const INDONESIA_REGIONS')
regions_and_functions = text[idx:].strip()

header = '''// Data Ruas Jalan Terverifikasi JagaJalan
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

'''

final_content = header + regions_and_functions + '\n'

with open('src/data/roadsData.js', 'w', encoding='utf-8') as f:
    f.write(final_content)

with open('src/data/roadsData.js', 'r', encoding='utf-8') as f:
    lines = len(f.readlines())

print(f"Refactor SUCCESS! roadsData.js dropped from 107,759 lines down to: {lines} lines!")
