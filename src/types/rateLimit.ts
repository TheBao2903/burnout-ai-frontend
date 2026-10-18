// ==========================================
// Rate Limit Types
// ==========================================

export interface RateLimitStatus {
  user_daily_limit: number;
  user_today_count: number;
  user_remaining: number;
  global_hourly_limit: number;
  global_this_hour_count: number;
  global_remaining: number;
}
