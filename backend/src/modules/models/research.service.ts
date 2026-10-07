import {
  getCustomerScoresMap,
  getModelMetricsArtifacts,
  getPaperFigures,
  getResearchResults,
  getTableIvPostCleaning,
} from "@/lib/ml-artifacts";

export const researchService = {
  getResults() {
    return getResearchResults();
  },

  getModelMetrics() {
    return getModelMetricsArtifacts();
  },

  getCustomerScores(limit = 100) {
    return Array.from(getCustomerScoresMap().values()).slice(0, limit);
  },

  getPaperFigures() {
    return getPaperFigures();
  },

  getTableIv() {
    return getTableIvPostCleaning();
  },
};
