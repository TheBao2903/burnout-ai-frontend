// ==========================================
// BurnoutAnalytics Component - STA Scientific Dashboard UI
// Phản ánh chuẩn khoa học (OLBI & JD-R) & Thực tế người đi làm
// ==========================================

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  Clock,
  Loader2,
  Brain,
  BatteryCharging,
  ZapOff,
  Moon,
  Briefcase,
  Flame,
  MessageSquareQuote,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { isAxiosError } from "axios";
import {
  dashboardService,
  type BurnoutAnalytics as BurnoutAnalyticsType,
} from "../../services/dashboard";

// ==========================================
// Helper Configurations & Labels
// ==========================================

const LEVEL_CONFIG = {
  critical: { label: "Nghiêm trọng", color: "bg-red-500", text: "text-red-600", border: "border-red-200", bgLight: "bg-red-50" },
  high: { label: "Mức cao", color: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", bgLight: "bg-orange-50" },
  medium: { label: "Trung bình", color: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200", bgLight: "bg-yellow-50" },
  low: { label: "Thấp / Tốt", color: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", bgLight: "bg-emerald-50" },
};

const getLevelConfig = (level: string | null | undefined) => {
  return LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || { label: "Chưa có dữ liệu", color: "bg-gray-300", text: "text-gray-600", border: "border-gray-200", bgLight: "bg-gray-50" };
};

const getTrendBadge = (trend: string | undefined) => {
  switch (trend) {
    case "increasing":
      return { icon: TrendingUp, color: "text-red-600 bg-red-50", label: "Có chiều hướng tăng" };
    case "decreasing":
      return { icon: TrendingDown, color: "text-emerald-600 bg-emerald-50", label: "Đang giảm bớt / Cải thiện" };
    case "insufficient_data":
      return { icon: Minus, color: "text-gray-600 bg-gray-100", label: "Chưa đủ dữ liệu xu hướng" };
    default:
      return { icon: Minus, color: "text-gray-600 bg-gray-100", label: "Duy trì ổn định" };
  }
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const formatDateShort = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  } catch {
    return dateStr;
  }
};

// ==========================================
// Props Interface
// ==========================================

interface BurnoutAnalyticsProps {
  userId?: string;
  days?: number;
  data?: BurnoutAnalyticsType | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function BurnoutAnalytics({
  days = 30,
  userId,
  data,
  loading: externalLoading,
  error: externalError,
  onRetry,
}: BurnoutAnalyticsProps) {
  const [internalAnalytics, setInternalAnalytics] = useState<BurnoutAnalyticsType | null>(null);
  const [internalLoading, setInternalLoading] = useState(data === undefined);
  const [internalError, setInternalError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (signal?: AbortSignal) => {
    await Promise.resolve();
    if (signal?.aborted) return;
    setInternalLoading(true);
    setInternalError(null);
    try {
      const validDays = Math.max(1, Math.min(365, Number(days) || 30));
      const res = await dashboardService.getBurnoutAnalytics(validDays, userId, undefined, signal);
      if (!signal?.aborted) setInternalAnalytics(res);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      const detail = isAxiosError(err) ? err.response?.data?.detail : null;
      const msg = detail ? (typeof detail === "string" ? detail : JSON.stringify(detail)) : "Không thể tải dữ liệu phân tích. Vui lòng thử lại.";
      setInternalError(msg);
    } finally {
      if (!signal?.aborted) setInternalLoading(false);
    }
  }, [days, userId]);

  useEffect(() => {
    if (data !== undefined) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => { if (!controller.signal.aborted) return fetchAnalytics(controller.signal); });
    return () => controller.abort();
  }, [data, fetchAnalytics]);

  const analytics = data !== undefined ? data : internalAnalytics;
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      fetchAnalytics();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-gray-500">Đang tổng hợp phân tích bối cảnh...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
        <h3 className="font-medium text-red-700">Lỗi tải dữ liệu</h3>
        <p className="text-sm text-red-600 mt-1 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition cursor-pointer shadow-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!analytics || (!analytics.current && !analytics.sta_core)) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Chưa có dữ liệu check-in trong khoảng này</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Hãy hoàn thành bài khảo sát trạng thái để hệ thống xây dựng bức tranh bối cảnh công việc và mức độ năng lượng của bạn.
        </p>
      </div>
    );
  }

  const { sta_core, sta_context, sta_trend, warnings } = analytics;

  // =========================================================================
  // RENDER GIAO DIỆN CHUẨN KHOA HỌC STA (KHI CÓ DỮ LIỆU STA_CORE)
  // =========================================================================
  if (sta_core && sta_context) {
    const exLevel = getLevelConfig(sta_core.exhaustion.level);
    const disLevel = getLevelConfig(sta_core.disengagement.level);
    const exTrend = getTrendBadge(sta_core.exhaustion.trend);
    const disTrend = getTrendBadge(sta_core.disengagement.trend);
    const jdLevel = getLevelConfig(sta_context.job_demands.level);

    return (
      <div className="space-y-6">
        {/* KHỐI 1: CẶP CHỈ SỐ CỐT LÕI (BURNOUT CORE - OLBI) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Trạng thái check-in: Cạn kiệt năng lượng & Mất gắn kết
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tổng hợp check-in hằng ngày 9 câu · Thang 1–5 · Khác với bài OLBI định kỳ 16 câu
              </p>
            </div>
            {sta_trend?.at(-1)?.analyzed_at && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatDate(sta_trend?.at(-1)?.analyzed_at)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thẻ 1: Cạn kiệt năng lượng (Exhaustion) */}
            <div className={`p-5 rounded-2xl border ${exLevel.border} ${exLevel.bgLight} transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-red-500">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Cạn Kiệt Thể Chất & Tinh Thần</h3>
                    <p className="text-xs text-gray-500">Exhaustion (E1 - E3)</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${exLevel.color} text-white`}>
                  {exLevel.label}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-gray-900">{sta_core.exhaustion.score.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0 điểm</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${exLevel.color}`}
                  style={{ width: `${Math.min(100, Math.max(0, (sta_core.exhaustion.score / 5) * 100))}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">Xu hướng kỳ này:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${exTrend.color}`}>
                  <exTrend.icon className="w-3.5 h-3.5" />
                  {exTrend.label}
                </span>
              </div>
            </div>

            {/* Thẻ 2: Mất gắn kết công việc (Disengagement) */}
            <div className={`p-5 rounded-2xl border ${disLevel.border} ${disLevel.bgLight} transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-purple-600">
                    <ZapOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Mất Gắn Kết & Khoảng Cách Công Việc</h3>
                    <p className="text-xs text-gray-500">Disengagement (D1 - D3)</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${disLevel.color} text-white`}>
                  {disLevel.label}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-gray-900">{sta_core.disengagement.score.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0 điểm</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${disLevel.color}`}
                  style={{ width: `${Math.min(100, Math.max(0, (sta_core.disengagement.score / 5) * 100))}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">Xu hướng kỳ này:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${disTrend.color}`}>
                  <disTrend.icon className="w-3.5 h-3.5" />
                  {disTrend.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: BIỂU ĐỒ DIỄN BIẾN THEO NGÀY (STA TREND) */}
        {sta_trend && sta_trend.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Diễn biến check-in hằng ngày</h3>
                <p className="text-xs text-gray-500 mt-0.5">Theo dõi sự dao động qua {sta_trend.length} ngày có check-in gần nhất</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                Thang đo 1 - 5
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sta_trend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                  />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1.5 min-w-[180px]">
                            <p className="font-bold text-gray-900 border-b pb-1">{formatDateShort(item.date)}</p>
                            <div className="flex items-center justify-between text-red-600 font-semibold">
                              <span>Cạn kiệt (Exhaustion):</span>
                              <span>{item.exhaustion?.toFixed(1)}/5</span>
                            </div>
                            <div className="flex items-center justify-between text-purple-600 font-semibold">
                              <span>Mất gắn kết:</span>
                              <span>{item.disengagement?.toFixed(1)}/5</span>
                            </div>
                            <div className="flex items-center justify-between text-blue-600">
                              <span>Giấc ngủ:</span>
                              <span>{item.sleep_hours ?? "—"}h (Hồi phục: {item.recovery_score ?? "—"}/5)</span>
                            </div>
                            {item.quick_overload >= 4 && (
                              <div className="text-amber-600 font-medium">⚠️ Có cảm giác quá tải</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs font-medium text-gray-700">
                        {value === "exhaustion" ? "Cạn kiệt năng lượng (Exhaustion)" : "Mất gắn kết (Disengagement)"}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="exhaustion"
                    name="exhaustion"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#ef4444" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="disengagement"
                    name="disengagement"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#8b5cf6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* KHỐI 3: BỐI CẢNH THỰC TẾ (JOB DEMANDS, SLEEP, OVERLOAD & OVERTIME) */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Bối Cảnh Công Việc & Phục Hồi Năng Lượng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Giấc ngủ & Phục hồi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Moon className="w-4 h-4" /> Giấc Ngủ & Hồi Phục
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sta_context.recovery.status === "good"
                        ? "bg-emerald-100 text-emerald-700"
                        : sta_context.recovery.status === "moderate"
                        ? "bg-yellow-100 text-yellow-700"
                        : sta_context.recovery.status === "insufficient_data" ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sta_context.recovery.status === "good"
                      ? "Phục hồi tốt"
                      : sta_context.recovery.status === "moderate"
                      ? "Mức vừa phải"
                      : sta_context.recovery.status === "insufficient_data" ? "Chưa có dữ liệu" : "Thiếu ngủ / Mệt"}
                  </span>
                </div>
                <div className="space-y-3 mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Giờ ngủ trung bình:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {sta_context.recovery.avg_sleep_hours?.toFixed(1) ?? "—"}h / đêm
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Cảm nhận sảng khoái:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {sta_context.recovery.avg_recovery_score?.toFixed(1) ?? "—"} / 5.0
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 pt-3 border-t">
                {sta_context.recovery.avg_sleep_hours != null && sta_context.recovery.avg_sleep_hours < 6.5
                  ? "⚠️ Cần chú ý nâng cao thời lượng ngủ để tránh kiệt sức."
                  : sta_context.recovery.avg_sleep_hours == null ? "Chưa có thời lượng ngủ để nhận xét về giấc ngủ." : "Theo dõi thêm cảm nhận hồi phục để đối chiếu với thời lượng ngủ."}
              </p>
            </div>

            {/* Card 2: Áp lực công việc & Làm thêm giờ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Áp Lực & Tăng Ca
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${jdLevel.bgLight} ${jdLevel.text}`}>
                    {jdLevel.label}
                  </span>
                </div>
                <div className="space-y-3 mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Điểm yêu cầu công việc (JD):</span>
                    <span className="text-lg font-bold text-gray-900">
                      {sta_context.job_demands.score?.toFixed(1) ?? "—"} / 5.0
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-500">Thời gian làm thêm (OT):</span>
                    <span className="text-lg font-bold text-amber-600">
                      {sta_context.work_changes.total_overtime_hours ?? "—"}h{" "}
                      <span className="text-xs font-normal text-gray-500">
                        ({sta_context.work_changes.overtime_days} ngày)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 pt-3 border-t">
                {sta_context.work_changes.total_overtime_hours != null && sta_context.work_changes.total_overtime_hours > 0
                  ? "Tăng ca dồn dập có thể làm giảm hiệu suất dài hạn."
                  : sta_context.work_changes.total_overtime_hours == null ? "Chưa thu thập giờ tăng ca trong ngày; không dùng giờ tăng ca nền theo tuần." : "Không ghi nhận thời gian tăng ca đáng kể trong kỳ."}
              </p>
            </div>

            {/* Card 3: Thống kê phiên quá tải */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Tần Suất Quá Tải
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sta_context.overload_stats.overload_count > 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {sta_context.overload_stats.overload_count} / {sta_context.overload_stats.total_checkins} phiên
                  </span>
                </div>

                <div className="space-y-2 mt-2">
                  <p className="text-xs text-gray-500 font-medium">Nguyên nhân chính được chọn:</p>
                  {sta_context.overload_stats.top_reasons.length > 0 ? (
                    <div className="space-y-1.5">
                      {sta_context.overload_stats.top_reasons.slice(0, 3).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 truncate max-w-[140px]">• {r.reason}</span>
                          <span className="font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                            {r.count} lần
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa ghi nhận phiên nào báo quá tải.</p>
                  )}
                </div>
              </div>

              {/* Trích đoạn lý do Khác nếu có */}
              {sta_context.overload_stats.other_reasons && sta_context.overload_stats.other_reasons.length > 0 && (
                <div className="mt-3 pt-2.5 border-t">
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 italic line-clamp-2">
                      &ldquo;{sta_context.overload_stats.other_reasons[0]}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KHỐI 5: CẢNH BÁO NẾU CÓ */}
        {warnings && warnings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Tín Hiệu Cần Chú Ý
            </h3>
            <div className="space-y-2.5">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    w.severity === "high" ? "bg-red-50/70 border-red-200" : "bg-yellow-50/70 border-yellow-200"
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      w.severity === "high" ? "text-red-500" : "text-yellow-600"
                    }`}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-gray-900">{w.title}</p>
                    <p className="text-gray-600 mt-0.5">{w.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chú thích khoa học */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
          <Info className="w-3.5 h-3.5" />
          <span>
            Hệ thống đo lường dựa trên khoa học hành vi và tâm lý học tổ chức, không đưa ra phán đoán y khoa thay thế bác sĩ.
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FALLBACK: KHI CHỈ CÓ DỮ LIỆU CŨ (BACKWARD COMPATIBILITY)
  // =========================================================================
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
        <h3 className="text-base font-bold text-gray-800">Chưa có check-in trong khoảng đang xem</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Hãy thực hiện check-in hằng ngày hoặc đổi khoảng xem. Lịch sử OLBI định kỳ nằm trong phần Tiến triển OLBI riêng.
        </p>
      </div>
    </div>
  );
}
