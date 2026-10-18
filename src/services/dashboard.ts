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
    score: number;
    level: string;
    label: string;
  };
  recovery: {
    avg_sleep_hours: number;
    avg_recovery_score: number;
    status: 'good' | 'moderate' | 'poor' | string;
  };
  overload_stats: {
    overload_count: number;
    total_checkins: number;
    top_reasons: StaOverloadReason[];
    other_reasons: string[];
  };
  work_changes: {
    total_overtime_hours: number;
    overtime_days: number;
  };
}

export interface StaTrendItem {
  date: string;
  analyzed_at: string | null;
  exhaustion: number;
  disengagement: number;
  job_demands: number;
  recovery_score: number;
  sleep_hours: number;
  quick_overload: number;
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

export const dashboardService = {
  /**
   * Get user dashboard analytics
   */
  async getAnalytics(): Promise<UserDashboardAnalytics> {
    const response = await api.get<UserDashboardAnalytics>('/api/v1/dashboard/analytics');
    return response.data;
  },

  /**
   * Get user dashboard overview
   */
  async getOverview(): Promise<any> {
    const response = await api.get('/api/v1/dashboard/overview');
    return response.data;
  },

  /**
   * Get user burnout history
   */
  async getBurnoutHistory(limit: number = 30): Promise<any> {
    const response = await api.get('/api/v1/dashboard/burnout-history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get user emotion history
   */
  async getEmotionHistory(limit: number = 30): Promise<any> {
    const response = await api.get('/api/v1/dashboard/emotion-history', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get burnout analytics - NEW endpoint with full burnout data
   */
  async getBurnoutAnalytics(days: number = 30, userId?: string): Promise<BurnoutAnalytics> {
    const response = await api.get<BurnoutAnalytics>('/api/v1/dashboard/burnout-analytics', {
      params: {
        days,
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return response.data;
  },
};

export default dashboardService;
