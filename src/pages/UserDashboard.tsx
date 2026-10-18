// ==========================================
// User Dashboard - Sức khỏe tinh thần cá nhân
// Tối ưu tốc độ tải với Skeleton & Cache
// ==========================================

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Heart,
  Target,
  LogIn,
  AlertTriangle,
  CheckCircle,
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
  const initialDays = Math.max(1, Math.min(365, dateRange[1].diff(dateRange[0], "day") + 1));
  const initialCacheKey = `${currentUserId}_${initialDays}`;
  const initialCached = dashboardMemoryCache.get(initialCacheKey);

  const [analytics, setAnalytics] = useState<UserDashboardAnalytics | null>(
    initialCached ? initialCached.analytics : null
  );
  const [burnoutAnalytics, setBurnoutAnalytics] =
    useState<BurnoutAnalyticsType | null>(initialCached ? initialCached.burnout : null);
  const [burnoutError, setBurnoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialCached);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (force = false) => {
    // Chờ Firebase Auth sẵn sàng
    await authService.waitForAuth();

    const uid = user?.uid || user?.id || null;
    const days = Math.max(1, Math.min(365, dateRange[1].diff(dateRange[0], "day") + 1));
    const cacheKey = `${uid}_${days}`;
    const cached = dashboardMemoryCache.get(cacheKey);
    const isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

    // 1. SWR: Nếu đã có cache, hiển thị ngay lập tức (0ms)
    if (cached) {
      setAnalytics(cached.analytics);
      setBurnoutAnalytics(cached.burnout);
      setLoading(false);
      // Nếu không ép force và cache còn mới (< 5 phút), không cần re-fetch
      if (!force && isFresh) {
        return;
      }
    } else {
      // Chỉ hiện Skeleton khi hoàn toàn chưa có dữ liệu nào
      setLoading(true);
    }

    setIsRefreshing(true);
    setBurnoutError(null);

    try {
      const [analyticsRes, burnoutRes] = await Promise.allSettled([
        dashboardService.getAnalytics(),
        dashboardService.getBurnoutAnalytics(days),
      ]);

      let nextAnalytics = analytics;
      let nextBurnout = burnoutAnalytics;

      if (analyticsRes.status === "fulfilled") {
        nextAnalytics = analyticsRes.value;
        setAnalytics(nextAnalytics);
      }

      if (burnoutRes.status === "fulfilled") {
        nextBurnout = burnoutRes.value;
        setBurnoutAnalytics(nextBurnout);
        setBurnoutError(null);
      } else {
        console.error("UserDashboard burnout fetch error:", burnoutRes.reason);
        const reason: any = burnoutRes.reason;
        const msg = reason?.response?.data?.detail
          ? (typeof reason.response.data.detail === "string"
              ? reason.response.data.detail
              : JSON.stringify(reason.response.data.detail))
          : "Không thể tải dữ liệu burnout. Vui lòng thử lại.";
        setBurnoutError(msg);
      }

      // Cập nhật lại cache với dữ liệu mới nhất
      if (nextAnalytics && nextBurnout) {
        dashboardMemoryCache.set(cacheKey, {
          analytics: nextAnalytics,
          burnout: nextBurnout,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error("UserDashboard fetch error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // SWR: Tự động dùng cache có sẵn, revalidate ngầm không chặn UI
    if (isAuthReady || user) {
      fetchDashboardData(false);
    }
  }, [dateRange, user?.uid, isAuthReady]);

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
    fetchDashboardData(true);
  };

  const dateRangeLabel = useMemo(() => {
    const days = dateRange[1].diff(dateRange[0], "day") + 1;
    if (days === 1) return "Hôm nay";
    if (days <= 7) return `${days} ngày qua`;
    if (days <= 30) return `${days} ngày qua`;
    return `${days} ngày qua`;
  }, [dateRange]);

  // Lọc dữ liệu trends theo date range
  const filteredTrends = useMemo(() => {
    if (!analytics) return null;
    const filterTrend = (trend: any[]) => {
      return trend.filter((item) => {
        const date = dayjs(item.date);
        return (
          date.isAfter(dateRange[0].subtract(1, "day")) &&
          date.isBefore(dateRange[1].add(1, "day"))
        );
      });
    };
    return {
      login_trend: filterTrend(analytics.login_trend || []),
      assessments_trend: filterTrend(analytics.assessments_trend || []),
      emotions_trend: filterTrend(analytics.emotions_trend || []),
      burnout_trend: filterTrend(analytics.burnout_trend || []),
    };
  }, [analytics, dateRange]);

  // Stats trong date range
  const rangeStats = useMemo(() => {
    if (!filteredTrends) return { logins: 0, assessments: 0, emotions: 0, burnout: 0 };
    const sumTrend = (trend: any[]) =>
      trend.reduce((sum, item) => sum + (item.count || 0), 0);

    return {
      logins: sumTrend(filteredTrends.login_trend),
      assessments: sumTrend(filteredTrends.assessments_trend),
      emotions: sumTrend(filteredTrends.emotions_trend),
      burnout: sumTrend(filteredTrends.burnout_trend),
    };
  }, [filteredTrends]);

  // Health Metrics
  const currentRiskLevel =
    burnoutAnalytics?.current?.risk_level ||
    analytics?.current_risk_level ||
    null;

  const hasSurveyData =
    rangeStats.assessments > 0 ||
    (analytics?.total_assessments ?? 0) > 0 ||
    !!burnoutAnalytics?.current;

  const hasEmotionData =
    rangeStats.emotions > 0 ||
    (analytics?.total_emotion_analyses ?? 0) > 0 ||
    (analytics?.emotions_this_month ?? 0) > 0;

  const avgConfidence = analytics?.avg_confidence || null;

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

  const staCore = burnoutAnalytics?.sta_core;
  const getRiskBadge = (risk: string | null) => {
    if (staCore) {
      const ex = staCore.exhaustion;
      if (ex.level === "critical") {
        return {
          bg: "bg-red-500",
          text: `Cạn Kiệt Nghiêm Trọng (${ex.score.toFixed(1)}/5)`,
          desc: "Năng lượng đang ở mức cạn kiệt đáng báo động. Hãy cân nhắc nghỉ ngơi và giảm tải công việc.",
        };
      }
      if (ex.level === "high") {
        return {
          bg: "bg-orange-500",
          text: `Mức Cạn Kiệt Cao (${ex.score.toFixed(1)}/5)`,
          desc: "Tín hiệu mệt mỏi tích lũy kéo dài. Cần chú ý sắp xếp thời gian tái tạo năng lượng.",
        };
      }
      if (ex.level === "medium") {
        return {
          bg: "bg-yellow-500",
          text: `Mức Độ Vừa Phải (${ex.score.toFixed(1)}/5)`,
          desc: "Năng lượng và mức độ gắn kết công việc đang ở ngưỡng chấp nhận được.",
        };
      }
      return {
        bg: "bg-emerald-500",
        text: `Năng Lượng Tốt & Cân Bằng (${ex.score.toFixed(1)}/5)`,
        desc: "Thể trạng tinh thần thoải mái, sự gắn kết công việc duy trì rất tích cực!",
      };
    }

    switch (risk) {
      case "critical":
        return {
          bg: "bg-red-500",
          text: "Nguy cơ Rất Cao (Cần nghỉ ngơi ngay)",
          desc: "Mức độ kiệt sức đáng báo động. Hãy cân nhắc giảm tải công việc.",
        };
      case "high":
        return {
          bg: "bg-orange-500",
          text: "Nguy cơ Cao (Cần chú ý)",
          desc: "Có dấu hiệu căng thẳng kéo dài. Cần thư giãn và nghỉ ngơi sớm.",
        };
      case "medium":
        return {
          bg: "bg-yellow-500",
          text: "Mức Trung Bình",
          desc: "Sức khỏe tinh thần ở mức chấp nhận được, duy trì lối sống lành mạnh.",
        };
      case "low":
        return {
          bg: "bg-green-500",
          text: "Trạng thái Tốt / An Toàn",
          desc: "Tâm lý thoải mái, cân bằng công việc và cuộc sống rất tốt!",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "Chưa đủ dữ liệu",
          desc: "Hãy thực hiện bài khảo sát hoặc quét cảm xúc để đánh giá.",
        };
    }
  };

  const riskInfo = getRiskBadge(currentRiskLevel);

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
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
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
              Báo Cáo Sức Khỏe Tinh Thần & Bối Cảnh Công Việc ({dateRangeLabel})
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
                  <Tooltip formatter={(value: any) => `${value} lượt`} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
