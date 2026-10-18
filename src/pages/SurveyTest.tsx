// ==========================================
// Survey Test Page - Khảo sát trạng thái & Gợi ý (STA Scientific Standard)
// ==========================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Loader2,
  AlertCircle,
  CheckCircle,
  Brain,
  MapPin,
  Clock,
  Heart,
  TrendingUp,
  Coffee,
  TreePine,
  Dumbbell,
  BookOpen,
  Send,
  RefreshCw,
  ExternalLink,
  Phone,
  Navigation,
  Loader,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Briefcase,
  Zap,
  AlertTriangle,
  Moon,
  Sparkles,
  Info,
} from "lucide-react";
import surveyService from "../services/survey";
import authService, { type UserProfile } from "../services/auth";
import type {
  SurveyData,
  Place,
  AnalysisResult,
  AnalysisResultUI,
  HistorySurveyItem,
  RecommendationDisplay,
  DailyCheckinData,
  RollingStats,
  AlertItem,
} from "../types/survey";
import {
  DAILY_CHECKIN_INITIAL_STATE,
  OLBI_16_QUESTIONS,
  OLBI_16_INITIAL_STATE,
  DEFAULT_LIKERT_LABELS,
  DIMENSION_LABELS,
  TREND_LABELS,
  RISK_LEVEL_CONFIG,
  INDUSTRY_OPTIONS,
} from "../constants/survey";

// Likert 1-5 helper component
interface LikertScaleProps {
  value: number;
  onChange: (val: number) => void;
  labels?: [string, string, string, string, string];
  reverseColor?: boolean;
}

function LikertScale({
  value,
  onChange,
  labels = DEFAULT_LIKERT_LABELS,
  reverseColor = false,
}: LikertScaleProps) {
  const getButtonClass = (score: number) => {
    const isSelected = value === score;
    if (!isSelected) {
      return "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300";
    }

    if (reverseColor) {
      // 1 is bad (red), 5 is good (green)
      if (score === 1) return "bg-red-600 text-white border-red-600 shadow-sm";
      if (score === 2)
        return "bg-orange-500 text-white border-orange-500 shadow-sm";
      if (score === 3)
        return "bg-yellow-500 text-white border-yellow-500 shadow-sm";
      if (score === 4)
        return "bg-blue-600 text-white border-blue-600 shadow-sm";
      return "bg-green-600 text-white border-green-600 shadow-sm";
    }

    // Default: 1 is low risk (green), 5 is high risk (red)
    if (score === 1)
      return "bg-green-600 text-white border-green-600 shadow-sm";
    if (score === 2)
      return "bg-emerald-500 text-white border-emerald-500 shadow-sm";
    if (score === 3)
      return "bg-yellow-500 text-white border-yellow-500 shadow-sm";
    if (score === 4)
      return "bg-orange-500 text-white border-orange-500 shadow-sm";
    return "bg-red-600 text-white border-red-600 shadow-sm";
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`py-2.5 px-1 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center ${getButtonClass(
              score
            )}`}
          >
            <span>{score}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 px-1">
        <span className="max-w-[40%] text-left">{labels[0]}</span>
        <span className="font-medium text-gray-700">{labels[value - 1]}</span>
        <span className="max-w-[40%] text-right">{labels[4]}</span>
      </div>
    </div>
  );
}

export default function SurveyTest() {
  // Baseline loaded from profile
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Survey Mode State: "daily" (8 items) vs "olbi16" (16 items full test)
  const [surveyMode, setSurveyMode] = useState<"daily" | "olbi16">("daily");

  // Daily Check-in Form State
  const [dailyData, setDailyData] = useState<DailyCheckinData>({
    ...DAILY_CHECKIN_INITIAL_STATE,
  });

  // OLBI 16-Item Form State
  const [olbiData, setOlbiData] = useState({
    ...OLBI_16_INITIAL_STATE,
  });

  // Rolling stats & alerts
  const [rollingStats, setRollingStats] = useState<RollingStats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Address for recommendation
  const [address, setAddress] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Analysis, Submission & History States
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<SurveyData | null>(
    null
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultUI | null>(
    null
  );
  const [recommendations, setRecommendations] = useState<
    RecommendationDisplay[]
  >([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistorySurveyItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistorySurveyItem | null>(null);

  // Helper state updater functions for daily check-in
  const setExhaustion = (key: "e1" | "e2" | "e3", val: number) => {
    setDailyData((prev) => ({
      ...prev,
      exhaustion: { ...prev.exhaustion, [key]: val },
    }));
  };

  const setDisengagement = (key: "d1" | "d2" | "d3", val: number) => {
    setDailyData((prev) => ({
      ...prev,
      disengagement: { ...prev.disengagement, [key]: val },
    }));
  };

  const setJobDemands = (key: "jd1" | "jd2" | "jd3", val: number) => {
    setDailyData((prev) => ({
      ...prev,
      job_demands: { ...prev.job_demands, [key]: val },
    }));
  };

  const toggleOverloadReason = (reasonId: string) => {
    setDailyData((prev) => {
      const exists = prev.overload_reasons.includes(reasonId);
      return {
        ...prev,
        overload_reasons: exists
          ? prev.overload_reasons.filter((r) => r !== reasonId)
          : [...prev.overload_reasons, reasonId],
      };
    });
  };

  // Reverse Geocoding using OpenStreetMap Nominatim API (convert lat/lon to readable VN address)
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addrObj = data.address || {};
          const road =
            addrObj.road || addrObj.suburb || addrObj.pedestrian || "";
          const houseNumber = addrObj.house_number
            ? `${addrObj.house_number} `
            : "";
          const quarter =
            addrObj.quarter || addrObj.neighbourhood || addrObj.suburb || "";
          const district =
            addrObj.city_district || addrObj.district || addrObj.county || "";
          const city = addrObj.city || addrObj.state || addrObj.province || "";

          const parts = [
            (houseNumber + road).trim(),
            quarter,
            district,
            city,
          ].filter((p) => p && p.trim().length > 0);

          const formattedAddress =
            parts.length > 0 ? parts.join(", ") : data.display_name;

          setAddress(formattedAddress);
          setResolvedAddress(formattedAddress);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ lấy vị trí");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lon: longitude });

        // Reverse Geocode latitude & longitude into real address string
        await reverseGeocode(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        let message = "Không lấy được vị trí";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Không tìm thấy vị trí. Thử nhập địa chỉ thủ công.";
            break;
          case error.TIMEOUT:
            message = "Yêu cầu lấy vị trí hết giờ. Thử lại.";
            break;
        }
        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Convert backend AnalysisResult to UI format
  const convertToUIResult = (result: AnalysisResult): AnalysisResultUI => {
    return {
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      summary: result.summary,
      factors: result.factors,
      recommendations: result.recommendations,
      ai_insight: result.ai_insight,
    };
  };

  // Convert Place to RecommendationDisplay
  const convertToRecommendationDisplay = (
    place: Place
  ): RecommendationDisplay => {
    return {
      place_id: place.place_id,
      type: place.categories?.[0] || place.category || "place",
      name: place.name,
      address: place.address || "",
      distance: place.distance ? `${Math.round(place.distance)}m` : "N/A",
      description: place.reason || place.category || "",
      opening_hours: place.opening_hours,
      phone: place.phone,
      website: place.website,
      categories: place.categories,
    };
  };

  // Build full payload combining baseline and daily answers
  const buildPayload = (): SurveyData => {
    const stdHours = profile?.standard_working_hours_per_day ?? 8;
    const workDays = profile?.work_days_per_week ?? 5;
    const avgOt = profile?.average_overtime_hours_per_week ?? 0;
    const otToday = 0;

    if (surveyMode === "olbi16") {
      // Calculate 16-item OLBI mean scores with reverse items handled
      const e_vals = [
        olbiData.exhaustion.e1,
        olbiData.exhaustion.e2,
        6 - olbiData.exhaustion.e3, // reverse
        olbiData.exhaustion.e4,
        6 - olbiData.exhaustion.e5, // reverse
        olbiData.exhaustion.e6,
        6 - olbiData.exhaustion.e7, // reverse
        olbiData.exhaustion.e8,
      ];
      const e_mean = e_vals.reduce((a, b) => a + b, 0) / e_vals.length;

      const d_vals = [
        olbiData.disengagement.d1,
        6 - olbiData.disengagement.d2, // reverse
        olbiData.disengagement.d3,
        6 - olbiData.disengagement.d4, // reverse
        olbiData.disengagement.d5,
        6 - olbiData.disengagement.d6, // reverse
        olbiData.disengagement.d7,
        6 - olbiData.disengagement.d8, // reverse
      ];
      const d_mean = d_vals.reduce((a, b) => a + b, 0) / d_vals.length;

      return {
        sleep_hours: olbiData.sleep_hours,
        recovery_score: olbiData.recovery_score,
        quick_overload: 2,
        overload_reasons: [],

        exhaustion: {
          e1: e_mean,
          e2: e_mean,
          e3: e_mean,
        },
        disengagement: {
          d1: d_mean,
          d2: d_mean,
          d3: d_mean,
        },
        job_demands: {
          jd1: 3,
          jd2: 3,
          jd3: 3,
        },
        recovery: {
          sleep_hours: olbiData.sleep_hours,
          recovery_score: olbiData.recovery_score,
        },
        quick_overload_data: {
          rating: 2,
          reasons: [],
        },

        working_hours: stdHours,
        work_days_per_week: workDays,
        overtime_hours: Math.round(avgOt + otToday),
        has_deadline: "medium",
      };
    }

    const isHighJobDemands =
      dailyData.quick_overload >= 4 ||
      dailyData.job_demands.jd1 >= 4 ||
      dailyData.job_demands.jd2 >= 4 ||
      dailyData.job_demands.jd3 >= 4;

    const formattedReasons =
      isHighJobDemands ? dailyData.overload_reasons : [];

    return {
      sleep_hours: dailyData.sleep_hours,
      recovery_score: dailyData.recovery_score,
      quick_overload: dailyData.quick_overload,
      overload_reasons: formattedReasons,

      // STA structured groups (9 core items)
      exhaustion: {
        e1: dailyData.exhaustion.e1,
        e2: dailyData.exhaustion.e2,
        e3: dailyData.exhaustion.e3,
      },
      disengagement: {
        d1: dailyData.disengagement.d1,
        d2: dailyData.disengagement.d2,
        d3: dailyData.disengagement.d3,
      },
      job_demands: {
        jd1: dailyData.job_demands.jd1,
        jd2: dailyData.job_demands.jd2,
        jd3: dailyData.job_demands.jd3,
      },
      recovery: {
        sleep_hours: dailyData.sleep_hours,
        recovery_score: dailyData.recovery_score,
      },
      quick_overload_data: {
        rating: dailyData.quick_overload,
        reasons: formattedReasons,
      },

      // Work Baseline values sent for risk computation
      working_hours: stdHours,
      work_days_per_week: workDays,
      overtime_hours: Math.round(avgOt + otToday),
      has_deadline: "medium",
    };
  };

  // Submit survey - uses backend for analysis
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const payload = buildPayload();

      // Step 1: Call backend to analyze survey
      const analysis = await surveyService.analyze(payload);
      const uiResult = convertToUIResult(analysis);
      setAnalysisResult(uiResult);

      // Step 2: Location and place recommendations
      let coords: { lat: number; lon: number } | null = currentLocation;
      let latitude = coords?.lat || 0;
      let longitude = coords?.lon || 0;

      if (!latitude && !longitude && address) {
        const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        if (coordMatch) {
          latitude = parseFloat(coordMatch[1]);
          longitude = parseFloat(coordMatch[2]);
        } else {
          try {
            const geocodeData = await surveyService.geocode(address);
            if (geocodeData.success) {
              latitude = geocodeData.latitude;
              longitude = geocodeData.longitude;
            }
          } catch (err) {
            console.error("Geocode error:", err);
          }
        }
      }

      // Step 3: Get place recommendations if location is available
      if (latitude && longitude) {
        try {
          const placesResponse = await surveyService.getRecommendations({
            analysis_result: analysis,
            latitude,
            longitude,
            radius_meters: 5000,
            limit: 10,
            address,
          });
          setRecommendations(
            placesResponse.places.map(convertToRecommendationDisplay)
          );
        } catch (err) {
          console.error("Recommendations error:", err);
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }

      // Step 4: Save survey to backend
      await surveyService.saveSurvey(payload);
      await fetchHistory();

      try {
        const [statsRes, alertsRes] = await Promise.all([
          surveyService.getRollingStats(7),
          surveyService.getAlerts(),
        ]);
        setRollingStats(statsRes);
        setAlerts(alertsRes.alerts || []);
      } catch (err) {
        console.error("Lỗi cập nhật stats sau khi submit:", err);
      }

      setSubmittedPayload(payload);
      setSubmitted(true);
    } catch (err) {
      console.error("Survey submit error:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi phân tích"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset
  const handleReset = () => {
    setSubmitted(false);
    setSubmittedPayload(null);
    setAnalysisResult(null);
    setRecommendations([]);
    setError("");
  };

  // Fetch history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const historyData = await surveyService.getHistory();
      const transformedHistory: HistorySurveyItem[] = historyData
        .slice(0, 20)
        .map((item) => {
          const defaultSurvey: SurveyData = {
            sleep_hours: 7,
            working_hours: 8,
            overtime_hours: 0,
            has_deadline: "medium",
            work_days_per_week: 5,
            stress_level: 5,
            motivation_level: 5,
          };
          const surveyData = item.survey as SurveyData | undefined;
          return {
            id: item.id,
            assessment_id: item.assessment_id || item.id,
            user_id: item.user_id || "",
            completed_at: item.completed_at || item.created_at,
            created_at: item.created_at,
            status: (item.status as "in_progress" | "completed") || "completed",
            survey: surveyData || defaultSurvey,
            analysis_result: (item as any).analysis_result,
          };
        });
      setHistory(transformedHistory);
    } catch (err) {
      console.error("Survey history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-50 text-red-800 border-red-300";
      case "high":
        return "bg-orange-50 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-50 text-green-800 border-green-300";
    }
  };

  // Get recommendation icon based on category
  const getRecommendationIcon = (categories?: string[]) => {
    if (!categories) return <MapPin className="w-6 h-6 text-gray-600" />;
    const cats = categories.join(" ").toLowerCase();
    if (
      cats.includes("park") ||
      cats.includes("garden") ||
      cats.includes("forest")
    )
      return <TreePine className="w-6 h-6 text-green-600" />;
    if (cats.includes("cafe") || cats.includes("coffee"))
      return <Coffee className="w-6 h-6 text-amber-600" />;
    if (cats.includes("gym") || cats.includes("fitness"))
      return <Dumbbell className="w-6 h-6 text-red-600" />;
    if (cats.includes("library") || cats.includes("book"))
      return <BookOpen className="w-6 h-6 text-blue-600" />;
    if (cats.includes("spa") || cats.includes("massage"))
      return <Heart className="w-6 h-6 text-pink-600" />;
    return <MapPin className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl flex items-start gap-3 border ${
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-orange-50 border-orange-200 text-orange-800"
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">{alert.title}</h3>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.consecutive_days > 0 && (
                  <p className="text-xs mt-1 font-medium opacity-90">
                    Cảnh báo kéo dài: {alert.consecutive_days} ngày liên tiếp
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          Khảo sát trạng thái & Đánh giá sức khỏe tinh thần
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Đánh giá khoa học nguy cơ kiệt sức theo chuẩn OLBI & JD-R Model. Lựa
          chọn chế độ check-in hàng ngày hoặc bài test 16 câu định kỳ.
        </p>
      </div>

      {!submitted ? (
        <>
          {/* MODE SELECTOR TABS (Giải pháp 1: Chế độ Check-in Hàng ngày vs Bài Test OLBI 16 Câu Định Kỳ) */}
          <div className="bg-white rounded-2xl p-1.5 border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-1.5">
            <button
              type="button"
              onClick={() => setSurveyMode("daily")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                surveyMode === "daily"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              Check-in Hàng Ngày (9 câu • Chuẩn STA)
            </button>

            <button
              type="button"
              onClick={() => setSurveyMode("olbi16")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                surveyMode === "olbi16"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Đánh Giá Định Kỳ OLBI (16 câu • Chuẩn Khoa Học)
            </button>
          </div>

          {surveyMode === "olbi16" && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-indigo-950">
                  Chế độ Đánh giá Định kỳ & Chấm điểm Demo (Full OLBI 16 Items):
                </strong>
                <p className="mt-1 text-indigo-800">
                  Bài test này áp dụng trọn vẹn 16 câu hỏi Oldenburg Burnout
                  Inventory (8 câu Exhaustion + 8 câu Disengagement) đã được
                  kiểm chứng tâm lý học chuẩn quốc tế. Giảng viên / Giám khảo có
                  thể trải nghiệm test trực tiếp bất kỳ lúc nào để chấm điểm. Ở
                  sản phẩm thực tế, bài test này được khuyến nghị thực hiện 2
                  tuần / 1 tháng một lần để thiết lập điểm Baseline.
                </p>
              </div>
            </div>
          )}

          {/* Work Baseline Auto-sync Card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    Thông tin công việc nền:
                  </span>
                  <span className="text-sm text-blue-700 font-medium">
                    {profile?.job_title || "Chưa đặt chức danh"}
                  </span>
                  {profile?.industry_code && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      <span>{INDUSTRY_OPTIONS.find((o) => o.code === profile.industry_code)?.icon}</span>
                      <span>{INDUSTRY_OPTIONS.find((o) => o.code === profile.industry_code)?.label}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Chuẩn:{" "}
                  <strong>
                    {profile?.standard_working_hours_per_day ?? 8}h/ngày
                  </strong>{" "}
                  •{" "}
                  <strong>{profile?.work_days_per_week ?? 5} ngày/tuần</strong>{" "}
                  • Tăng ca thường lệ:{" "}
                  <strong>
                    {profile?.average_overtime_hours_per_week ?? 0}h/tuần
                  </strong>
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm shrink-0 transition-colors"
            >
              Cập nhật hồ sơ
            </Link>
          </div>

          {/* Survey Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
            {surveyMode === "olbi16" ? (
              /* FORM 16 CÂU OLBI FULL VALIDATED */
              <div className="space-y-8">
                {/* SECTION 1: Exhaustion (8 items) */}
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        1. Chiều Cạn Kiệt Năng Lượng (OLBI Exhaustion Scale - 8
                        câu)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Đánh giá sự tiêu hao thể chất và cạn kiệt năng lượng
                        tinh thần sau giờ làm.
                      </p>
                    </div>
                  </div>

                  {OLBI_16_QUESTIONS.exhaustion.map((q, idx) => (
                    <div
                      key={q.key}
                      className="space-y-2 p-3 bg-gray-50/60 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-800">
                          {idx + 1}. {q.text}
                        </label>
                        {q.reverse && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">
                            Câu tích cực (Đảo điểm)
                          </span>
                        )}
                      </div>
                      <LikertScale
                        value={
                          olbiData.exhaustion[
                            q.key as keyof typeof olbiData.exhaustion
                          ]
                        }
                        onChange={(val) =>
                          setOlbiData((prev) => ({
                            ...prev,
                            exhaustion: { ...prev.exhaustion, [q.key]: val },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* SECTION 2: Disengagement (8 items) */}
                <div className="space-y-5 pt-2">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        2. Chiều Mất Gắn Kết Công Việc (OLBI Disengagement Scale
                        - 8 câu)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Đánh giá mức độ hào hứng, thái độ và sự gắn bó đối với
                        công việc hiện tại.
                      </p>
                    </div>
                  </div>

                  {OLBI_16_QUESTIONS.disengagement.map((q, idx) => (
                    <div
                      key={q.key}
                      className="space-y-2 p-3 bg-gray-50/60 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-800">
                          {idx + 1}. {q.text}
                        </label>
                        {q.reverse && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">
                            Câu tích cực (Đảo điểm)
                          </span>
                        )}
                      </div>
                      <LikertScale
                        value={
                          olbiData.disengagement[
                            q.key as keyof typeof olbiData.disengagement
                          ]
                        }
                        onChange={(val) =>
                          setOlbiData((prev) => ({
                            ...prev,
                            disengagement: {
                              ...prev.disengagement,
                              [q.key]: val,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* SECTION 3: Sleep & Recovery */}
                <div className="space-y-5 pt-2">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        3. Giấc ngủ & Hồi phục năng lượng (Sleep & Recovery)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Thời lượng ngủ và chất lượng hồi phục sau thời gian nghỉ
                        ngơi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Số giờ ngủ đêm qua:{" "}
                        <span className="font-bold text-blue-600">
                          {olbiData.sleep_hours} giờ
                        </span>
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="12"
                        step="0.5"
                        value={olbiData.sleep_hours}
                        onChange={(e) =>
                          setOlbiData((prev) => ({
                            ...prev,
                            sleep_hours: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>3 giờ</span>
                        <span>7-8 giờ (khuyên nghị)</span>
                        <span>12 giờ</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Cảm nhận hồi phục sau giấc ngủ/nghỉ ngơi
                      </label>
                      <LikertScale
                        value={olbiData.recovery_score}
                        onChange={(val) =>
                          setOlbiData((prev) => ({
                            ...prev,
                            recovery_score: val,
                          }))
                        }
                        labels={[
                          "Rất mệt mỏi",
                          "Mệt mỏi nhẹ",
                          "Bình thường",
                          "Khá thoải mái",
                          "Rất sảng khoái/Tốt",
                        ]}
                        reverseColor={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* FORM 9 CÂU CHECK-IN HÀNG NGÀY (CHUẨN KHOA HỌC STA) */
              <>
                {/* SECTION 1: Năng lượng & Gắn kết (Exhaustion & Disengagement) */}
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        1. Năng lượng & Gắn kết (Exhaustion & Disengagement)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Đánh giá mức độ tiêu hao năng lượng và thái độ với công
                        việc theo thang đo OLBI.
                      </p>
                    </div>
                  </div>

                  {/* E1 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      E1. Hôm nay tôi cảm thấy khó duy trì năng lượng để tiếp tục công việc.
                    </label>
                    <LikertScale
                      value={dailyData.exhaustion.e1}
                      onChange={(val) => setExhaustion("e1", val)}
                    />
                  </div>

                  {/* E2 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      E2. Hôm nay công việc khiến tôi cảm thấy mình đã tiêu hao rất nhiều năng lượng.
                    </label>
                    <LikertScale
                      value={dailyData.exhaustion.e2}
                      onChange={(val) => setExhaustion("e2", val)}
                    />
                  </div>

                  {/* E3 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      E3. Sau khi kết thúc công việc hôm nay, tôi vẫn khó lấy lại sức.
                    </label>
                    <LikertScale
                      value={dailyData.exhaustion.e3}
                      onChange={(val) => setExhaustion("e3", val)}
                    />
                  </div>

                  {/* D1 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      D1. Hôm nay tôi muốn tránh hoặc hạn chế những việc liên quan đến công việc.
                    </label>
                    <LikertScale
                      value={dailyData.disengagement.d1}
                      onChange={(val) => setDisengagement("d1", val)}
                    />
                  </div>

                  {/* D2 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      D2. Hôm nay tôi cảm thấy mình ít quan tâm đến công việc hơn bình thường.
                    </label>
                    <LikertScale
                      value={dailyData.disengagement.d2}
                      onChange={(val) => setDisengagement("d2", val)}
                    />
                  </div>

                  {/* D3 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      D3. Hôm nay tôi cảm thấy công việc của mình ít có ý nghĩa hơn bình thường.
                    </label>
                    <LikertScale
                      value={dailyData.disengagement.d3}
                      onChange={(val) => setDisengagement("d3", val)}
                    />
                  </div>
                </div>

                {/* SECTION 2: Áp lực công việc (Job Demands) */}
                <div className="space-y-5 pt-2">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        2. Áp lực công việc (Job Demands)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Đánh giá khối lượng công việc, áp lực thời gian và mức độ đa nhiệm trong ngày theo mô hình JD-R.
                      </p>
                    </div>
                  </div>

                  {/* JD1 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      JD1. Hôm nay tôi có quá nhiều việc phải hoàn thành.{" "}
                      <span className="text-xs text-gray-500 font-normal">(Khối lượng công việc)</span>
                    </label>
                    <LikertScale
                      value={dailyData.job_demands.jd1}
                      onChange={(val) => setJobDemands("jd1", val)}
                    />
                  </div>

                  {/* JD2 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      JD2. Hôm nay tôi phải hoàn thành công việc trong thời gian quá ngắn.{" "}
                      <span className="text-xs text-gray-500 font-normal">(Áp lực thời gian)</span>
                    </label>
                    <LikertScale
                      value={dailyData.job_demands.jd2}
                      onChange={(val) => setJobDemands("jd2", val)}
                    />
                  </div>

                  {/* JD3 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      JD3. Hôm nay tôi phải xử lý nhiều việc cùng lúc.{" "}
                      <span className="text-xs text-gray-500 font-normal">(Đa nhiệm / task switching)</span>
                    </label>
                    <LikertScale
                      value={dailyData.job_demands.jd3}
                      onChange={(val) => setJobDemands("jd3", val)}
                    />
                  </div>
                </div>

                {/* SECTION 3: SLEEP & RECOVERY */}
                <div className="space-y-5 pt-2">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        3. Giấc ngủ & Hồi phục năng lượng (Sleep & Recovery)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Thời lượng ngủ và chất lượng hồi phục sau thời gian nghỉ
                        ngơi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sleep hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Số giờ ngủ đêm qua:{" "}
                        <span className="font-bold text-blue-600">
                          {dailyData.sleep_hours} giờ
                        </span>
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="12"
                        step="0.5"
                        value={dailyData.sleep_hours}
                        onChange={(e) =>
                          setDailyData((prev) => ({
                            ...prev,
                            sleep_hours: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>3 giờ</span>
                        <span>7-8 giờ (khuyên nghị)</span>
                        <span>12 giờ</span>
                      </div>
                    </div>

                    {/* Recovery score */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-2">
                        Cảm nhận hồi phục sau giấc ngủ/nghỉ ngơi
                      </label>
                      <LikertScale
                        value={dailyData.recovery_score}
                        onChange={(val) =>
                          setDailyData((prev) => ({
                            ...prev,
                            recovery_score: val,
                          }))
                        }
                        labels={[
                          "Rất mệt mỏi",
                          "Mệt mỏi nhẹ",
                          "Bình thường",
                          "Khá thoải mái",
                          "Rất sảng khoái/Tốt",
                        ]}
                        reverseColor={true}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: QUICK OVERLOAD CHECK */}
                <div className="space-y-5 pt-2">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        4. Đánh giá quá tải (Quick Overload Check)
                      </h2>
                      <p className="text-xs text-gray-500">
                        Tự đánh giá cảm giác chịu tải trong ngày hôm nay.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Hôm nay công việc có khiến bạn cảm thấy quá tải không?
                    </label>
                    <LikertScale
                      value={dailyData.quick_overload}
                      onChange={(val) =>
                        setDailyData((prev) => ({
                          ...prev,
                          quick_overload: val,
                        }))
                      }
                      labels={[
                        "Hoàn toàn không",
                        "Rất ít",
                        "Thỉnh thoảng / Vừa phải",
                        "Quá tải nhiều",
                        "Quá tải nghiêm trọng",
                      ]}
                    />
                  </div>

                  {/* Dynamic Branching if Overload >= 4 or Job Demands >= 4 (theo chuẩn STA) */}
                  {(dailyData.quick_overload >= 4 ||
                    dailyData.job_demands.jd1 >= 4 ||
                    dailyData.job_demands.jd2 >= 4 ||
                    dailyData.job_demands.jd3 >= 4) && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 transition-all animate-fadeIn">
                      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Nguyên nhân chính khiến bạn cảm thấy quá tải hôm nay là
                        gì? (Chọn tất cả nguyên nhân phù hợp)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {[
                          "Quá nhiều việc",
                          "Áp lực deadline gấp",
                          "Xử lý nhiều việc cùng lúc",
                          "Thiếu sự hỗ trợ từ đồng nghiệp/cấp trên",
                          "Khó chủ động / Bị động trong công việc",
                          "Khác",
                        ].map((reason) => {
                          const isChecked =
                            dailyData.overload_reasons.includes(reason);
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => toggleOverloadReason(reason)}
                              className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                                isChecked
                                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-amber-100/50"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                                  isChecked
                                    ? "bg-white text-amber-700 border-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {isChecked ? "✓" : ""}
                              </span>
                              {reason}
                            </button>
                          );
                        })}
                      </div>

                      {/* Input for "Khác" reason */}
                      {dailyData.overload_reasons.includes("Khác") && (
                        <div className="pt-3 border-t border-amber-200/60 space-y-1.5 animate-fadeIn">
                          <div className="flex items-center justify-between text-xs">
                            <label className="font-semibold text-amber-900">
                              Chia sẻ cụ thể nguyên nhân khác khiến bạn quá tải:
                            </label>
                            <span
                              className={`font-mono text-[11px] ${
                                (dailyData.other_overload_reason?.length ||
                                  0) >= 180
                                  ? "text-red-600 font-bold"
                                  : "text-amber-700/80"
                              }`}
                            >
                              {dailyData.other_overload_reason?.length || 0}/200
                              ký tự
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            maxLength={200}
                            value={dailyData.other_overload_reason || ""}
                            onChange={(e) =>
                              setDailyData((prev) => ({
                                ...prev,
                                other_overload_reason: e.target.value,
                              }))
                            }
                            placeholder="Ví dụ: Sự cố kỹ thuật phát sinh bất ngờ, khách hàng phàn nàn liên tục khiến tôi phải xử lý gấp đến tối..."
                            className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none leading-relaxed transition-all shadow-sm"
                          />
                          <p className="text-[11px] text-gray-500 italic">
                            * Tối đa 200 ký tự (khoảng 30-40 từ), tóm gọn 1-2
                            câu để AI dễ dàng trích xuất bối cảnh hỗ trợ bạn.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* SECTION 5: LOCATION FOR PLACES */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-gray-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Vị trí của bạn (tùy chọn - để gợi ý địa điểm nghỉ ngơi, thư
                  giãn gần nhất)
                </div>
              </label>

              {/* GPS Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {locationLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang xác định vị trí...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    Lấy vị trí hiện tại qua GPS
                  </>
                )}
              </button>

              {locationError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  {locationError}
                </div>
              )}

              {currentLocation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>
                    Đã định vị: {currentLocation.lat.toFixed(5)},{" "}
                    {currentLocation.lon.toFixed(5)}
                  </span>
                </div>
              )}

              <input
                type="text"
                placeholder="Hoặc nhập địa chỉ: ví dụ 786 Nguyễn Kiệm, Gò Vấp, TP.HCM"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang phân tích khoa học & tìm gợi ý...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Hoàn tất khảo sát & Nhận phân tích
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        /* RESULTS VIEW */
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">
              Khảo sát trạng thái đã hoàn tất và được ghi nhận thành công!
            </span>
          </div>

          {/* Analysis Result Card */}
          {analysisResult && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Kết quả đánh giá trạng thái
              </h2>

              {/* Risk Level Banner */}
              <div
                className={`p-4 rounded-xl border ${getRiskColor(
                  analysisResult.risk_level
                )}`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-wider text-sm">
                    {analysisResult.risk_level === "critical"
                      ? "Nguy cơ nghiêm trọng"
                      : analysisResult.risk_level === "high"
                      ? "Nguy cơ kiệt sức cao"
                      : analysisResult.risk_level === "medium"
                      ? "Nguy cơ trung bình"
                      : "Trạng thái ổn định / Nguy cơ thấp"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              {/* AI Insight Card (Gemini AI Qualitative Analysis) */}
              {analysisResult.ai_insight && (
                <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-700/50 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-white flex items-center gap-2">
                          Nhận định chuyên sâu từ AI Wellbeing Companion
                        </h3>
                        <p className="text-xs text-indigo-200">
                          Diễn giải bối cảnh tự nhiên & cá nhân hóa dựa trên dữ liệu khảo sát
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-800/60 text-indigo-200 border border-indigo-700/50">
                      AI Qualitative Narrative
                    </span>
                  </div>

                  {/* Current State Narrative */}
                  {analysisResult.ai_insight.current_state_text && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        📌 Trạng thái hiện tại
                      </h4>
                      <p className="text-sm text-indigo-100 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10">
                        {analysisResult.ai_insight.current_state_text}
                      </p>
                    </div>
                  )}

                  {/* Observed Changes */}
                  {analysisResult.ai_insight.change_text && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                        📈 Thay đổi đáng chú ý
                      </h4>
                      <p className="text-sm text-indigo-100 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10">
                        {analysisResult.ai_insight.change_text}
                      </p>
                    </div>
                  )}

                  {/* Contributing Factors Narrative */}
                  {analysisResult.ai_insight.contributing_factors_text && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        💡 Yếu tố có thể liên quan
                      </h4>
                      <p className="text-sm text-indigo-100 leading-relaxed font-normal bg-white/5 p-3.5 rounded-xl border border-white/10">
                        {analysisResult.ai_insight.contributing_factors_text}
                      </p>
                    </div>
                  )}

                  {/* Reflection & Action Prompt Card */}
                  {analysisResult.ai_insight.reflection_question && (
                    <div className="mt-4 pt-4 border-t border-indigo-800/80 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-4 rounded-xl border border-amber-400/20 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-amber-300 block">
                            Gợi mở suy ngẫm cùng AI (Personalized Reflection)
                          </span>
                          <p className="text-sm text-white italic font-medium">
                            "{analysisResult.ai_insight.reflection_question}"
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          to={`/chat?prompt=${encodeURIComponent(
                            analysisResult.ai_insight.suggested_chat_prompt ||
                              analysisResult.ai_insight.reflection_question
                          )}&source=survey`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md transition-all transform hover:-translate-y-0.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Khám phá & Trò chuyện sâu cùng AI Companion
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rolling Stats Card */}
              {rollingStats && (
                <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Xu hướng 7 ngày gần nhất
                    </h3>
                    <span className="text-xs bg-white px-2 py-1 rounded border shadow-sm text-gray-600">
                      {rollingStats.total_surveys} lần khảo sát
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Object.entries(rollingStats.dimensions).map(
                      ([key, stat]) => {
                        const labelInfo =
                          DIMENSION_LABELS[
                            key as keyof typeof DIMENSION_LABELS
                          ];
                        const trendInfo = TREND_LABELS[stat.trend];
                        return (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              {labelInfo?.icon} {labelInfo?.label}
                            </span>
                            <div className="flex items-end gap-2">
                              <span className="text-xl font-bold text-gray-900">
                                {stat.average !== null
                                  ? stat.average.toFixed(1)
                                  : "-"}
                              </span>
                              <span
                                className={`text-xs font-medium pb-0.5 flex items-center gap-0.5 ${trendInfo?.color}`}
                              >
                                {trendInfo?.icon} {trendInfo?.label}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Dimensions Summary Grid */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Tổng quan các chỉ số trong ngày:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-gray-500">Giấc ngủ</p>
                    <p className="text-lg font-bold text-blue-700">
                      {submittedPayload?.sleep_hours} giờ
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs text-gray-500">Hồi phục</p>
                    <p className="text-lg font-bold text-purple-700">
                      {dailyData.recovery_score}/5
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-gray-500">Quá tải</p>
                    <p className="text-lg font-bold text-amber-700">
                      {dailyData.quick_overload}/5
                    </p>
                  </div>
                </div>

                {/* Overload Reasons Pill List */}
                {dailyData.quick_overload >= 4 &&
                  dailyData.overload_reasons.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                      <span className="text-xs font-semibold text-amber-900 block mb-1.5">
                        Nguyên nhân quá tải đã chọn:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dailyData.overload_reasons.map((r) => {
                          const isOther = r === "Khác";
                          const label =
                            isOther && dailyData.other_overload_reason?.trim()
                              ? `Khác: "${dailyData.other_overload_reason.trim()}"`
                              : r;
                          return (
                            <span
                              key={r}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Factors */}
              {analysisResult.factors && analysisResult.factors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Các yếu tố rủi ro ghi nhận:
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.factors.map((factor, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border bg-gray-50/70 border-gray-200 text-sm flex items-start gap-3"
                      >
                        <span
                          className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold ${
                            factor.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : factor.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {factor.severity}
                        </span>
                        <div>
                          <strong className="text-gray-900">
                            {factor.title}
                          </strong>
                          :{" "}
                          <span className="text-gray-600">
                            {factor.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations &&
                analysisResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Khuyến nghị cải thiện:
                    </h3>
                    <div className="space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-amber-900">
                              {rec.title}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                              Ưu tiên: {rec.priority}
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Place Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Địa điểm gợi ý thư giãn gần bạn{" "}
                {address ? `("${address}")` : ""}
              </h2>

              <div className="space-y-3">
                {recommendations.map((place, i) => (
                  <div
                    key={place.place_id || i}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        {getRecommendationIcon(place.categories)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
                            {place.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {place.distance ? `${place.distance}` : ""}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {place.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {place.address}
                        </p>
                        {place.description && (
                          <div className="mt-2 p-2 bg-blue-50/60 rounded-lg text-xs text-blue-800">
                            💡 <strong>Gợi ý:</strong> {place.description}
                          </div>
                        )}
                        <div className="flex gap-4 mt-2">
                          {place.phone && (
                            <a
                              href={`tel:${place.phone}`}
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {place.phone}
                            </a>
                          )}
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Khảo sát lại
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Cập nhật lại kết quả
            </button>
          </div>
        </div>
      )}

      {/* History Accordion */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory && history.length === 0) {
              fetchHistory();
            }
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-900">
              Lịch sử các lần khảo sát
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {history.length}
            </span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-gray-100">
            {loadingHistory ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Chưa có lịch sử khảo sát nào
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {history.map((item) => {
                  const s = item.survey;
                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                            Ngủ: {s.sleep_hours}h
                          </span>
                          {s.recovery_score && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                              Hồi phục: {s.recovery_score}/5
                            </span>
                          )}
                          {s.quick_overload && (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                              Quá tải: {s.quick_overload}/5
                            </span>
                          )}
                          {s.stress_level !== undefined && (
                            <span className="text-xs text-gray-500">
                              Stress: {s.stress_level}/10
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.completed_at
                            ? new Date(item.completed_at).toLocaleString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Detail Modal */}
      {selectedHistoryItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-gray-900">
                Chi tiết khảo sát
              </h2>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedHistoryItem.completed_at
                  ? new Date(selectedHistoryItem.completed_at).toLocaleString(
                      "vi-VN"
                    )
                  : "N/A"}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">Giờ ngủ</span>
                  <p className="text-base font-bold text-blue-600">
                    {selectedHistoryItem.survey.sleep_hours} giờ
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500">Áp lực deadline</span>
                  <p className="text-base font-bold text-gray-800 capitalize">
                    {selectedHistoryItem.survey.has_deadline || "Trung bình"}
                  </p>
                </div>
                {selectedHistoryItem.survey.recovery_score && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-500">Điểm hồi phục</span>
                    <p className="text-base font-bold text-purple-600">
                      {selectedHistoryItem.survey.recovery_score}/5
                    </p>
                  </div>
                )}
                {selectedHistoryItem.survey.quick_overload && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-500">
                      Mức độ quá tải
                    </span>
                    <p className="text-base font-bold text-amber-600">
                      {selectedHistoryItem.survey.quick_overload}/5
                    </p>
                  </div>
                )}
              </div>

              {/* Overload Reasons in History if present */}
              {selectedHistoryItem.survey.overload_reasons &&
                selectedHistoryItem.survey.overload_reasons.length > 0 && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1.5">
                    <span className="font-semibold text-amber-900 block">
                      Nguyên nhân quá tải đã chọn:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedHistoryItem.survey.overload_reasons.map(
                        (r, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200"
                          >
                            {r}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Analysis Result if present */}
              {selectedHistoryItem.analysis_result && (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-xl border ${getRiskColor(
                      selectedHistoryItem.analysis_result.risk_level
                    )}`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Nguy cơ: {selectedHistoryItem.analysis_result.risk_level}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed">
                      {selectedHistoryItem.analysis_result.summary}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 text-sm rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
