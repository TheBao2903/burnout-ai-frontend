// ==========================================
// Admin Dashboard - Trang Quản Trị Trung Tâm
// ==========================================

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Brain,
  AlertTriangle,
  Calendar,
  LogIn,
  Loader2,
  Heart,
  Eye,
  Target,
  RotateCcw,
  Flame,
  Trophy,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Select, Space, Row, Col, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  adminDashboardService,
  type DashboardStats,
  type RecentActivityItem,
  type RecentUser,
  type UserAnalytics,
  type EmotionAnalytics,
  type BurnoutAnalytics,
  type LoginAnalytics,
  type StressorItem,
} from "../services/admin";

const { RangePicker } = DatePicker;

// ==========================================
// Colors
// ==========================================
const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
};

// ==========================================
// Format helpers
// ==========================================
const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("vi-VN", {
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

// ==========================================
// Activity Item Component
// ==========================================
function ActivityItem({ activity }: { activity: RecentActivityItem }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="w-4 h-4 text-blue-500" />;
      case "assessment":
        return <Target className="w-4 h-4 text-purple-500" />;
      case "emotion_capture":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "burnout_analysis":
        return <Brain className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "";
      const diff = Date.now() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (minutes < 1) return "Vừa xong";
      if (minutes < 60) return `${minutes}p trước`;
      if (hours < 24) return `${hours}h trước`;
      if (days < 7) return `${days} ngày trước`;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  return (
    <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">
            {activity.username}
          </span>
          <span className="text-xs text-gray-400">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
      </div>
    </div>
  );
}

// ==========================================
// User Row Component
// ==========================================
function UserRow({ user, index }: { user: RecentUser; index: number }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm text-gray-500">
        {index + 1}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-3 py-2 text-center">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            user.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-500">
        {formatDateTime(user.last_login_at)}
      </td>
    </tr>
  );
}

// ==========================================
// Main Dashboard Component
// ==========================================
export default function AdminDashboard() {
  // Filter state - mặc định 7 ngày
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "day").startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [preset, setPreset] = useState<string>("7days");

  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
    []
  );
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );
  const [emotionAnalytics, setEmotionAnalytics] =
    useState<EmotionAnalytics | null>(null);
  const [burnoutAnalytics, setBurnoutAnalytics] =
    useState<BurnoutAnalytics | null>(null);
  const [loginAnalytics, setLoginAnalytics] = useState<LoginAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Selected Stressor for Leaderboard detail
  const [selectedStressorId, setSelectedStressorId] = useState<string | null>(
    null
  );

  // F3: Lấy user hiện tại để dependency cho useEffect re-fetch khi đổi account.
  const { user } = useAuth();
  const currentUid = user?.uid || user?.id || null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        activityData,
        usersData,
        userAnalyticData,
        emotionAnalyticData,
        burnoutAnalyticData,
        loginAnalyticData,
      ] = await Promise.allSettled([
        adminDashboardService.getStats(),
        adminDashboardService.getRecentActivity(100),
        adminDashboardService.getRecentUsers(20),
        adminDashboardService.getUserAnalytics(),
        adminDashboardService.getEmotionAnalytics(),
        adminDashboardService.getBurnoutAnalytics(),
        adminDashboardService.getLoginAnalytics(),
      ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (activityData.status === "fulfilled")
        setRecentActivity(activityData.value.activities);
      if (usersData.status === "fulfilled")
        setRecentUsers(usersData.value.users);
      if (userAnalyticData.status === "fulfilled")
        setUserAnalytics(userAnalyticData.value);
      if (emotionAnalyticData.status === "fulfilled")
        setEmotionAnalytics(emotionAnalyticData.value);
      if (burnoutAnalyticData.status === "fulfilled")
        setBurnoutAnalytics(burnoutAnalyticData.value);
      if (loginAnalyticData.status === "fulfilled")
        setLoginAnalytics(loginAnalyticData.value);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // F3: Reset TẤT CẢ state khi user đổi account, để tránh flash data cũ
    // trong lúc fetch lại data mới. Nếu không reset, UI sẽ hiển thị data
    // user cũ cho đến khi API mới trả về (vài giây).
    setStats(null);
    setRecentActivity([]);
    setRecentUsers([]);
    setUserAnalytics(null);
    setEmotionAnalytics(null);
    setBurnoutAnalytics(null);
    setLoginAnalytics(null);
    setSelectedStressorId(null);
    fetchData();
    // F3: Dependency vào currentUid để khi user đổi account (không unmount
    // component), useEffect re-run và fetch lại data mới. Nếu chỉ dùng [],
    // state sẽ giữ data của user cũ.
  }, [currentUid]);

  // Set default selected stressor when burnout data loads
  useEffect(() => {
    if (
      burnoutAnalytics?.top_stressors &&
      burnoutAnalytics.top_stressors.length > 0
    ) {
      if (!selectedStressorId) {
        setSelectedStressorId(burnoutAnalytics.top_stressors[0].id);
      }
    }
  }, [burnoutAnalytics, selectedStressorId]);

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

  // Reset filter về mặc định (7 ngày)
  const handleResetFilter = () => {
    setPreset("7days");
    setDateRange([
      dayjs().subtract(6, "day").startOf("day"),
      dayjs().endOf("day"),
    ]);
  };

  // Filter data theo date range
  const filteredActivity = useMemo(() => {
    return recentActivity.filter((a) => {
      if (!a.timestamp) return false;
      const actDate = dayjs(a.timestamp);
      return (
        actDate.isAfter(dateRange[0].subtract(1, "second")) &&
        actDate.isBefore(dateRange[1].add(1, "second"))
      );
    });
  }, [recentActivity, dateRange]);

  const filteredUsers = useMemo(() => {
    return recentUsers.filter((u) => {
      if (!u.last_login_at && !u.created_at) return true;
      const loginDate = u.last_login_at ? dayjs(u.last_login_at) : null;
      const createdDate = u.created_at ? dayjs(u.created_at) : null;
      if (!loginDate && !createdDate) return true;
      const checkDate = loginDate ?? createdDate;
      if (!checkDate) return true;
      return (
        checkDate.isAfter(dateRange[0].subtract(1, "second")) &&
        checkDate.isBefore(dateRange[1].add(1, "second"))
      );
    });
  }, [recentUsers, dateRange]);

  // Calculate stats cho date range
  const rangeStats = useMemo(() => {
    const activityInRange = filteredActivity;
    const uniqueUsers = new Set(activityInRange.map((a) => a.user_id));

    const loginsInRange = activityInRange.filter(
      (a) => a.type === "login"
    ).length;
    const assessmentsInRange = activityInRange.filter(
      (a) => a.type === "assessment"
    ).length;
    const emotionsInRange = activityInRange.filter(
      (a) => a.type === "emotion_capture"
    ).length;
    const burnoutInRange = activityInRange.filter(
      (a) => a.type === "burnout_analysis"
    ).length;

    return {
      activeUsers: uniqueUsers.size,
      logins: loginsInRange,
      assessments: assessmentsInRange,
      emotions: emotionsInRange,
      burnout: burnoutInRange,
    };
  }, [filteredActivity]);

  // Get date range label
  const dateRangeLabel = useMemo(() => {
    const days = dateRange[1].diff(dateRange[0], "day") + 1;
    if (days === 1) return "Hôm nay";
    if (days <= 7) return `${days} ngày qua`;
    if (days <= 30) return `${days} ngày qua`;
    return `${days} ngày qua`;
  }, [dateRange]);

  // Filter trend data theo date range
  const filterTrendByDateRange = (trend: { date: string; count: number }[]) => {
    if (!trend || !trend.length) return [];
    return trend.filter((item) => {
      const date = dayjs(item.date);
      return (
        date.isAfter(dateRange[0].subtract(1, "day")) &&
        date.isBefore(dateRange[1].add(1, "day"))
      );
    });
  };

  const burnoutTrendData = filterTrendByDateRange(
    burnoutAnalytics?.burnout_trend || []
  );

  // Top Stressors list
  const topStressors: StressorItem[] = useMemo(() => {
    return burnoutAnalytics?.top_stressors || [];
  }, [burnoutAnalytics]);

  const activeStressor = useMemo(() => {
    if (!topStressors.length) return null;
    return (
      topStressors.find((s) => s.id === selectedStressorId) || topStressors[0]
    );
  }, [topStressors, selectedStressorId]);

  // Risk distribution counts
  const riskDist = useMemo(() => {
    const dist = burnoutAnalytics?.risk_distribution || {};
    const low = dist["low"] || 0;
    const medium = dist["medium"] || 0;
    const high = dist["high"] || 0;
    const critical = dist["critical"] || 0;
    const total = low + medium + high + critical;
    return {
      low,
      medium,
      high,
      critical,
      total,
      lowPct: total > 0 ? Math.round((low / total) * 100) : 0,
      medPct: total > 0 ? Math.round((medium / total) * 100) : 0,
      highPct: total > 0 ? Math.round((high / total) * 100) : 0,
      critPct: total > 0 ? Math.round((critical / total) * 100) : 0,
    };
  }, [burnoutAnalytics]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">
          Đang tải dashboard quản trị...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. HEADER VÀ BỘ LỌC THỜI GIAN                               */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              Tổng Quan Quản Trị Tổ Chức
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Phân tích chỉ số sức khỏe tinh thần, nguy cơ burnout và các yếu tố
              áp lực công việc ({dateRangeLabel})
            </p>
          </div>

          <Space wrap>
            <Select
              value={preset}
              onChange={handlePresetChange}
              style={{ width: 120 }}
              options={[
                { value: "today", label: "Hôm nay" },
                { value: "7days", label: "7 ngày qua" },
                { value: "30days", label: "30 ngày qua" },
                { value: "90days", label: "90 ngày qua" },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                dates && setDateRange([dates[0]!, dates[1]!])
              }
              format="DD/MM/YYYY"
              allowClear={false}
            />
            <button
              onClick={handleResetFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors cursor-pointer"
              title="Reset về mặc định (7 ngày)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </Space>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CORE STATS THEO DATE RANGE (4 CARDS)                     */}
      {/* ============================================================ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-5 shadow-sm text-white transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Nhân sự hoạt động
              </span>
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">
              {rangeStats.activeUsers}
            </div>
            <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
              <span>Đã tương tác trong {dateRangeLabel}</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 shadow-sm text-white transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Lượt Đăng Nhập
              </span>
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <LogIn className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">{rangeStats.logins}</div>
            <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
              <span>Tổng số phiên truy cập</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-linear-to-br from-purple-600 to-purple-700 rounded-xl p-5 shadow-sm text-white transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Khảo Sát Trạng Thái
              </span>
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">
              {rangeStats.assessments}
            </div>
            <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
              <span>Lượt check-in công việc & hồi phục</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="bg-linear-to-br from-rose-600 to-rose-700 rounded-xl p-5 shadow-sm text-white transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Quét Cảm Xúc AI
              </span>
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold">{rangeStats.emotions}</div>
            <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
              <span>Lượt ghi nhận khuôn mặt / cảm xúc</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* ============================================================ */}
      {/* 3. TỔNG QUAN SỨC KHỎE TỔ CHỨC & XU HƯỚNG BURNOUT              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Xu hướng Burnout Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-red-500" />
                  Xu Hướng Căng Thẳng & Đánh Giá Burnout
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Số lượt phân tích nguy cơ burnout của nhân viên theo ngày (
                  {dateRangeLabel})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">
                    Điểm Burnout TB
                  </span>
                  <span className="text-base font-bold text-gray-800">
                    {burnoutAnalytics?.avg_burnout_score
                      ? `${burnoutAnalytics.avg_burnout_score.toFixed(1)}/100`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full">
              {burnoutTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={burnoutTrendData}>
                    <defs>
                      <linearGradient
                        id="burnoutGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.danger}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) => v.slice(5)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      labelFormatter={(v) => `Ngày: ${v}`}
                      formatter={(v) => [v, "Lượt đánh giá"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.danger}
                      strokeWidth={2.5}
                      fill="url(#burnoutGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Brain className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm">
                    Chưa có lượt đánh giá burnout nào trong khoảng thời gian này
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Dữ liệu tự động cập nhật theo chu kỳ đánh giá của nhân viên
            </span>
            <span className="font-medium text-gray-700">
              Tổng số ca nguy cơ cao:{" "}
              <strong className="text-red-600 font-bold">
                {burnoutAnalytics?.high_risk_users?.length || 0}
              </strong>
            </span>
          </div>
        </div>

        {/* Phân bố Rủi ro Tổ chức (1 col) */}
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Mức Độ Rủi Ro Toàn Tổ Chức
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Phân nhóm nguy cơ dựa trên đánh giá mới nhất của nhân sự
            </p>

            <div className="space-y-3.5">
              {/* Critical */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-red-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    Nghiêm trọng (Critical)
                  </span>
                  <span className="text-gray-700">
                    {riskDist.critical} ({riskDist.critPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${riskDist.critPct}%` }}
                  ></div>
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-orange-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    Mức cao (High)
                  </span>
                  <span className="text-gray-700">
                    {riskDist.high} ({riskDist.highPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${riskDist.highPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Trung bình (Medium)
                  </span>
                  <span className="text-gray-700">
                    {riskDist.medium} ({riskDist.medPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${riskDist.medPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    An toàn / Bình thường (Low)
                  </span>
                  <span className="text-gray-700">
                    {riskDist.low} ({riskDist.lowPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${riskDist.lowPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-medium text-gray-800 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Cơ chế Đánh giá & Hồi phục
            </div>
            Hệ thống tự động ghi nhận lần khảo sát mới nhất của từng nhân sự.
            Khi nhân sự phục hồi, điểm rủi ro sẽ tự động giảm và loại khỏi danh
            sách cảnh báo.
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BẢNG XẾP HẠNG YẾU TỐ GÂY CĂNG THẲNG (TOP STRESSORS)       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Bảng Xếp Hạng Yếu Tố Gây Căng Thẳng (Top Stressors)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Xếp hạng mức độ ảnh hưởng của từng yếu tố tới nhân sự. Chọn một
              yếu tố để xem chi tiết danh sách nhân viên đang gặp áp lực.
            </p>
          </div>
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5 self-start sm:self-auto">
            <UserCheck className="w-4 h-4" />
            <span>Tự động cập nhật theo trạng thái mới nhất</span>
          </div>
        </div>

        {topStressors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột Trái: Bảng xếp hạng các Yếu tố (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                Danh sách yếu tố (Xếp theo số nhân sự bị ảnh hưởng)
              </p>

              {topStressors.map((stressor, idx) => {
                const isSelected = activeStressor?.id === stressor.id;
                const rank = idx + 1;

                // Color accent based on rank
                const getRankBadge = (r: number) => {
                  if (r === 1) {
                    return (
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 font-bold flex items-center justify-center text-xs shadow-xs">
                        <Trophy className="w-3.5 h-3.5" />
                      </span>
                    );
                  }
                  if (r === 2) {
                    return (
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center justify-center text-xs">
                        #2
                      </span>
                    );
                  }
                  if (r === 3) {
                    return (
                      <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 border border-orange-300 font-bold flex items-center justify-center text-xs">
                        #3
                      </span>
                    );
                  }
                  return (
                    <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 font-semibold flex items-center justify-center text-xs">
                      #{r}
                    </span>
                  );
                };

                return (
                  <div
                    key={stressor.id}
                    onClick={() => setSelectedStressorId(stressor.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {getRankBadge(rank)}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                            {stressor.title}
                            {isSelected && (
                              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                                Đang chọn
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-gray-500 block truncate">
                            {stressor.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {stressor.affected_users_count}{" "}
                            <span className="text-xs font-normal text-gray-500">
                              nhân sự
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {stressor.affected_percentage}% tổ chức
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected
                              ? "text-blue-600 translate-x-1"
                              : "text-gray-300"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Thanh tiến độ % ảnh hưởng */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            stressor.affected_users_count > 0
                              ? rank === 1
                                ? "bg-red-500"
                                : rank === 2
                                ? "bg-orange-500"
                                : "bg-amber-400"
                              : "bg-gray-300"
                          }`}
                          style={{
                            width: `${Math.max(
                              stressor.affected_percentage,
                              0
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        Điểm TB:{" "}
                        <strong className="text-gray-700 font-semibold">
                          {stressor.avg_score > 0
                            ? `${stressor.avg_score.toFixed(1)}/5.0`
                            : "0.0"}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột Phải: Danh sách Nhân sự bị ảnh hưởng bởi Yếu tố được chọn (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col">
              {activeStressor ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <span>Nhân sự chịu ảnh hưởng:</span>
                      </h4>
                      <p className="text-xs text-blue-700 font-medium line-clamp-1 mt-0.5">
                        {activeStressor.title}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-800 shadow-2xs">
                      {activeStressor.affected_users_count} người
                    </span>
                  </div>

                  {activeStressor.users && activeStressor.users.length > 0 ? (
                    <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
                      {activeStressor.users.map((u) => (
                        <div
                          key={u.user_id}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt={u.username}
                                  className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                                  {u.username?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <Link
                                  to={`/users/${u.user_id}`}
                                  className="font-semibold text-sm text-gray-900 hover:text-blue-600 truncate block"
                                >
                                  {u.full_name || u.username}
                                </Link>
                                <span className="text-xs text-gray-400 truncate block">
                                  @{u.username}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  u.level === "critical"
                                    ? "bg-red-100 text-red-700"
                                    : u.level === "high"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {u.level === "critical"
                                  ? "Nghiêm trọng"
                                  : u.level === "high"
                                  ? "Mức cao"
                                  : "Trung bình"}
                              </span>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Điểm: {u.score}/5.0
                              </div>
                            </div>
                          </div>

                          {/* Notes/Lý do nếu có */}
                          {u.notes && (
                            <div className="mt-2 text-xs bg-gray-50 rounded p-1.5 text-gray-600 border border-gray-100 line-clamp-2">
                              <strong>Ghi chú:</strong> {u.notes}
                            </div>
                          )}

                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                            <span>
                              Đánh giá: {formatDateTime(u.last_assessment)}
                            </span>
                            <Link
                              to={`/users/${u.user_id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
                            >
                              <span>Hồ sơ</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                      <p className="text-sm font-semibold text-gray-700">
                        Tình trạng rất tốt!
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">
                        Hiện không có nhân sự nào gặp căng thẳng hay quá tải ở
                        yếu tố này.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Flame className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm">
                    Chọn một yếu tố bên trái để xem danh sách nhân viên
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-60" />
            <p className="text-sm font-semibold text-gray-700">
              Chưa có dữ liệu khảo sát
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Khi các nhân sự thực hiện khảo sát trạng thái hàng ngày, bảng xếp
              hạng sẽ hiển thị tại đây.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. NHÂN SỰ CẦN CHÚ Ý (HIGH RISK USERS)                       */}
      {/* ============================================================ */}
      {burnoutAnalytics?.high_risk_users &&
        burnoutAnalytics.high_risk_users.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Nhân Sự Cần Hỗ Trợ Khẩn Cấp (Nguy cơ Cao & Nghiêm trọng)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Danh sách những nhân sự có chỉ số căng thẳng vượt ngưỡng an
                  toàn trong lần đánh giá gần nhất
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
                {burnoutAnalytics.high_risk_users.length} trường hợp
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-y border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      Nhân sự
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">
                      Điểm Burnout
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">
                      Mức độ rủi ro
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      Khảo sát gần nhất
                    </th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {burnoutAnalytics.high_risk_users.map((u) => (
                    <tr
                      key={u.user_id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.username}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/users/${u.user_id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold block"
                            >
                              {u.full_name || u.username}
                            </Link>
                            <span className="text-xs text-gray-400">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-base font-extrabold text-red-600">
                          {u.burnout_score}
                        </span>
                        <span className="text-xs text-gray-400">/100</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.risk_level === "critical"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-orange-100 text-orange-700 border border-orange-200"
                          }`}
                        >
                          {u.risk_level === "critical"
                            ? "Nghiêm trọng"
                            : "Mức cao"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDateTime(u.last_assessment)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/users/${u.user_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết phân tích</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ============================================================ */}
      {/* 6. USERS HOẠT ĐỘNG GẦN ĐÂY & NHẬT KÝ HOẠT ĐỘNG                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Tài Khoản Hoạt Động Gần Đây
            </h3>
            <span className="text-xs text-gray-400">
              {filteredUsers.length} tài khoản
            </span>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 border-y border-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Tài khoản
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                    Vai trò
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Đăng nhập gần nhất
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.slice(0, 8).map((u, i) => (
                  <UserRow key={u.id} user={u} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Nhật Ký Hoạt Động Gần Đây
            </h3>
            <span className="text-xs text-gray-400">
              {filteredActivity.length} sự kiện
            </span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredActivity.length > 0 ? (
              filteredActivity
                .slice(0, 15)
                .map((a) => <ActivityItem key={a.id} activity={a} />)
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <p className="text-sm">
                  Chưa có hoạt động nào trong khoảng thời gian này
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
