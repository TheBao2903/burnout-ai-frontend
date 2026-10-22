// ==========================================
// Survey Types - Backend API Types
// ==========================================

// Rolling Stats types
export interface DimensionStats {
  current: number | null;
  average: number | null;
  trend: 'increasing' | 'decreasing' | 'stable';
  values: number[];
}

export interface RollingStats {
  user_id: string;
  period_days: number;
  total_surveys: number;
  dimensions: {
    exhaustion: DimensionStats;
    disengagement: DimensionStats;
    job_demands: DimensionStats;
    recovery: DimensionStats;
    sleep: DimensionStats;
  };
  overall_trend: 'increasing' | 'decreasing' | 'stable';
  computed_at: string;
}

// Alert types
export interface AlertItem {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  consecutive_days: number;
  details: Record<string, number>;
}

export interface AlertsResponse {
  alerts: AlertItem[];
  has_critical: boolean;
}

export interface DailyCheckinData {
  // OLBI Exhaustion (1-5)
  exhaustion: {
    e1: number;
    e2: number;
    e3: number;
  };
  // OLBI Disengagement (1-5)
  disengagement: {
    d1: number;
    d2: number;
    d3: number;
  };
  // JD-R Job Demands (1-5)
  job_demands: {
    jd1: number;
    jd2: number;
    jd3: number;
  };
  // Recovery
  sleep_hours: number;
  recovery_score: number; // 1-5
  // Quick Overload
  quick_overload: number; // 1-5
  overload_reasons: string[];
  other_overload_reason?: string;
  
  // Baseline info from profile (pre-filled)
  standard_working_hours?: number;
  work_days_per_week?: number;
  average_overtime?: number;
  job_title?: string;
}

export interface QuestionnaireScores {
  means: Record<string, number>;
  levels: Record<string, 'low' | 'medium' | 'high'>;
  scale_max: number;
  risk_score: number;
  risk_level: string;
  scoring_version: string;
}

export interface SurveyData {
  survey_type?: 'daily_checkin' | 'olbi_periodic';
  questionnaire_version?: string;
  questionnaire_scores?: QuestionnaireScores;
  sleep_hours?: number;
  working_hours?: number;
  overtime_hours?: number;
  has_deadline?: string;
  work_days_per_week?: number;
  stress_level?: number;
  motivation_level?: number;
  consecutive_work_days?: number;
  rest_days?: number;
  work_satisfaction?: number;
  heart_rate?: number;

  // STA Structured Fields (e3, d2, d3, jd3 optional for v3.0 backward compat)
  exhaustion?: {
    e1: number;
    e2: number;
    e3?: number;
    [key: string]: number | undefined;
  };
  disengagement?: {
    d1: number;
    d2?: number;
    d3?: number;
    [key: string]: number | undefined;
  };
  job_demands?: {
    jd1: number;
    jd2: number;
    jd3?: number;
  };
  recovery_score?: number;
  quick_overload?: number;
  overload_reasons?: string[];
  other_overload_reason?: string;
  has_overtime_today?: boolean;
  overtime_hours_today?: number;
  current_deadline_pressure?: string;
  quick_overload_data?: Record<string, unknown>;
  recovery?: Record<string, unknown>;
  work_changes?: Record<string, unknown>;
}

// ==========================================
// Analysis Types (from SurveyAnalysisService - standalone)
// ==========================================

export interface AnalysisFactor {
  code: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

export interface AnalysisRecommendation {
  code: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  severity: string;
}

export interface AIInsightUI {
  current_state_text: string;
  change_text: string;
  contributing_factors_text: string;
  reflection_question: string;
  suggested_chat_prompt: string;
}

export interface AnalysisResult {
  questionnaire_scores?: QuestionnaireScores;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  factors: AnalysisFactor[];
  recommendations: AnalysisRecommendation[];
  analysis_version: string;
  ai_insight?: AIInsightUI;
}

// ==========================================
// Burnout Result Types (from BurnoutEngine)
// ==========================================

export interface BurnoutFactor {
  factor: string;
  score: number;
  weight: number;
  contribution: number;
  details?: Record<string, unknown>;
}

export interface BurnoutInsight {
  primary_factor?: string;
  secondary_factor?: string;
  key_observations?: string[];
  summary: string;
  data_completeness: number;
  evidence_coverage: number;
  available_factors: string[];
  missing_factors: string[];
}

export interface BurnoutRecommendation {
  id?: string;
  type: 'behavior' | 'place' | 'professional_support' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason?: string;
  action?: string;
  target_factor?: string;
  // Place-specific
  place_id?: string;
  name?: string;
  category?: string;
  distance_meters?: number;
  metadata?: Record<string, unknown>;
}

export interface BurnoutResult {
  id: string;
  assessment_id: string;
  user_id: string;
  engine_version: string;
  burnout_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | 'insufficient_data';
  confidence: number;
  data_completeness: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  factors: BurnoutFactor[];
  insight: BurnoutInsight;
  recommendations: BurnoutRecommendation[];
  disclaimer: string;
  analyzed_at: string;
  created_at: string;
}

// ==========================================
// Place Types
// ==========================================

export interface Place {
  place_id: string;
  name: string;
  category?: string;
  categories?: string[];
  reason?: string;
  address?: string;
  distance?: number;
  opening_hours?: string;
  phone?: string;
  website?: string;
  rating?: number;
}

export interface PlacesResponse {
  places: Place[];
  count: number;
  searched_location: { latitude: number; longitude: number };
  address?: string;
  message: string;
}

// ==========================================
// Geocode
// ==========================================

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  success: boolean;
  message: string;
}

// ==========================================
// History Types
// ==========================================

export interface HistoryItem {
  id: string;
  assessment_id?: string;
  user_id?: string;
  type?: string;
  created_at: string;
  completed_at?: string;
  status?: string;
  summary?: string;
  risk_level?: string;
  survey?: SurveyData;  // FIX: Đúng field từ API
  // Server-computed snapshot for displaying saved questionnaire results.
  analysis_result?: AnalysisResult;
  recommendations?: never;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
}

// ==========================================
// UI Display Types (for rendering)
// ==========================================

export interface RecommendationDisplay {
  place_id: string;
  type: string;
  name: string;
  address: string;
  distance: string;
  description: string;
  opening_hours?: string;
  phone?: string;
  website?: string;
  categories?: string[];
}

// Survey History Item - CÓ cả raw survey data VÀ analysis_result từ backend
export interface HistorySurveyItem {
  id: string;
  assessment_id: string;
  user_id: string;
  survey: SurveyData;
  status: 'in_progress' | 'completed';
  completed_at?: string;
  created_at: string;
  // Analysis result từ backend - chứa factors, recommendations, risk_level, summary
  analysis_result?: {
    risk_score: number;
    risk_level: string;
    summary: string;
    factors: Array<{
      code: string;
      score: number;
      severity: string;
      title: string;
      description: string;
    }>;
    recommendations: Array<{
      code: string;
      title: string;
      description: string;
      priority: string;
      severity: string;
    }>;
    analysis_version?: string;
  };
}

export interface AnalysisResultUI {
  questionnaire_scores?: QuestionnaireScores;
  risk_score: number;
  risk_level: string;
  summary: string;
  factors: AnalysisFactor[];
  recommendations: AnalysisRecommendation[];
  suggestions?: string[];
  ai_insight?: AIInsightUI;
}
