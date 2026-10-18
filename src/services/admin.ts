// ==========================================
// Admin Dashboard API Service
// ==========================================

import api from './api';

// ==========================================
// Types - Basic Stats
// ==========================================

export interface UserStats {
  total: number;
  active_today: number;
  active_this_week: number;
  active_this_month: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  admin_count: number;
}

export interface AssessmentStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface EmotionStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  emotion_distribution: Record<string, number>;
  avg_confidence: number | null;
}

export interface BurnoutStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  avg_score: number | null;
  risk_distribution: Record<string, number>;
}

export interface AIUsageStats {
  total_api_calls: number;
  today_api_calls: number;
  this_week_api_calls: number;
  this_month_api_calls: number;
  failed_calls: number;
  avg_response_time_ms: number | null;
  model_usage: Record<string, number>;
}

export interface DashboardStats {
  users: UserStats;
  assessments: AssessmentStats;
  emotions: EmotionStats;
  burnout: BurnoutStats;
  ai_usage: AIUsageStats;
  timestamp: string;
}

// ==========================================
// Types - Recent Data
// ==========================================

export interface RecentUser {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string | null | undefined;
  last_login_at: string | null | undefined;
}

export interface RecentActivityItem {
  id: string;
  type: 'login' | 'register' | 'assessment' | 'emotion_capture' | 'burnout_analysis';
  user_id: string;
  username: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AIUsageItem {
  id: string;
  timestamp: string;
  model: string;
  operation: string;
  user_id: string | null;
  success: boolean;
  response_time_ms: number | null;
  tokens_used: number | null;
}

export interface DataOverview {
  collections: Record<string, {
    count: number | string;
    last_doc: string | null;
    error?: string;
  }>;
  timestamp: string;
}

// ==========================================
// Types - Analytics (Enhanced)
// ==========================================

export interface DailyTrend {
  date: string;
  count: number;
}

export interface UserAnalytics {
  // User distribution
  role_distribution: {
    admin: number;
    user: number;
  };

  // Activity trends (daily for last 30 days)
  user_activity_trend: DailyTrend[];

  // Registration trend (daily for last 30 days)
  new_users_trend: DailyTrend[];

  // Top active users
  top_active_users: {
    user_id: string;
    username: string;
    login_count: number;
    last_login: string;
  }[];

  // Inactive users count
  inactive_users: number;
  retention_rate: number; // percentage of users active in last 30 days
}

export interface AssessmentAnalytics {
  // Status distribution
  status_distribution: Record<string, number>;

  // Completion stats
  completion_rate: number; // percentage
  avg_completion_time_minutes: number | null;

  // Trends
  assessments_trend: DailyTrend[];

  // Top users by assessment count
  top_users_by_assessments: {
    user_id: string;
    username: string;
    assessment_count: number;
  }[];
}

export interface EmotionAnalytics {
  // Emotion distribution (pie chart)
  emotion_distribution: Record<string, number>;

  // Confidence stats
  avg_confidence: number | null;
  confidence_distribution: {
    high: number;  // >= 0.8
    medium: number; // 0.5 - 0.8
    low: number;    // < 0.5
  };

  // Trends
  emotions_trend: DailyTrend[];

  // Top emotions over time
  dominant_emotions_trend: DailyTrend[];

  // AI Quality Metrics (NEW)
  total: number;
  unknown_count: number;
  unknown_rate: number;
  success_count: number;
  success_rate: number;
}

export interface BurnoutAnalytics {
  // Score distribution (histogram)
  score_distribution: {
    range: string;  // e.g., "0-20", "20-40"
    count: number;
  }[];

  // Risk level distribution
  risk_distribution: Record<string, number>;

  // Average scores
  avg_burnout_score: number | null;
  avg_emotional_exhaustion: number | null;
  avg_depersonalization: number | null;
  avg_reduced_accomplishment: number | null;

  // Trends
  burnout_trend: DailyTrend[];

  // High risk users
  high_risk_users: {
    user_id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    burnout_score: number;
    risk_level: string;
    last_assessment: string;
  }[];

  // Top Stressors & Affected Users (NEW)
  top_stressors?: {
    id: string;
    title: string;
    category: string;
    affected_users_count: number;
    affected_percentage: number;
    avg_score: number;
    users: {
      user_id: string;
      username: string;
      full_name?: string;
      avatar_url?: string;
      score: number;
      level: string;
      last_assessment: string;
      notes?: string;
    }[];
  }[];
}

export interface StressorUser {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  score: number;
  level: string;
  last_assessment: string;
  notes?: string;
}

export interface StressorItem {
  id: string;
  title: string;
  category: string;
  affected_users_count: number;
  affected_percentage: number;
  avg_score: number;
  users: StressorUser[];
}

export interface LoginAnalytics {
  // Summary
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  success_rate: number;

  // Trends
  login_trend: DailyTrend[];

  // Failed login analysis
  failed_login_patterns: {
    ip_address: string;
    attempts: number;
    last_attempt: string;
  }[];

  // Peak hours
  peak_hours: {
    hour: number;
    count: number;
  }[];
}

export interface UserDetailAnalytics {
  user_id: string;
  username: string;
  // Login stats
  total_logins: number;
  logins_this_week: number;
  logins_this_month: number;
  login_trend: DailyTrend[];
  // Assessment stats
  total_assessments: number;
  assessments_this_week: number;
  assessments_this_month: number;
  assessments_trend: DailyTrend[];
  assessment_status_distribution: Record<string, number>;
  // Emotion stats
  total_emotions: number;
  emotions_this_week: number;
  emotions_this_month: number;
  emotions_trend: DailyTrend[];
  emotion_distribution: Record<string, number>;
  avg_confidence: number | null;
  // Burnout stats
  total_burnout: number;
  burnout_this_week: number;
  burnout_this_month: number;
  burnout_trend: DailyTrend[];
  avg_burnout_score: number | null;
  risk_level: string | null;
}

// ==========================================
// API Service
// ==========================================

export const adminDashboardService = {
  // === Basic Stats ===
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/v1/admin/dashboard/stats');
    return response.data;
  },

  async getRecentUsers(limit = 10): Promise<{ users: RecentUser[]; count: number }> {
    const response = await api.get('/api/v1/admin/dashboard/users', {
      params: { limit },
    });
    return response.data;
  },

  async getRecentActivity(limit = 50): Promise<{ activities: RecentActivityItem[]; count: number }> {
    const response = await api.get('/api/v1/admin/dashboard/activity', {
      params: { limit },
    });
    return response.data;
  },

  async getAIUsage(limit = 50): Promise<{ usage: AIUsageItem[]; count: number; total_calls: number }> {
    const response = await api.get('/api/v1/admin/dashboard/ai-usage', {
      params: { limit },
    });
    return response.data;
  },

  async getDataOverview(): Promise<DataOverview> {
    const response = await api.get<DataOverview>('/api/v1/admin/dashboard/data-overview');
    return response.data;
  },

  async getRecentLogins(limit = 20): Promise<{
    logins: {
      id: string;
      user_id: string;
      username: string;
      email: string;
      ip_address: string;
      user_agent: string;
      success: boolean;
      timestamp: string;
    }[];
    count: number;
  }> {
    const response = await api.get('/api/v1/admin/dashboard/recent-logins', {
      params: { limit },
    });
    return response.data;
  },

  // === Analytics Endpoints ===
  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await api.get<UserAnalytics>('/api/v1/admin/dashboard/analytics/users');
    return response.data;
  },

  async getAssessmentAnalytics(): Promise<AssessmentAnalytics> {
    const response = await api.get<AssessmentAnalytics>('/api/v1/admin/dashboard/analytics/assessments');
    return response.data;
  },

  async getEmotionAnalytics(): Promise<EmotionAnalytics> {
    const response = await api.get<EmotionAnalytics>('/api/v1/admin/dashboard/analytics/emotions');
    return response.data;
  },

  async getBurnoutAnalytics(): Promise<BurnoutAnalytics> {
    const response = await api.get<BurnoutAnalytics>('/api/v1/admin/dashboard/analytics/burnout');
    return response.data;
  },

  async getLoginAnalytics(): Promise<LoginAnalytics> {
    const response = await api.get<LoginAnalytics>('/api/v1/admin/dashboard/analytics/logins');
    return response.data;
  },

  async getUserDetailAnalytics(userId: string): Promise<UserDetailAnalytics> {
    const response = await api.get<UserDetailAnalytics>(`/api/v1/admin/dashboard/user/${userId}/analytics`);
    return response.data;
  },
};

export default adminDashboardService;
