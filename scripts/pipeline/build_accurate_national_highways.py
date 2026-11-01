import urllib.request
import json
import time
import math
import os

def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def point_line_distance(point, start, end):
    if start == end:
        return distance(point, start)
    n = abs((end[1] - start[1]) * point[0] - (end[0] - start[0]) * point[1] + end[0] * start[1] - end[1] * start[0])
    d = math.sqrt((end[1] - start[1])**2 + (end[0] - start[0])**2)
    return n / d

def ramer_douglas_peucker(points, epsilon=0.0008):
    if len(points) < 3:
        return points
    dmax = 0.0
    index = 0
    for i in range(1, len(points) - 1):
        d = point_line_distance(points[i], points[0], points[-1])
        if d > dmax:
            index = i
            dmax = d
    if dmax > epsilon:
        rec1 = ramer_douglas_peucker(points[:index+1], epsilon)
        rec2 = ramer_douglas_peucker(points[index:], epsilon)
        return rec1[:-1] + rec2
    else:
        return [points[0], points[-1]]

def fetch_osrm_leg(p1, p2):
    lon1, lat1 = p1[1], p1[0]
    lon2, lat2 = p2[1], p2[0]
    url = f"https://router.project-osrm.org/route/v1/driving/{lon1:.6f},{lat1:.6f};{lon2:.6f},{lat2:.6f}?overview=full&geometries=geojson"
    req = urllib.request.Request(url, headers={"User-Agent": "JagaJalan-NationalHighways/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=9) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                raw = [[round(c[1], 5), round(c[0], 5)] for c in data["routes"][0]["geometry"]["coordinates"]]
                return ramer_douglas_peucker(raw, epsilon=0.0008)
    except Exception as e:
        print(f"  OSRM leg notice ({lat1:.3f},{lon1:.3f} -> {lat2:.3f},{lon2:.3f}): {e}")
    return [p1, p2]

# Load existing national highways
with open("national_highways_raw.json", "r", encoding="utf-8") as f:
    highways = json.load(f)

print(f"Loaded {len(highways)} national highways to trace accurate curves...")

updated_highways = []

for h_idx, hw in enumerate(highways):
    road_id = hw["id"]
    road_name = hw["name"]
    print(f"\n[{h_idx+1}/{len(highways)}] Routing real highway curves for: {road_name} ({road_id})")

    # Use milestones or key intermediate coordinates
    waypoints = []
    if "milestones" in hw and len(hw["milestones"]) >= 2:
        waypoints = [m["coords"] for m in hw["milestones"]]
    elif "coordinates" in hw and len(hw["coordinates"]) >= 2:
        waypoints = hw["coordinates"]

    full_curve = []
    for i in range(len(waypoints) - 1):
        p1 = waypoints[i]
        p2 = waypoints[i+1]
        leg = fetch_osrm_leg(p1, p2)
        if i == 0:
            full_curve.extend(leg)
        else:
            full_curve.extend(leg[1:]) # avoid duplicate junction point
        time.sleep(0.15) # Polite throttle for OSRM public server

    # Round coordinates to 5 decimals (meter precision)
    clean_curve = [[round(c[0], 5), round(c[1], 5)] for c in full_curve]
    print(f"  -> Generated {len(clean_curve)} real road curve points (was {len(hw.get('coordinates', []))})")

    hw["coordinates"] = clean_curve
    updated_highways.append(hw)

with open("accurate_national_highways.json", "w", encoding="utf-8") as f:
    json.dump(updated_highways, f, indent=2, ensure_ascii=False)

print("\nAll national highways successfully traced with real asphalt highway curves!")
