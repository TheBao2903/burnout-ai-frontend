// ==========================================
// Emotion Types
// ==========================================

export interface EmotionScores {
  happy: number;
  sad: number;
  neutral: number;
  fear: number;
  angry: number;
  surprise: number;
  disgust: number;
}

export interface EmotionResult {
  emotions: EmotionScores;
  dominant_emotion: string;
  confidence: number;
  age?: number;
  gender?: string;
  analyzed_at: string;
}

export interface Assessment {
  risk_level: string;
  summary: string;
  recommendations: string[];
  key_signals: string[];
  disclaimer: string;
  ai_model?: string;
  ai_prompt_version?: string;
}

export interface FullResult {
  emotion: EmotionResult;
  assessment?: Assessment;
  saved_to_r2: boolean;
  image_url?: string;
  generated_at: string;
}

export interface HistoryItem {
  id: string;
  dominant_emotion: string;
  confidence: number;
  emotions: EmotionScores;
  age?: number;
  gender?: string;
  analyzed_at: string;
  image_url?: string;
  image_key?: string;
  user_id?: string;
  assessment?: Assessment;
}

export interface AnalyzeOptions {
  saveImage: boolean;
  generateAI: boolean;
}
