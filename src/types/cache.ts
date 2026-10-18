// ==========================================
// Cache Types
// ==========================================

export interface CacheStats {
  total_entries: number;
  recent_avg_hits: number;
  ttl_days: number;
}

export interface CacheEntry {
  cache_key: string;
  dominant_emotion?: string;
  confidence?: number;
  hit_count: number;
  cached_at?: string;
}

export interface ChatCacheStats {
  total_entries: number;
  recent_avg_hits: number;
  ttl_hours: number;
}
