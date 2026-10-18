// ==========================================
// Emotion Service - API calls cho emotion analysis
// ==========================================

import api from './api';
import type { FullResult, HistoryItem, AnalyzeOptions } from '../types/emotion';

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

export const emotionService = {
  /**
   * Phân tích cảm xúc từ file ảnh
   */
  async analyzeEmotion(
    file: File,
    options: AnalyzeOptions
  ): Promise<FullResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('save_image', options.saveImage ? 'true' : 'false');
    formData.append('generate_ai', options.generateAI ? 'true' : 'false');

    const response = await api.post<FullResult>(
      '/api/emotion/analyze',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Lấy lịch sử phân tích
   */
  async getHistory(): Promise<HistoryItem[]> {
    const response = await api.get<HistoryItem[]>('/api/emotion/history');
    return Array.isArray(response.data) ? response.data.slice(0, 10) : [];
  },

  /**
   * Build public URL từ image key (dùng VITE_R2_PUBLIC_URL)
   */
  getImageUrl(imageKey: string): string | null {
    if (!imageKey) return null;
    return `${R2_PUBLIC_URL}/${imageKey}`;
  },
};

export default emotionService;
