/**
 * JagaJalan Procurement & Tender Services
 * Service abstraction for querying LPSE tenders, SIRUP procurement packages, and audit metrics.
 */

export const procurementService = {
  /**
   * Fetch procurement packages matching search/filter criteria.
   */
  async getPackages(filters = {}) {
    const { search = "", authority = "ALL", status = "ALL", limit = 50 } = filters;

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (authority !== "ALL") params.set("authority", authority);
      if (status !== "ALL") params.set("status", status);
      if (limit) params.set("limit", limit.toString());

      const res = await fetch(`/api/procurement?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      return data.packages || [];
    } catch (err) {
      console.warn("Error fetching procurement packages:", err.message);
      return [];
    }
  },

  /**
   * Calculate audit summary from a set of procurement packages.
   */
  calculateAuditMetrics(packages = []) {
    let totalPagu = 0;
    let totalContract = 0;
    let anomalyCount = 0;

    packages.forEach((pkg) => {
      const pagu = Number(pkg.paguRp) || 0;
      const contract = Number(pkg.contractValueRp) || 0;
      totalPagu += pagu;
      totalContract += contract;

      const efficiency = pagu > contract ? pagu - contract : 0;
      const efficiencyPct = pagu > 0 ? (efficiency / pagu) * 100 : 0;
      if (efficiencyPct < 1.0 || (pkg.progressPct < 50 && pkg.progressStatus === "TERLAMBAT_RESPONS")) {
        anomalyCount += 1;
      }
    });

    const totalEfficiency = totalPagu > totalContract ? totalPagu - totalContract : 0;
    const efficiencyPercent = totalPagu > 0 ? ((totalEfficiency / totalPagu) * 100).toFixed(1) : "0.0";

    return {
      totalPagu,
      totalContract,
      totalEfficiency,
      efficiencyPercent,
      anomalyCount,
      totalPackages: packages.length,
    };
  },
};

export default procurementService;
