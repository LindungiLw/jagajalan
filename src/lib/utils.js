/**
 * JagaJalan Platform - Utility Functions
 * Helper functions for currency, dates, SLA counters, and formatting
 */

/**
 * Format numeric value into Indonesian Rupiah (e.g., Rp 8,45 Miliar / Rp 950 Juta)
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiahShort(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  if (amount >= 1_000_000_000_000) {
    return `Rp ${(amount / 1_000_000_000_000).toFixed(1)} Triliun`;
  }
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} Miliar`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Juta`;
  }
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}

/**
 * Format standard Indonesian full currency
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiahFull(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate business days remaining or overdue from a report date (14 business days limit)
 * @param {string} reportDateIso
 * @returns {{ isOverdue: boolean, daysRemaining: number, daysOverdue: number }}
 */
export function calculateSlaStatus(reportDateIso) {
  const reportDate = new Date(reportDateIso);
  const now = new Date();
  const diffDays = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
  
  const SLA_LIMIT = 14;
  if (diffDays > SLA_LIMIT) {
    return {
      isOverdue: true,
      daysRemaining: 0,
      daysOverdue: diffDays - SLA_LIMIT,
    };
  }

  return {
    isOverdue: false,
    daysRemaining: SLA_LIMIT - diffDays,
    daysOverdue: 0,
  };
}

/**
 * Return badge color class according to AI hazard score
 * @param {number} score (1-100)
 * @returns {string}
 */
export function getHazardScoreClass(score) {
  if (score >= 85) return "text-red-700 bg-red-50 border-red-200";
  if (score >= 70) return "text-orange-700 bg-orange-50 border-orange-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-slate-700 bg-slate-100 border-slate-200";
}
