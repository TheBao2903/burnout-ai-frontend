// ==========================================
// Assessment Types
// ==========================================

export interface AssessmentResult {
  id: string;
  user_id: string;
  burnout_score: number;
  risk_level: string;
  created_at: string;
}

export interface ChatAnalyzeRequest {
  text: string;
}

export interface ChatAnalysisResult {
  text: string;
  text_length: number;
  result: {
    stress_level: { score: number; evidence: string };
    fatigue_signal: { score: number; evidence: string };
    motivation_level: { score: number; evidence: string };
    burnout_related_signal: { score: number; evidence: string };
    detected_signals: string[];
    important_phrases: string[];
    uncertainty: number;
    ai_model?: string;
  };
}
