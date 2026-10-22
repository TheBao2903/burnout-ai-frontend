// ==========================================
// Dashboard Service - User Dashboard API calls
// ==========================================

import api from './api';

// Types for User Dashboard Analytics
export interface UserDashboardAnalytics {
  user_id: string;

  // Overview stats
  total_assessments: number;
  completed_assessments: number;
  assessment_completion_rate: number;
  assessments_this_month: number;

  // Burnout stats
  total_burnout_analyses: number;
  avg_burnout_score: number | null;
  current_risk_level: string | null;
  current_trend: string;
  burnout_trend: { date: string; count: number }[];

  // Emotion stats
  total_emotion_analyses: number;
  avg_confidence: number | null;
  emotion_distribution: Record<string, number>;
  emotions_this_month: number;
  emotions_trend: { date: string; count: number }[];

  // Activity stats
  login_count: number;
  last_login: string | null;
  login_trend: { date: string; count: number }[];

  // Assessment trends
  assessments_trend: { date: string; count: number }[];

  // AI Quality metrics
  unknown_emotion_count: number;
  unknown_rate: number;
  success_rate: number;

  // Recent history
  recent_assessments: {
    id: string;
    status: string;
    created_at: string | null;
    completed_at: string | null;
  }[];
  recent_emotions: {
    id: string;
    dominant_emotion: string;
    confidence: number;
    created_at: string | null;
  }[];
}

// ==========================================
// Burnout Analytics Types
// ==========================================

export interface BurnoutFactor {
  key: string;
  label: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface BurnoutWarning {
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  factor?: string;
  current_value?: number;
  previous_value?: number;
  change?: number;
}

export interface BurnoutTrendItem {
  date: string;
  analyzed_at: string | null;
  score: number | null;
  risk_level: string | null;
}

export interface BurnoutCurrent {
  burnout_score: number;
  risk_level: string;
  trend: string;
  analyzed_at: string | null;
  confidence: number;
  data_completeness: number;
}

export interface BurnoutRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  target_factor?: string;
}

export interface BurnoutSummary {
  primary_factor?: string;
  secondary_factor?: string;
  ai_summary?: string;
  key_observations: string[];
  recommendations: BurnoutRecommendation[];
}

export interface StaCoreItem {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical' | string;
  trend: 'increasing' | 'decreasing' | 'stable' | string;
  label: string;
}

export interface StaCore {
  exhaustion: StaCoreItem;
  disengagement: StaCoreItem;
}

export interface StaOverloadReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface StaContext {
  job_demands: {
    score: number | null;
    level: string | null;
    label: string;
  };
  recovery: {
    avg_sleep_hours: number | null;
    avg_recovery_score: number | null;
    status: 'good' | 'moderate' | 'poor' | string;
  };
  overload_stats: {
    overload_count: number;
    total_checkins: number;
    top_reasons: StaOverloadReason[];
    other_reasons: string[];
  };
  work_changes: {
    total_overtime_hours: number | null;
    overtime_days: number;
  };
}

export interface StaTrendItem {
  date: string;
  analyzed_at: string | null;
  exhaustion: number | null;
  disengagement: number | null;
  job_demands: number | null;
  recovery_score: number | null;
  sleep_hours: number | null;
  quick_overload: number | null;
}

export interface ContextInsight {
  summary: string;
  key_observations: string[];
  suggested_action: string;
  reflection_question: string;
  source: 'ai' | 'rules';
  reason: string | null;
  model: string | null;
  generated_at: string;
  from_cache: boolean;
  window: { start_date: string; end_date: string; timezone: string; calendar_days: number };
  coverage: { daily_days: number; daily_complete_core_days: number; selected_calendar_days: number; olbi_records: number; environment_records: number; facial_records: number; chat_messages: number; analyzed_chat_messages: number; source_status: Record<string, string> };
  data_sufficiency: string;
  limitations: string[];
  last_observation_at: string | null;
}

export interface SynthesizedInsight {
  summary: string;
  key_observations: string[];
}

export interface BurnoutAnalytics {
  user_id: string;
  current: BurnoutCurrent | null;
  factors: BurnoutFactor[];
  total_contribution: number | null;
  burnout_trend: BurnoutTrendItem[];
  warnings: BurnoutWarning[];
  summary: BurnoutSummary | null;
  stats: {
    total_analyses: number;
    analyses_in_range: number;
    avg_score: number | null;
    score_change: number | null;
    days_analyzed: number;
  };
  data_completeness: number;
  available_factors: string[];
  missing_factors: string[];
  sta_core?: StaCore | null;
  sta_context?: StaContext | null;
  sta_trend?: StaTrendItem[];
  synthesized_insight?: SynthesizedInsight | null;
}

export interface OlbiHistoryPoint {
  id: string;
  assessment_id: string | null;
  sequence: number;
  completed_at: string;
  timestamp: number;
  exhaustion: number;
  disengagement: number;
  change_from_previous: Record<'exhaustion' | 'disengagement', number | null>;
}

export interface DashboardDateRange { start_date: string; end_date: string; }

export interface OlbiProgressData {
  start_date: string | null;
  end_date: string | null;
  period_days: number | null;
  scale_max: 4;
  total_records: number;
  visible_records: number;
  excluded_records: number;
  points: OlbiHistoryPoint[];
  baseline_at: string | null;
  latest_at: string | null;
  next_due_at: string | null;
  comparisons: Record<'exhaustion' | 'disengagement', {
    baseline: number | null;
    latest: number | null;
    change_from_baseline: number | null;
    change_from_previous: number | null;
  }>;
  direction: 'decreasing' | 'increasing' | 'unchanged' | 'mixed' | 'insufficient_data';
  summary: string;
}

export const dashboardService = {
  async getContextInsight(range: DashboardDateRange, signal?: AbortSignal): Promise<ContextInsight> {
    const response = await api.get<ContextInsight>('/api/v1/dashboard/context-insight', { params: range, signal });
    return response.data;
  },
  async getOlbiHistory(range: DashboardDateRange, signal?: AbortSignal): Promise<OlbiProgressData> {
    const response = await api.get<OlbiProgressData>('/api/v1/dashboard/olbi-history', {
      params: range, signal,
    });
    return response.data;
  },
  /**
   * Get user dashboard analytics
   */
  async getAnalytics(range?: DashboardDateRange, signal?: AbortSignal): Promise<UserDashboardAnalytics> {
    const response = await api.get<UserDashboardAnalytics>('/api/v1/dashboard/analytics', { params: range, signal });
    return response.data;
  },

  /**
   * Get user dashboard overview
   */
  async getOverview(): Promise<Record<string, unknown>> {
    const response = await api.get('/api/v1/dashboard/overview');
    return response.data;
  },

  /**
   * Get user burnout history
   */
  async getBurnoutHistory(limit: number = 30): Promise<Record<string, unknown>> {
    const response = await api.get('/api/v1/dashboard/burnout-history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get user emotion history
   */
  async getEmotionHistory(limit: number = 30): Promise<Record<string, unknown>> {
    const response = await api.get('/api/v1/dashboard/emotion-history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get burnout analytics - NEW endpoint with full burnout data
   */
  async getBurnoutAnalytics(days: number = 30, userId?: string, range?: DashboardDateRange, signal?: AbortSignal): Promise<BurnoutAnalytics> {
    const response = await api.get<BurnoutAnalytics>('/api/v1/dashboard/burnout-analytics', {
      params: {
        ...(range || { days }),
        ...(userId ? { user_id: userId } : {}),
      }, signal,
    });
    return response.data;
  },
};

export default dashboardService;
