import urllib.request
import json
import time
import math

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
    # p1, p2 are [lat, lng]
    # OSRM expects lon,lat;lon,lat
    lon1, lat1 = p1[1], p1[0]
    lon2, lat2 = p2[1], p2[0]
    url = f"https://router.project-osrm.org/route/v1/driving/{lon1:.6f},{lat1:.6f};{lon2:.6f},{lat2:.6f}?overview=full&geometries=geojson"
    req = urllib.request.Request(url, headers={"User-Agent": "JagaJalan-NationalHighways/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                raw = [[c[1], c[0]] for c in data["routes"][0]["geometry"]["coordinates"]]
                # simplify to preserve curve without blowing up size
                return ramer_douglas_peucker(raw, epsilon=0.0008)
    except Exception as e:
        print(f"OSRM leg fail ({lat1},{lon1} -> {lat2},{lon2}): {e}")
    return [p1, p2]

# Test with Bali Gilimanuk to Denpasar
test_p1 = [-8.1633, 114.4372]
test_p2 = [-8.6705, 115.2126]
res = fetch_osrm_leg(test_p1, test_p2)
print(f"Test Gilimanuk -> Denpasar points: {len(res)}")
