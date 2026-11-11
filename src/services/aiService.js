/**
 * JagaJalan AI Damage Detection Service
 * Connects client submissions with Google Gemini Vision AI model for automated pavement distress assessment.
 */

export const aiService = {
  /**
   * Analyze road distress evidence photo with Gemini Vision API.
   * @param {string} imageBase64 - Base64 encoded image string
   * @param {Object} metadata - Context metadata (roadName, authority, etc.)
   */
  async analyzeRoadImage(imageBase64, metadata = {}) {
    try {
      const roadContext =
        typeof metadata === "string"
          ? metadata
          : metadata.roadName || metadata.roadContext || "Jalan Publik Daerah";

      const res = await fetch("/api/analyze-road", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          image: imageBase64,
          roadContext,
          metadata,
        }),
      });

      if (!res.ok) {
        let errMessage = `API analysis error: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      return await res.json();
    } catch (err) {
      console.error("AI road analysis failure:", err);
      // Fallback heuristics if API is offline
      return {
        success: false,
        hazardScore: 75,
        damageType: "LUBANG_SEDANG",
        severityLevel: "SEDANG",
        safetyImpact: "Potensi kecelakaan bagi pengendara roda dua terutama saat hujan.",
        isFallback: true,
        error: err.message,
      };
    }
  },
};

export default aiService;
