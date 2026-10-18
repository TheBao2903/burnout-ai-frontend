// ==========================================
// Survey Service - API calls cho survey
// ==========================================

import api, { apiLongTimeout } from './api';
import type {
  SurveyData,
  Place,
  PlacesResponse,
  GeocodeResult,
  AnalysisResult,
  HistoryItem,
  HistoryResponse,
  RollingStats,
  AlertsResponse,
} from '../types/survey';

// ==========================================
// Service
// ==========================================

export const surveyService = {
  /**
   * Geocode address to coordinates
   */
  async geocode(address: string): Promise<GeocodeResult> {
    const response = await api.post<GeocodeResult>('/api/survey/geocode', { address });
    return response.data;
  },

  /**
   * Analyze survey data (SurveyAnalysisService - standalone, quick check)
   * NOTE: Đây là quick survey-only analysis, KHÔNG dùng cho full assessment
   *       Để có full burnout analysis, dùng /api/v1/assessments/{id}/analyze
   */
  async analyze(data: SurveyData): Promise<AnalysisResult> {
    const response = await apiLongTimeout.post<AnalysisResult>('/api/survey/analyze', data);
    return response.data;
  },

  /**
   * Get place recommendations based on analysis result
   * NOTE: Đây là place search, KHÔNG phải recommendation từ BurnoutEngine
   */
  async getRecommendations(params: {
    analysis_result: AnalysisResult;
    latitude: number;
    longitude: number;
    radius_meters?: number;
    limit?: number;
    address?: string;
  }): Promise<PlacesResponse> {
    const response = await apiLongTimeout.post<PlacesResponse>('/api/survey/recommendations', {
      analysis_result: params.analysis_result,
      latitude: params.latitude,
      longitude: params.longitude,
      radius_meters: params.radius_meters ?? 3000,
      limit: params.limit ?? 10,
      address: params.address,
    });
    return response.data;
  },

  /**
   * Search nearby places (legacy - uses stress_level directly)
   */
  async searchPlaces(params: {
    latitude: number;
    longitude: number;
    stress_level: number;
    radius_meters?: number;
    limit?: number;
  }): Promise<PlacesResponse> {
    const response = await api.post<PlacesResponse>('/api/survey/places', params);
    return response.data;
  },

  /**
   * Get survey history
   */
  async getHistory(): Promise<HistoryItem[]> {
    const response = await api.get<HistoryItem[]>('/api/survey/history');
    return response.data || [];
  },

  /**
   * Get rolling stats
   */
  async getRollingStats(days: number = 7): Promise<RollingStats> {
    const response = await api.get(`/api/survey/rolling-stats`, { params: { days } });
    return response.data;
  },

  /**
   * Get alerts
   */
  async getAlerts(): Promise<AlertsResponse> {
    const response = await api.get(`/api/survey/alerts`);
    return response.data;
  },

  /**
   * Save survey result to backend
   *
   * CLEAN ARCHITECTURE:
   * - Survey CHỈ lưu raw answers
   * - KHÔNG gửi analysis_result (thuộc BurnoutResult)
   * - KHÔNG gửi recommendations (thuộc Recommendation Engine)
   *
   * Để có full burnout analysis, sau khi save cần gọi:
   * POST /api/v1/assessments/{assessmentId}/analyze
   */
  async saveSurvey(data: SurveyData): Promise<void> {
    // Generate assessment_id
    const assessmentId = `survey_${Date.now()}`;
    await apiLongTimeout.post(`/api/v1/assessments/${assessmentId}/survey`, data);
  },

  /**
   * Run full burnout analysis for an assessment
   *
   * ĐÂY LÀ ENDPOINT CHÍNH THỨC cho burnout analysis
   * - Load tất cả data (emotion, survey, chat, history)
   * - Chạy BurnoutEngine
   * - Chạy RecommendationEngine
   * - Lưu vào burnout_results
   */
  async runBurnoutAnalysis(assessmentId: string): Promise<unknown> {
    const response = await api.post(`/api/v1/assessments/${assessmentId}/analyze`);
    return response.data;
  },

  /**
   * Get burnout result for an assessment
   */
  async getBurnoutResult(assessmentId: string): Promise<unknown> {
    const response = await api.get(`/api/v1/assessments/${assessmentId}/result`);
    return response.data;
  },

  /**
   * Get survey questions
   */
  async getQuestions(): Promise<unknown[]> {
    const response = await api.get<unknown[]>('/api/survey/questions');
    return response.data;
  },
};

export type { SurveyData, Place, PlacesResponse, GeocodeResult, AnalysisResult, HistoryItem, HistoryResponse };

export default surveyService;
