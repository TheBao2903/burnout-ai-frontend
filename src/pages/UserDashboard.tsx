// ==========================================
// User Dashboard - Sức khỏe tinh thần cá nhân
// Tối ưu tốc độ tải với Skeleton & Cache
// ==========================================

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Heart,
  Target,
  LogIn,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  DatePicker,
  Select,
  Row,
  Col,
  Skeleton,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/auth";
import dashboardService, {
  type UserDashboardAnalytics,
  type BurnoutAnalytics as BurnoutAnalyticsType,
} from "../services/dashboard";
import BurnoutAnalytics from "../components/burnout/BurnoutAnalytics";
import OlbiProgress from "../components/burnout/OlbiProgress";
import DashboardInsight from "../components/burnout/DashboardInsight";

const { RangePicker } = DatePicker;

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

// In-memory cache đa khung thời gian để chuyển tab hiển thị tức thì 0ms (SWR Pattern)
interface DashboardCacheEntry {
  analytics: UserDashboardAnalytics;
  burnout: BurnoutAnalyticsType;
  timestamp: number;
}
const dashboardMemoryCache = new Map<string, DashboardCacheEntry>();
const CACHE_TTL_MS = 300000; // Cache 5 phút

export default function UserDashboard() {
  const { user, isAuthReady } = useAuth();

  // Filter state
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "day").startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [preset, setPreset] = useState<string>("7days");

  // Khởi tạo state từ cache tương ứng với user & range nếu có
  const currentUserId = user?.uid || user?.id || null;
  const startDate = dateRange[0].format("YYYY-MM-DD");
  const endDate = dateRange[1].format("YYYY-MM-DD");
  const initialCacheKey = `${currentUserId}_${startDate}_${endDate}`;
  const initialCached = dashboardMemoryCache.get(initialCacheKey);

  const [storedAnalytics, setAnalytics] = useState<UserDashboardAnalytics | null>(
    initialCached ? initialCached.analytics : null
  );
  const [storedBurnoutAnalytics, setBurnoutAnalytics] =
    useState<BurnoutAnalyticsType | null>(initialCached ? initialCached.burnout : null);
  const [burnoutError, setBurnoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialCached);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [responseKey, setResponseKey] = useState(initialCacheKey);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestVersion = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);
  const analytics = responseKey === initialCacheKey ? storedAnalytics : null;
  const burnoutAnalytics = responseKey === initialCacheKey ? storedBurnoutAnalytics : null;

  const fetchDashboardData = useCallback(async (force = false) => {
    const requestId = ++requestVersion.current;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const cacheKey = `${currentUserId}_${startDate}_${endDate}`;
    const cached = dashboardMemoryCache.get(cacheKey);
    const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;
    const isCurrent = () => requestId === requestVersion.current && !controller.signal.aborted;
    try {
      await authService.waitForAuth();
      if (!isCurrent()) return;
      setBurnoutError(null);
      if (cached) {
        setAnalytics(cached.analytics);
        setBurnoutAnalytics(cached.burnout);
        setResponseKey(cacheKey);
        setLoading(false);
        if (!force && isFresh) { setIsRefreshing(false); return; }
      } else {
        setLoading(true);
      }
      setIsRefreshing(true);
      const window = { start_date: startDate, end_date: endDate };
      const [analyticsRes, burnoutRes] = await Promise.allSettled([
        dashboardService.getAnalytics(window, controller.signal),
        dashboardService.getBurnoutAnalytics(30, undefined, window, controller.signal),
      ]);
      if (!isCurrent()) return;
      const nextAnalytics = analyticsRes.status === "fulfilled" ? analyticsRes.value : cached?.analytics || null;
      const nextBurnout = burnoutRes.status === "fulfilled" ? burnoutRes.value : cached?.burnout || null;
      setAnalytics(nextAnalytics);
      setBurnoutAnalytics(nextBurnout);
      setResponseKey(cacheKey);
      if (burnoutRes.status === "rejected") setBurnoutError("Không thể tải dữ liệu trong khoảng đã chọn. Vui lòng thử lại.");
      if (nextAnalytics && nextBurnout && analyticsRes.status === "fulfilled" && burnoutRes.status === "fulfilled") {
        dashboardMemoryCache.set(cacheKey, { analytics: nextAnalytics, burnout: nextBurnout, timestamp: Date.now() });
      }
    } catch {
      if (isCurrent()) setBurnoutError("Không thể tải dashboard. Vui lòng thử lại.");
    } finally {
      if (isCurrent()) { setLoading(false); setIsRefreshing(false); }
    }
  }, [currentUserId, startDate, endDate]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && isAuthReady && currentUserId) return fetchDashboardData(refreshVersion > 0);
    });
    return () => { cancelled = true; activeRequest.current?.abort(); requestVersion.current += 1; };
  }, [fetchDashboardData, currentUserId, isAuthReady, refreshVersion]);

  // Handle preset change
  const handlePresetChange = (value: string) => {
    setPreset(value);
    const now = dayjs();
    switch (value) {
      case "today":
        setDateRange([now.startOf("day"), now.endOf("day")]);
        break;
      case "7days":
        setDateRange([now.subtract(6, "day").startOf("day"), now.endOf("day")]);
        break;
      case "14days":
        setDateRange([
          now.subtract(13, "day").startOf("day"),
          now.endOf("day"),
        ]);
        break;
      case "30days":
        setDateRange([
          now.subtract(29, "day").startOf("day"),
          now.endOf("day"),
        ]);
        break;
      case "90days":
        setDateRange([
          now.subtract(89, "day").startOf("day"),
          now.endOf("day"),
        ]);
        break;
      default:
        break;
    }
  };

  const handleResetFilter = () => {
    setPreset("7days");
    setDateRange([
      dayjs().subtract(6, "day").startOf("day"),
      dayjs().endOf("day"),
    ]);
    setRefreshVersion(value => value + 1);
  };

  const dateRangeLabel = `${dateRange[0].format("DD/MM/YYYY")} – ${dateRange[1].format("DD/MM/YYYY")}`;

  // Lọc dữ liệu trends theo date range
  const filteredTrends = useMemo(() => {
    if (!analytics) return null;
    const filterTrend = (trend: { date: string; count: number }[]) => {
      return trend.filter((item) => {
        const date = dayjs(item.date);
        return (
          date.format("YYYY-MM-DD") >= startDate &&
          date.format("YYYY-MM-DD") <= endDate
        );
      });
    };
    return {
      login_trend: filterTrend(analytics.login_trend || []),
      assessments_trend: filterTrend(analytics.assessments_trend || []),
      emotions_trend: filterTrend(analytics.emotions_trend || []),
      burnout_trend: filterTrend(analytics.burnout_trend || []),
    };
  }, [analytics, startDate, endDate]);

  // Stats trong date range
  const rangeStats = useMemo(() => {
    if (!filteredTrends) return { logins: 0, assessments: 0, emotions: 0, burnout: 0 };
    const sumTrend = (trend: { count: number }[]) =>
      trend.reduce((sum, item) => sum + (item.count || 0), 0);

    return {
      logins: sumTrend(filteredTrends.login_trend),
      assessments: sumTrend(filteredTrends.assessments_trend),
      emotions: sumTrend(filteredTrends.emotions_trend),
      burnout: sumTrend(filteredTrends.burnout_trend),
    };
  }, [filteredTrends]);

  const hasSurveyData =
    rangeStats.assessments > 0 ||
    (analytics?.total_assessments ?? 0) > 0 ||
    !!burnoutAnalytics?.current;

  const hasEmotionData =
    rangeStats.emotions > 0 ||
    (analytics?.total_emotion_analyses ?? 0) > 0 ||
    (analytics?.emotions_this_month ?? 0) > 0;


  // Emotion distribution
  const emotionData = useMemo(() => {
    if (!analytics?.emotion_distribution) return [];
    return Object.entries(analytics.emotion_distribution).map(
      ([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: COLORS[i % COLORS.length],
      })
    );
  }, [analytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header chào mừng & Bộ lọc thời gian */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>Xin chào, {user?.full_name || user?.username || "bạn"}</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi và chăm sóc sức khỏe tinh thần của bạn ({dateRangeLabel})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={preset}
            onChange={handlePresetChange}
            style={{ width: 130 }}
            options={[
              { value: "today", label: "Hôm nay" },
              { value: "7days", label: "7 ngày qua" },
              { value: "14days", label: "14 ngày qua" },
              { value: "30days", label: "30 ngày qua" },
              { value: "90days", label: "90 ngày qua" },
              ...(preset === "custom" ? [{ value: "custom", label: "Tùy chỉnh" }] : []),
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => { if (dates?.[0] && dates[1]) { setPreset("custom"); setDateRange([dates[0].startOf("day"), dates[1].endOf("day")]); } }}
            format="DD/MM/YYYY"
            allowClear={false}
          />
          <button
            onClick={handleResetFilter}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors cursor-pointer"
            title="Reset về mặc định (7 ngày)"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          {isRefreshing && !loading && (
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              Đang làm mới ngầm...
            </span>
          )}
        </div>
      </div>

      <OlbiProgress startDate={startDate} endDate={endDate} />
      <DashboardInsight startDate={startDate} endDate={endDate} />

      {/* SKELETON LOADING HOẶC NỘI DUNG CHÍNH */}
      {loading && !analytics ? (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col span={8}><Skeleton.Button active block style={{ height: 110, borderRadius: 16 }} /></Col>
            <Col span={8}><Skeleton.Button active block style={{ height: 110, borderRadius: 16 }} /></Col>
            <Col span={8}><Skeleton.Button active block style={{ height: 110, borderRadius: 16 }} /></Col>
          </Row>
          <Skeleton.Button active block style={{ height: 260, borderRadius: 16 }} />
        </div>
      ) : (
        <>
          {/* Quick CTA banner linh hoạt theo trạng thái dữ liệu thực tế */}
          {(!hasSurveyData || !hasEmotionData) && (
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1 max-w-2xl">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-blue-200" />
                  {hasSurveyData && !hasEmotionData
                    ? "Bạn đã có dữ liệu khảo sát Burnout!"
                    : !hasSurveyData && hasEmotionData
                    ? "Bạn đã có dữ liệu quét cảm xúc hôm nay!"
                    : "Bạn chưa có dữ liệu đo lường sức khỏe tinh thần hôm nay"}
                </h3>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                  {hasSurveyData && !hasEmotionData
                    ? "Hệ thống đã nhận bài khảo sát của bạn. Hãy quét thêm cảm xúc khuôn mặt bằng webcam (chỉ 30 giây) để AI kết hợp đa tầng dữ liệu và phân tích chuẩn xác 100%."
                    : !hasSurveyData && hasEmotionData
                    ? "Hãy hoàn thành bài khảo sát Burnout (chỉ 2 phút) để AI đánh giá toàn diện các yếu tố bối cảnh công việc & mức độ mệt mỏi."
                    : "Chỉ mất 2 phút để quét cảm xúc khuôn mặt hoặc hoàn thành bài khảo sát Burnout để nhận phân tích chi tiết."}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/emotion-test"
                  className={`px-4 py-2 font-medium rounded-xl transition-colors flex items-center gap-1.5 text-sm ${
                    hasSurveyData && !hasEmotionData
                      ? "bg-white text-blue-700 hover:bg-blue-50 shadow-sm font-semibold"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  }`}
                >
                  <Heart className="w-4 h-4 text-pink-500" /> Quét cảm xúc {hasSurveyData && !hasEmotionData && "ngay"}
                </Link>
                <Link
                  to="/survey-test"
                  className={`px-4 py-2 font-medium rounded-xl transition-colors flex items-center gap-1.5 text-sm ${
                    !hasSurveyData
                      ? "bg-white text-blue-700 hover:bg-blue-50 shadow-sm font-semibold"
                      : "bg-blue-500/80 text-white hover:bg-blue-500 border border-blue-400"
                  }`}
                >
                  <Target className="w-4 h-4" /> {!hasSurveyData ? "Làm khảo sát ngay" : "Làm lại khảo sát"} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* 3 Thẻ thống kê nhanh */}
          {/* 3 Thẻ thống kê nhanh */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                    Lượt Đăng Nhập
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {rangeStats.logins}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {dateRangeLabel}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <LogIn className="w-6 h-6" />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={8}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-600 font-bold">
                    Khảo Sát Đã Làm
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {rangeStats.assessments}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {dateRangeLabel}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={8}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs uppercase tracking-wider text-pink-600 font-bold">
                    Lượt Quét Cảm Xúc
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {rangeStats.emotions}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {dateRangeLabel}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
            </Col>
          </Row>



          {/* KHỐI PHÂN TÍCH BURNOUT CHI TIẾT (OLBI Core, Job Demands, Recovery & Overload) */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Check-in hằng ngày & Bối cảnh công việc ({dateRangeLabel})
            </h3>
            <BurnoutAnalytics
              data={burnoutAnalytics}
              loading={loading && !burnoutAnalytics}
              error={burnoutError}
              days={Math.max(1, Math.min(365, dateRange[1].diff(dateRange[0], "day") + 1))}
              onRetry={() => fetchDashboardData(true)}
            />
          </div>

          {/* PHÂN BỐ CẢM XÚC GHI NHẬN (Chỉ hiển thị khi đã có dữ liệu quét cảm xúc) */}
          {emotionData.some((d) => d.value > 0) && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Phân Bố Cảm Xúc Ghi Nhận ({dateRangeLabel})
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <RechartsPie>
                  <Pie
                    data={emotionData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      percent != null && !isNaN(percent)
                        ? `${name} (${(percent * 100).toFixed(0)}%)`
                        : name
                    }
                    labelLine={false}
                  >
                    {emotionData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value: number | string) => `${value} lượt`} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
