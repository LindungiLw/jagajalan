import json
import re

with open("accurate_national_highways.json", "r", encoding="utf-8") as f:
    accurate_highways = json.load(f)

with open("src/data/roadsData.js", "r", encoding="utf-8") as f:
    content = f.read()

# Extract SUMATERA_UTARA_ROADS
sumut_match = re.search(r"export const SUMATERA_UTARA_ROADS = \[([\s\S]*?)\];\s*", content)
if not sumut_match:
    print("Could not find SUMATERA_UTARA_ROADS!")
    exit(1)

sumut_code = sumut_match.group(0).strip()

# Extract INDONESIA_REGIONS and detectJurisdictionByCoordinates
regions_match = re.search(r"export const INDONESIA_REGIONS = \[[\s\S]*", content)
if not regions_match:
    print("Could not find INDONESIA_REGIONS!")
    exit(1)

regions_code = regions_match.group(0).strip()

accurate_json_str = json.dumps(accurate_highways, indent=2, ensure_ascii=False)

output = f"""// Data Ruas Jalan Terverifikasi JagaJalan
// Cakupan: SUMATERA UTARA (Fokus Pilot) & 20 KORIDOR ARTERI JALAN NASIONAL BERGEOMETRI PRESISI
// Terintegrasi dengan Kepala Daerah / Pejabat Penanggung Jawab, Data LPSE, dan SIGI PU

{sumut_code}

// 20 KORIDOR ARTERI JALAN NASIONAL BERGEOMETRI PRESISI (OSRM & SK Menteri PUPR No. 1688/KPTS/M/2022)
export const NATIONAL_HIGHWAYS_INDONESIA = {accurate_json_str};

// Gabungan Semua Ruas Jalan Terdata JagaJalan
export const ALL_ROADS = [
  ...SUMATERA_UTARA_ROADS,
  ...NATIONAL_HIGHWAYS_INDONESIA
];

// Default Active Segments: ALL_ROADS
export const ROAD_SEGMENTS = ALL_ROADS;

{regions_code}
"""

with open("src/data/roadsData.js", "w", encoding="utf-8") as f:
    f.write(output)

print(f"Successfully updated src/data/roadsData.js with accurate highway curves! Total highways: {len(accurate_highways)}")
