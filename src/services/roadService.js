/**
 * JagaJalan Geospatial & Road Services
 * Service abstraction for querying road network segments, authority jurisdictional data, and GeoJSON features.
 */

import { ROAD_SEGMENTS, INDONESIA_PROVINCES, PROVINCIAL_NETWORK_STATS } from "@/data/roadsData";

export const roadService = {
  /**
   * Fetch road segments with filtering options.
   * Uses client-side API endpoint with fallback to static dataset.
   */
  async getRoads(filters = {}) {
    const { authority = "ALL", provinceId = "", region = "ALL", search = "" } = filters;

    try {
      const params = new URLSearchParams();
      if (authority !== "ALL") params.set("authority", authority);
      if (provinceId) params.set("provinceId", provinceId);
      if (region !== "ALL") params.set("region", region);
      if (search) params.set("search", search);

      const res = await fetch(`/api/roads?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      return data.data || ROAD_SEGMENTS;
    } catch (err) {
      console.warn("Falling back to local road segments:", err.message);
      return ROAD_SEGMENTS.filter((road) => {
        if (authority !== "ALL" && road.authority !== authority) return false;
        if (provinceId && road.provinceId !== provinceId) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            road.name.toLowerCase().includes(q) ||
            road.code.toLowerCase().includes(q) ||
            (road.provinceName && road.provinceName.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }
  },

  /**
   * Find a specific road segment by its unique identifier.
   */
  getRoadById(roadId) {
    return ROAD_SEGMENTS.find((r) => r.id === roadId) || null;
  },

  /**
   * Retrieve list of supported Indonesian provinces.
   */
  getProvinces() {
    return INDONESIA_PROVINCES;
  },

  /**
   * Retrieve road network statistics across 38 Indonesian provinces.
   */
  getProvincialNetworkStats() {
    return PROVINCIAL_NETWORK_STATS;
  },
};

export default roadService;
