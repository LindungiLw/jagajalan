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
      const res = await fetch("/api/analyze-road", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          metadata,
        }),
      });

      if (!res.ok) {
        throw new Error(`API analysis error: ${res.status}`);
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
      };
    }
  },
};

export default aiService;
