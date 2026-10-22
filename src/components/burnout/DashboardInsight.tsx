import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, type ContextInsight } from '../../services/dashboard';

const date = (value: string, time = false) => new Date(value).toLocaleString('vi-VN', {
  timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric',
  ...(time ? { hour: '2-digit', minute: '2-digit' } as const : {}),
});

export default function DashboardInsight({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user, isAuthReady } = useAuth();
  const owner = user?.uid || user?.id || '';
  const key = `${owner}:${startDate}:${endDate}`;
  const [response, setResponse] = useState<{ key: string; data: ContextInsight } | null>(null);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  useEffect(() => {
    if (!owner || !isAuthReady) return;
    const controller = new AbortController();
    const load = async () => {
      setPending(true);
      setError(null);
      try {
        const data = await dashboardService.getContextInsight({ start_date: startDate, end_date: endDate }, controller.signal);
        if (!controller.signal.aborted) setResponse({ key, data });
      } catch {
        if (!controller.signal.aborted) setError({ key, message: 'Chưa tải được nhận định. Biểu đồ và chỉ số vẫn xem được độc lập.' });
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [owner, isAuthReady, startDate, endDate, key, revision]);
  const data = response?.key === key ? response.data : null;
  const failure = error?.key === key ? error.message : null;
  const loading = pending || (!data && !failure);
  return <section aria-labelledby="dashboard-insight-title" className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="dashboard-insight-title" className="flex items-center gap-2 font-bold text-gray-900"><Sparkles className="h-5 w-5 text-indigo-600" />Nhận Định Bối Cảnh Thực Tế Từ Hệ Thống</h2>
        <p className="mt-1 text-xs text-gray-500">{date(startDate)} – {date(endDate)} · Kết hợp các nguồn có dữ liệu trong khoảng đã chọn.</p></div>
      <button type="button" disabled={loading} onClick={() => setRevision(value => value + 1)} aria-label="Tải lại nhận định bối cảnh" className="rounded-lg border border-indigo-200 bg-white p-2 text-indigo-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
    </div>
    {loading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm text-indigo-700"><Loader2 className="h-4 w-4 animate-spin" />Đang tổng hợp nhận định; bạn có thể xem biểu đồ trong lúc chờ.</p>
      : failure ? <div role="alert" className="mt-4 text-sm text-amber-800"><p className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{failure}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="mt-2 underline">Thử lại nhận định</button></div>
      : data && <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
          <span className={`rounded-full px-2 py-1 font-semibold ${data.source === 'ai' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>{data.source === 'ai' ? 'AI tổng hợp' : 'Nhận xét theo quy tắc'}</span>
          <span className="py-1">Tạo lúc {date(data.generated_at, true)}{data.from_cache ? ' · Kết quả đã lưu' : ''}</span>
        </div>
        {data.source === 'rules' && data.reason !== 'insufficient_data' && <p className="text-xs text-amber-800">AI chưa cung cấp nhận định hợp lệ cho lần tải này. Nội dung dưới đây được tính theo quy tắc từ dữ liệu, không phải phản hồi của AI.</p>}
        <p className="text-xs text-gray-600">Dựa trên {data.coverage.daily_days}/{data.coverage.selected_calendar_days} ngày có check-in và {data.coverage.olbi_records} bài OLBI trong khoảng.</p>
        <p className="rounded-xl border border-indigo-100 bg-white/80 p-4 text-sm leading-relaxed text-gray-800">{data.summary}</p>
        {data.key_observations.length > 0 && <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">{data.key_observations.map((text, index) => <li key={index}>{text}</li>)}</ul>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50/70 p-3"><h3 className="text-xs font-semibold text-emerald-900">Một bước có thể thực hiện</h3><p className="mt-1 text-sm text-gray-700">{data.suggested_action}</p></div>
          <div className="rounded-xl bg-indigo-50 p-3"><h3 className="text-xs font-semibold text-indigo-900">Gợi mở suy ngẫm</h3><p className="mt-1 text-sm text-gray-700">{data.reflection_question}</p></div>
        </div>
        <details className="rounded-xl border border-gray-200 bg-white/70 p-3 text-xs text-gray-600">
          <summary className="cursor-pointer font-semibold">Dữ liệu và giới hạn của nhận định</summary>
          <p className="mt-2">Check-in có đủ E/D: {data.coverage.daily_complete_core_days} ngày; khảo sát môi trường làm việc: {data.coverage.environment_records}; ước lượng khuôn mặt: {data.coverage.facial_records}; hội thoại có phân tích: {data.coverage.analyzed_chat_messages}/{data.coverage.chat_messages} tin nhắn của bạn.</p>
          {data.last_observation_at && <p className="mt-1">Mốc khảo sát mới nhất được dùng: {date(data.last_observation_at, true)}.</p>}
          <ul className="mt-2 list-disc space-y-1 pl-4">{data.limitations.map((text, index) => <li key={index}>{text}</li>)}</ul>
        </details>
      </div>}
  </section>;
}
