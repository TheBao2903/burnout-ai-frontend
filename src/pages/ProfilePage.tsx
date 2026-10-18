// ==========================================
// Profile Page - User Profile + Analysis
// Unified page for both regular users and admin view
// Props: userId (optional) - if provided, shows that user's data (admin view)
// ==========================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Loader2,
  Camera,
  Shield,
  TrendingUp,
  Brain,
  Heart,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  LogIn,
  RotateCcw,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { message, DatePicker, Tabs, Row, Col, Card, Select } from "antd";
const { RangePicker } = DatePicker;
import dayjs, { Dayjs } from "dayjs";
import { INDUSTRY_OPTIONS } from "../constants/survey";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/auth";
import dashboardService, {
  type UserDashboardAnalytics,
  type BurnoutAnalytics as BurnoutAnalyticsType,
} from "../services/dashboard";
import adminDashboardService, {
  type UserDetailAnalytics,
} from "../services/admin";
import userService from "../services/user";
import BurnoutAnalytics from "../components/burnout/BurnoutAnalytics";

interface UserProfile {
  uid: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
  email_verified?: boolean;
  created_at?: string;
  standard_working_hours_per_day?: number;
  work_days_per_week?: number;
  average_overtime_hours_per_week?: number;
  job_title?: string;
  industry_code?: string;
}

interface ProfilePageProps {
  userId?: string; // If provided, show that user's data (admin view)
}

// Format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

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

export default function ProfilePage({ userId: propUserId }: ProfilePageProps) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  // Get userId from props or URL params
  const params = useParams<{ userId?: string }>();
  const userId = propUserId || params.userId;
  const isAdminView = !!userId;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Analysis state - union type for both APIs
  const [userAnalytics, setUserAnalytics] =
    useState<UserDashboardAnalytics | null>(null);
  const [adminAnalytics, setAdminAnalytics] =
    useState<UserDetailAnalytics | null>(null);
  const [burnoutAnalytics, setBurnoutAnalytics] =
    useState<BurnoutAnalyticsType | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Filter state
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "day").startOf("day"),
    dayjs().endOf("day"),
  ]);
  const [preset, setPreset] = useState<string>("7days");

  const [messageApi, contextHolder] = message.useMessage();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [standardWorkingHours, setStandardWorkingHours] = useState<number>(8);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState<number>(5);
  const [averageOvertime, setAverageOvertime] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [industryCode, setIndustryCode] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Fetch profile - user or admin view
  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (isAdminView && userId) {
        // Admin view - fetch specific user
        try {
          const user = await userService.getUser(userId);
          setAdminUser(user);
          setFullName(user.full_name || user.username || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setGender(user.gender || "");
          setBirthday(user.birthday || "");
          setAvatar(user.avatar || user.avatar_url || "");
          setStandardWorkingHours(user.standard_working_hours_per_day ?? 8);
          setWorkDaysPerWeek(user.work_days_per_week ?? 5);
          setAverageOvertime(user.average_overtime_hours_per_week ?? 0);
          setJobTitle(user.job_title || "");
          setIndustryCode(user.industry_code || "");
          setRole(user.role || "user");
          setIsActive(user.is_active ?? true);
        } catch {
          const users = await userService.getUsers({ limit: 100 });
          const found = users.users.find((u: any) => u.id === userId);
          setAdminUser(found || null);
          if (found) {
            setFullName(found.full_name || found.username || "");
            setEmail(found.email || "");
            setPhone(found.phone || "");
            setGender(found.gender || "");
            setBirthday(found.birthday || "");
            setAvatar(found.avatar || found.avatar_url || "");
            setStandardWorkingHours(found.standard_working_hours_per_day ?? 8);
            setWorkDaysPerWeek(found.work_days_per_week ?? 5);
            setAverageOvertime(found.average_overtime_hours_per_week ?? 0);
            setJobTitle(found.job_title || "");
            setIndustryCode(found.industry_code || "");
            setRole(found.role || "user");
            setIsActive(found.is_active ?? true);
          }
        }
      } else {
        // Regular user view - fetch own profile
        const response = await authService.getProfile();
        setProfile(response);
        setFullName(response.full_name || "");
        setEmail(response.email || "");
        setPhone(response.phone || "");
        setGender(response.gender || "");
        setBirthday(response.birthday || "");
        setAvatar(response.avatar || "");
        setStandardWorkingHours(response.standard_working_hours_per_day ?? 8);
        setWorkDaysPerWeek(response.work_days_per_week ?? 5);
        setAverageOvertime(response.average_overtime_hours_per_week ?? 0);
        setJobTitle(response.job_title || "");
        setIndustryCode(response.industry_code || "");
        setRole(authUser?.role || "user");
        setIsActive(true);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      messageApi.error("Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics - user or admin API
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      if (isAdminView && userId) {
        // Admin API
        const data = await adminDashboardService.getUserDetailAnalytics(userId);
        setAdminAnalytics(data);
      } else {
        // User API
        const data = await dashboardService.getAnalytics();
        setUserAnalytics(data);
      }

      // Also fetch burnout analytics to get actual scores for date range
      const days = Math.max(1, Math.min(365, dateRange[1].diff(dateRange[0], "day") + 1));
      const burnoutData = await dashboardService.getBurnoutAnalytics(
        days,
        isAdminView ? userId : undefined
      );
      setBurnoutAnalytics(burnoutData);
    } catch (err) {
      console.error("Fetch analytics error:", err);
      // Analytics có thể chưa có data - không hiển thị lỗi
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (isAdminView) {
      fetchAnalytics();
    }
  }, [userId, dateRange, isAdminView]);

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

  // Reset filter về mặc định (7 ngày)
  const handleResetFilter = () => {
    setPreset("7days");
    setDateRange([
      dayjs().subtract(6, "day").startOf("day"),
      dayjs().endOf("day"),
    ]);
  };

  // Get date range label
  const dateRangeLabel = () => {
    const days = dateRange[1].diff(dateRange[0], "day") + 1;
    if (days === 1) return "Hôm nay";
    if (days <= 7) return `${days} ngày qua`;
    if (days <= 30) return `${days} ngày qua`;
    return `${days} ngày qua`;
  };

  // Filter data theo date range
  const filteredTrends = useMemo(() => {
    // User analytics
    if (userAnalytics) {
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
        login_trend: filterTrend(userAnalytics.login_trend || []),
        assessments_trend: filterTrend(userAnalytics.assessments_trend || []),
        emotions_trend: filterTrend(userAnalytics.emotions_trend || []),
        burnout_trend: filterTrend(userAnalytics.burnout_trend || []),
      };
    }

    // Admin analytics
    if (adminAnalytics) {
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
        login_trend: filterTrend(adminAnalytics.login_trend || []),
        assessments_trend: filterTrend(adminAnalytics.assessments_trend || []),
        emotions_trend: filterTrend(adminAnalytics.emotions_trend || []),
        burnout_trend: filterTrend(adminAnalytics.burnout_trend || []),
      };
    }

    return null;
  }, [userAnalytics, adminAnalytics, dateRange]);

  // Calculate stats trong date range
  const rangeStats = useMemo(() => {
    if (!filteredTrends) return null;

    const sumTrend = (trend: any[]) =>
      trend.reduce((sum, item) => sum + item.count, 0);

    return {
      logins: sumTrend(filteredTrends.login_trend),
      assessments: sumTrend(filteredTrends.assessments_trend),
      emotions: sumTrend(filteredTrends.emotions_trend),
      burnout: sumTrend(filteredTrends.burnout_trend),
    };
  }, [filteredTrends]);

  // Get analytics data (unified interface)
  const analytics = userAnalytics || adminAnalytics;

  // Get risk level and avg burnout from burnoutAnalytics (computed from actual scores in date range)
  const currentRiskLevel =
    burnoutAnalytics?.current?.risk_level ||
    adminAnalytics?.risk_level ||
    userAnalytics?.current_risk_level ||
    null;
  const avgBurnoutScore =
    burnoutAnalytics?.stats?.avg_score ||
    adminAnalytics?.avg_burnout_score ||
    userAnalytics?.avg_burnout_score ||
    null;
  const avgConfidence =
    userAnalytics?.avg_confidence || adminAnalytics?.avg_confidence || null;
  const loginCount =
    userAnalytics?.login_count || adminAnalytics?.logins_this_week || 0;

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAdminView && userId) {
        // Admin updating target user
        await userService.updateUser(userId, {
          full_name: fullName || undefined,
          email: email || undefined,
          phone: phone || undefined,
          role: role,
          is_active: isActive,
          gender: gender || undefined,
          birthday: birthday || undefined,
          job_title: jobTitle || undefined,
          industry_code: industryCode || undefined,
          standard_working_hours_per_day: Number(standardWorkingHours),
          work_days_per_week: Number(workDaysPerWeek),
          average_overtime_hours_per_week: Number(averageOvertime),
        });
        messageApi.success("Cập nhật thông tin nhân sự thành công!");
        fetchProfile();
      } else {
        // Regular user updating own profile
        const updateData: any = {};
        if (fullName !== profile?.full_name)
          updateData.full_name = fullName || null;
        if (phone !== profile?.phone) updateData.phone = phone || null;
        if (gender !== profile?.gender) updateData.gender = gender || null;
        if (birthday !== profile?.birthday)
          updateData.birthday = birthday || null;
        if (standardWorkingHours !== profile?.standard_working_hours_per_day)
          updateData.standard_working_hours_per_day = Number(standardWorkingHours);
        if (workDaysPerWeek !== profile?.work_days_per_week)
          updateData.work_days_per_week = Number(workDaysPerWeek);
        if (averageOvertime !== profile?.average_overtime_hours_per_week)
          updateData.average_overtime_hours_per_week = Number(averageOvertime);
        if (jobTitle !== profile?.job_title)
          updateData.job_title = jobTitle || null;
        if (industryCode !== profile?.industry_code)
          updateData.industry_code = industryCode || null;

        await authService.updateProfile(updateData);
        messageApi.success("Cập nhật profile thành công!");
        fetchProfile();
      }
    } catch (err: any) {
      messageApi.error(err?.response?.data?.detail || err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };


  // Risk badge info
  const getRiskBadge = (risk: string | null) => {
    const staCore = burnoutAnalytics?.sta_core;
    if (staCore) {
      const ex = staCore.exhaustion;
      if (ex.level === "critical") {
        return {
          bg: "bg-red-500",
          text: `Cạn Kiệt Nghiêm Trọng (${ex.score.toFixed(1)}/5)`,
          desc: "Mức độ kiệt sức đáng báo động. Cần có biện pháp hỗ trợ và nghỉ ngơi ngay.",
        };
      }
      if (ex.level === "high") {
        return {
          bg: "bg-orange-500",
          text: `Nguy Cơ Cạn Kiệt Cao (${ex.score.toFixed(1)}/5)`,
          desc: "Đang tích tụ căng thẳng và tiêu hao năng lượng lớn. Cần giảm tải sớm.",
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
          desc: "Mức độ kiệt sức đáng báo động. Cần có biện pháp hỗ trợ và giảm tải.",
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
          desc: "Chưa có bài khảo sát hoặc quét cảm xúc để đánh giá.",
        };
    }
  };

  const riskInfo = getRiskBadge(currentRiskLevel);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Đang tải profile...</span>
      </div>
    );
  }

  // Not found (admin view)
  if (isAdminView && !adminUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy user</p>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {contextHolder}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          {/* Back button for admin view */}
          {isAdminView && (
            <button
              onClick={() => navigate("/users")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isAdminView ? (
                <>
                  <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {(adminUser?.full_name || adminUser?.email || "U").charAt(0).toUpperCase()}
                  </span>
                  {adminUser?.full_name || adminUser?.email}
                </>
              ) : (
                <>
                  <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {(profile?.full_name || authUser?.full_name || authUser?.email || "U").charAt(0).toUpperCase()}
                  </span>
                  Thông tin cá nhân
                </>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
              {isAdminView
                ? adminUser?.email
                : "Quản lý thông tin tài khoản và bối cảnh làm việc"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="profile"
        items={[
          // === PROFILE TAB ===
          {
            key: "profile",
            label: (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" /> Thông tin
              </span>
            ),
            children: (
              <div className="space-y-6">
                {/* 1. Card Tổng quan Người dùng (Avatar & Badges) */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow-xs"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-100 text-blue-600 font-extrabold text-2xl shadow-xs">
                            {(fullName || adminUser?.username || authUser?.username || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        {!isAdminView && (
                          <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Name, Email, Tags */}
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-900">
                            {fullName || adminUser?.username || authUser?.username || "User"}
                          </h2>
                          {/* Role tag */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              (isAdminView ? role : authUser?.role) === "admin"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {(isAdminView ? role : authUser?.role) === "admin"
                              ? "Quản trị viên (Admin)"
                              : "Thành viên (User)"}
                          </span>

                          {/* Active tag */}
                          {isAdminView && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}
                            >
                              {isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {email || adminUser?.email || authUser?.email}
                          </span>
                          {phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {phone}
                            </span>
                          )}
                          {jobTitle && (
                            <span className="flex items-center gap-1 text-gray-600 font-medium">
                              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                              {jobTitle}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {(isAdminView ? adminUser?.email_verified : profile?.email_verified) ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-full flex items-center gap-1 font-medium">
                              <Shield className="w-3 h-3" />
                              Email đã xác thực
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-full font-medium">
                              Email chưa xác thực
                            </span>
                          )}

                          {(adminUser?.last_login_at || profile?.created_at) && (
                            <span className="text-xs text-gray-400">
                              {isAdminView && adminUser?.last_login_at
                                ? `Đăng nhập cuối: ${formatDateTime(adminUser.last_login_at)}`
                                : `Ngày tham gia: ${formatDate(profile?.created_at)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdminView && (
                      <div className="text-right sm:border-l sm:border-gray-100 sm:pl-6 shrink-0 flex flex-col justify-center">
                        <span className="text-xs text-gray-400 block">UID Người Dùng</span>
                        <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono mt-0.5 block max-w-xs truncate">
                          {userId}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Card Thông Tin Cá Nhân */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Thông tin cá nhân & Liên hệ
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Email (readonly) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">Email liên kết tài khoản Firebase Auth</span>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Giới tính
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      >
                        <option value="">Chưa chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    {/* Birthday */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        Ngày sinh
                      </label>
                      <DatePicker
                        value={birthday ? dayjs(birthday) : null}
                        onChange={(date) =>
                          setBirthday(date ? date.format("YYYY-MM-DD") : "")
                        }
                        className="w-full"
                        style={{ height: "38px" }}
                        placeholder="Chọn ngày sinh"
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Card Thông Tin Công Việc Nền (Work Baseline) */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Thông tin công việc nền (Work Baseline)
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Dữ liệu nền được AI sử dụng để tính toán khối lượng công việc, rủi ro cạn kiệt và cảnh báo stress.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Industry Archetype */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Nhóm ngành nghề (AI Context Lens)
                      </label>
                      <select
                        value={industryCode}
                        onChange={(e) => setIndustryCode(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">-- Tự động nhận diện theo chức danh --</option>
                        {INDUSTRY_OPTIONS.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.icon} {opt.label} ({opt.desc})
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        AI sử dụng nhóm ngành để nhận định đúng thuật ngữ và áp lực đặc thù của bạn
                      </span>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Chức danh / Vị trí cụ thể
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Ví dụ: Kỹ sư phần mềm, Bác sĩ nội trú, Kế toán trưởng..."
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Standard Working Hours */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Giờ làm việc tiêu chuẩn (giờ/ngày)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        step={0.5}
                        value={standardWorkingHours}
                        onChange={(e) => setStandardWorkingHours(Number(e.target.value))}
                        placeholder="8"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Work Days Per Week */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Số ngày làm việc trong tuần (ngày/tuần)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={workDaysPerWeek}
                        onChange={(e) => setWorkDaysPerWeek(Number(e.target.value))}
                        placeholder="5"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Average Overtime */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Tăng ca trung bình thường lệ (giờ/tuần)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        step={0.5}
                        value={averageOvertime}
                        onChange={(e) => setAverageOvertime(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Card Quản lý Phân Quyền & Tài Khoản (Dành cho Admin) */}
                {isAdminView && (
                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Phân quyền & Trạng thái tài khoản (Admin Only)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Role selection */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Vai trò người dùng (Role)
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                        >
                          <option value="user">Thành viên (User)</option>
                          <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                      </div>

                      {/* Active status */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Trạng thái hoạt động
                        </label>
                        <select
                          value={isActive ? "active" : "inactive"}
                          onChange={(e) => setIsActive(e.target.value === "active")}
                          className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white font-medium"
                        >
                          <option value="active">Đang hoạt động (Active)</option>
                          <option value="inactive">Vô hiệu hóa (Inactive)</option>
                        </select>
                      </div>

                      {/* Created at */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Ngày tạo tài khoản
                        </label>
                        <input
                          type="text"
                          value={formatDateTime(adminUser?.created_at)}
                          disabled
                          className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>

                      {/* Last login */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Lần đăng nhập gần nhất
                        </label>
                        <input
                          type="text"
                          value={formatDateTime(adminUser?.last_login_at)}
                          disabled
                          className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Nút Lưu Thay Đổi */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isAdminView ? "Lưu thông tin nhân sự" : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            ),
          },

          // === ANALYSIS TAB (Chỉ Admin xem được) ===
          ...(isAdminView
            ? [
                {
                  key: "analysis",
                  label: (
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Phân tích sức khỏe & bối cảnh
                    </span>
                  ),
                  children: (
                    <>
                      {/* Header với Filter */}
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold">
                            Dữ liệu phân tích ({dateRangeLabel()})
                          </h3>
                          <div className="flex items-center gap-2">
                            <Select
                              value={preset}
                              onChange={handlePresetChange}
                              style={{ width: 130 }}
                              options={[
                                { value: "today", label: "Hôm nay" },
                                { value: "7days", label: "7 ngày" },
                                { value: "14days", label: "14 ngày" },
                                { value: "30days", label: "30 ngày" },
                                { value: "90days", label: "90 ngày" },
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
                              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                              title="Reset về mặc định (7 ngày)"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>

                      {analyticsLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <span className="ml-3 text-gray-500">
                            Đang tải phân tích...
                          </span>
                        </div>
                      ) : analytics || burnoutAnalytics ? (
                        <div className="space-y-4">
                          {/* 3 Thẻ thống kê nhanh đồng bộ User Dashboard */}
                          <Row gutter={16}>
                            <Col xs={24} sm={8}>
                              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">
                                    Lượt Đăng Nhập
                                  </p>
                                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                                    {rangeStats?.logins ?? 0}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium mt-1">
                                    {dateRangeLabel()}
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
                                    {rangeStats?.assessments ?? 0}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium mt-1">
                                    {dateRangeLabel()}
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
                                    {rangeStats?.emotions ?? 0}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium mt-1">
                                    {dateRangeLabel()}
                                  </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                                  <Heart className="w-6 h-6" />
                                </div>
                              </div>
                            </Col>
                          </Row>

                          {/* Cảnh báo sức khỏe & Độ tin cậy AI */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`${riskInfo.bg} rounded-2xl p-5 text-white shadow-sm flex items-center gap-4`}>
                              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-7 h-7 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                                  {burnoutAnalytics?.sta_core ? "Mức độ Năng lượng & Cạn kiệt (OLBI)" : "Mức độ Burnout hiện tại"}
                                </p>
                                <p className="text-xl font-extrabold mt-0.5 text-white">{riskInfo.text}</p>
                                <p className="text-xs text-white/90 mt-1 font-medium">{riskInfo.desc}</p>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-5 text-white shadow-sm flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-7 h-7 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                                  Độ ổn định & Nhận diện AI
                                </p>
                                <p className="text-xl font-extrabold mt-0.5 text-white">
                                  {avgConfidence ? `${(avgConfidence * 100).toFixed(0)}% Tin cậy` : "Chưa có lượt quét"}
                                </p>
                                <p className="text-xs text-white/90 mt-1 font-medium">
                                  Mức độ chuẩn xác của mô hình DeepFace qua các phiên phân tích.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Full Burnout Analytics Section (STA Core, Job Demands, Recovery & Overload) */}
                          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-indigo-600" />
                              Báo Cáo Sức Khỏe Tinh Thần & Bối Cảnh Công Việc ({dateRangeLabel()})
                            </h3>
                            <BurnoutAnalytics
                              data={burnoutAnalytics}
                              loading={analyticsLoading}
                              days={Math.max(1, Math.min(365, dateRange[1].diff(dateRange[0], "day") + 1))}
                              userId={isAdminView ? userId : undefined}
                              onRetry={fetchAnalytics}
                            />
                          </div>
                        </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Chưa có dữ liệu phân tích
                    </h3>
                    <p className="text-gray-500">
                      {isAdminView
                        ? "Người dùng này chưa có dữ liệu phân tích"
                        : "Bắt đầu thực hiện assessment để xem phân tích của bạn"}
                    </p>
                  </div>
                )}
              </>
            ),
          },
        ]
      : []),
        ]}
      />
    </div>
  );
}
