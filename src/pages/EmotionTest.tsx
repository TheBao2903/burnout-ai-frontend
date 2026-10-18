// ==========================================
// Emotion Test Page - Full UI với đầy đủ data
// ==========================================

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Heart,
  Save,
  History,
  ChevronDown,
  ChevronUp,
  Camera,
  CameraOff,
  CloudUpload,
  Sparkles,
  User,
  Brain,
  AlertTriangle,
  ThumbsUp,
  Info,
  X,
  Eye,
  Clock,
} from "lucide-react";
import emotionService from "../services/emotion";
import type { FullResult, HistoryItem } from "../types/emotion";

const EMOTION_ICONS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  neutral: "😐",
  fear: "😨",
  angry: "😠",
  surprise: "😲",
  disgust: "🤢",
};

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
  can_theo_doi: "bg-blue-100 text-blue-700 border-blue-300",
};

const RISK_LABELS: Record<string, string> = {
  low: "Tín hiệu ổn định / Tích cực",
  medium: "Cần theo dõi nhẹ",
  high: "Tín hiệu mệt mỏi / Cần lưu ý",
  critical: "Tín hiệu căng thẳng cao",
  can_theo_doi: "Cần theo dõi thêm",
};

export default function EmotionTest() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FullResult | null>(null);

  // Options
  const [saveImage, setSaveImage] = useState(true);
  const [generateAI, setGenerateAI] = useState(true);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Load history and preload image URLs
  useEffect(() => {
    setLoadingHistory(true);
    emotionService
      .getHistory()
      .then((data) => {
        setHistory(data);

        // Build image URLs from keys (sync operation)
        const urls: Record<string, string> = {};
        data
          .filter((item) => item.image_key || item.image_url)
          .forEach((item) => {
            const imageKey = item.image_key || item.image_url;
            if (imageKey) {
              const url = emotionService.getImageUrl(imageKey);
              if (url) {
                urls[imageKey] = url;
              }
            }
          });
        setImageUrls(urls);
      })
      .catch((err) => console.error("History error:", err))
      .finally(() => setLoadingHistory(false));
  }, []);

  // Camera effect
  useEffect(() => {
    if (!cameraOpen) return;

    setCameraLoading(true);
    setCameraError("");

    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraLoading(false);
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setCameraError("Không thể truy cập camera.");
        setCameraOpen(false);
        setCameraLoading(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOpen]);

  // Process file
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setResult(null);
    setCameraOpen(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          processFile(file);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  // Analyze emotion
  const analyzeEmotion = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resultData = await emotionService.analyzeEmotion(selectedFile, {
        saveImage,
        generateAI,
      });
      setResult(resultData);
      // Refresh history
      emotionService.getHistory().then(setHistory).catch(console.error);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get emotion bar color
  const getEmotionBar = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-gray-300";
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-7 h-7 text-pink-500" />
          Đo cảm xúc khuôn mặt (Facial Emotion AI)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Nhận diện biểu cảm qua DeepFace – Đóng vai trò là Tín hiệu hỗ trợ bối cảnh (Supporting Signal)
        </p>
      </div>

      {/* Scientific Supporting Signal Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Lưu ý khoa học (Supporting Signal)</strong>: Dữ liệu nhận diện cảm xúc khuôn mặt được hệ thống sử dụng làm <em>tín hiệu hỗ trợ bối cảnh</em> để đối chiếu đa chiều với khảo sát trạng thái (OLBI) và hội thoại. Hệ thống <strong>không</strong> dùng biểu cảm khuôn mặt đơn lẻ để chẩn đoán hay kết luận mức độ kiệt sức (Burnout).
        </div>
      </div>

      {/* Camera Section */}
      {cameraOpen && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-medium flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Preview
              {cameraLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </h2>
            <button
              onClick={() => setCameraOpen(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <CameraOff className="w-4 h-4" /> Đóng
            </button>
          </div>

          {cameraError && (
            <div className="p-4 bg-red-50 text-red-600 text-center">
              {cameraError}
            </div>
          )}

          {!cameraError && (
            <>
              <div
                className="relative bg-black"
                style={{ aspectRatio: "16/9" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  controls
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                {cameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-4">
                <button
                  onClick={capturePhoto}
                  disabled={cameraLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" /> Chụp ảnh
                </button>
                <button
                  onClick={() => setCameraOpen(false)}
                  className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Hủy
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!cameraOpen && !previewUrl && (
        <>
          <div
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">
              Kéo thả ảnh hoặc click để chọn
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)
            </p>
          </div>
          <button
            onClick={() => setCameraOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700"
          >
            <Camera className="w-5 h-5" /> Mở Camera
          </button>
        </>
      )}

      {/* Preview & Options */}
      {previewUrl && !cameraOpen && !result && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ảnh đã chọn</p>
                <p className="text-sm font-medium">{selectedFile?.name}</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4" /> Đổi ảnh
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl space-y-3">
              <p className="text-sm font-medium text-gray-700">Tùy chọn:</p>
              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg">
                <input
                  type="checkbox"
                  checked={saveImage}
                  onChange={(e) => setSaveImage(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-sm font-medium">Lưu ảnh</span>
                    <p className="text-xs text-gray-500">
                      Upload lên Cloudflare R2
                    </p>
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg">
                <input
                  type="checkbox"
                  checked={generateAI}
                  onChange={(e) => setGenerateAI(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="text-sm font-medium">Đánh giá tín hiệu AI</span>
                    <p className="text-xs text-gray-500">Trích xuất tín hiệu hỗ trợ</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !result && (
        <button
          onClick={analyzeEmotion}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" /> Phân tích cảm xúc
            </>
          )}
        </button>
      )}

      {/* ===== KẾT QUẢ ĐẦY ĐỦ ===== */}
      {result && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-5 h-5" />
            Phân tích thành công!{" "}
            {result.saved_to_r2 ? "✓ Ảnh đã lưu vào hệ thống" : ""}
          </div>

          {/* Emotion + Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" /> Kết quả phân tích
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Emotion Results */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-5xl">
                    {EMOTION_ICONS[result.emotion.dominant_emotion] || "❓"}
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Cảm xúc chính</p>
                    <p className="text-2xl font-bold capitalize">
                      {result.emotion.dominant_emotion}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500">Độ tin cậy</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(result.emotion.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {/* Emotion Bars */}
                <div className="space-y-2">
                  {Object.entries(result.emotion.emotions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, value]) => (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="text-xl w-6">
                          {EMOTION_ICONS[emotion] || "❓"}
                        </span>
                        <span className="w-16 text-sm capitalize">
                          {emotion}
                        </span>
                        <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getEmotionBar(
                              value
                            )}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-gray-500 text-right">
                          {value.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Thông tin</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Tuổi: <strong>{result.emotion.age || "N/A"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        Giới tính:{" "}
                        <strong>{result.emotion.gender || "N/A"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {result.assessment && (
                  <div
                    className={`p-4 rounded-xl border ${
                      RISK_COLORS[result.assessment.risk_level] ||
                      RISK_COLORS.low
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold uppercase">
                        {RISK_LABELS[result.assessment.risk_level] || result.assessment.risk_level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tín hiệu bối cảnh hỗ trợ (Supporting Signal)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Card */}
          {result.assessment && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> Đánh giá tín hiệu cảm xúc (Supporting Signal Assessment)
              </h2>

              {/* Risk Level Banner */}
              <div
                className={`p-4 rounded-xl border mb-4 ${
                  RISK_COLORS[result.assessment.risk_level] || RISK_COLORS.low
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold uppercase text-base">
                    {RISK_LABELS[result.assessment.risk_level] || result.assessment.risk_level}
                  </span>
                  <span className="text-xs text-gray-600">
                    (Tín hiệu đối chiếu biểu cảm)
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Tổng quan
                </h3>
                <p className="text-gray-700">{result.assessment.summary}</p>
              </div>

              {/* Key Signals */}
              {result.assessment.key_signals &&
                result.assessment.key_signals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Dấu hiệu chính
                    </h3>
                    <ul className="space-y-1">
                      {result.assessment.key_signals.map((signal, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-blue-500">•</span>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Recommendations */}
              {result.assessment.recommendations &&
                result.assessment.recommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" /> Khuyến nghị
                    </h3>
                    <ul className="space-y-2">
                      {result.assessment.recommendations.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-sm"
                        >
                          <span className="text-green-600 font-bold">
                            {i + 1}.
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Disclaimer */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    {result.assessment.disclaimer}
                  </p>
                </div>
              </div>

              {/* AI Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                AI Model: {result.assessment.ai_model || "N/A"} | Version:{" "}
                {result.assessment.ai_prompt_version || "N/A"}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={analyzeEmotion}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" /> Phân tích lại
            </button>
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
            >
              <Save className="w-5 h-5" /> Ảnh mới
            </button>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Lịch sử phân tích</span>
            <span className="text-sm text-gray-500">({history.length})</span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t">
            {loadingHistory ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có lịch sử
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {history.map((item, i) => {
                  const dominantEmotion = item.dominant_emotion || "unknown";
                  const confidence = item.confidence ?? 0;
                  const analyzedAt = item.analyzed_at || "";

                  return (
                    <div
                      key={item.id || i}
                      className="p-4 hover:bg-gray-50 flex items-center gap-4"
                    >
                      {imageUrls[item.image_key || item.image_url || ''] ? (
                        <img
                          src={imageUrls[item.image_key || item.image_url || '']}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {EMOTION_ICONS[dominantEmotion] || "❓"}
                          </span>
                          <span className="font-medium capitalize">
                            {dominantEmotion}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(analyzedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Detail Modal */}
      {selectedHistoryItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Chi tiết phân tích</h2>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image & Basic Info */}
              <div className="flex items-start gap-6">
                {imageUrls[selectedHistoryItem.image_key || selectedHistoryItem.image_url || ''] ? (
                  <img
                    src={imageUrls[selectedHistoryItem.image_key || selectedHistoryItem.image_url || '']}
                    alt=""
                    className="w-40 h-40 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  {/* Dominant Emotion */}
                  <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                    <span className="text-5xl">
                      {EMOTION_ICONS[selectedHistoryItem.dominant_emotion] ||
                        "❓"}
                    </span>
                    <div>
                      <p className="text-sm text-gray-500">Cảm xúc chính</p>
                      <p className="text-2xl font-bold capitalize">
                        {selectedHistoryItem.dominant_emotion}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm text-gray-500">Độ tin cậy</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(selectedHistoryItem.confidence * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-500">Tuổi</span>
                      </div>
                      <p className="text-lg font-bold mt-1">
                        {selectedHistoryItem.age || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-500">Giới tính</span>
                      </div>
                      <p className="text-lg font-bold mt-1">
                        {selectedHistoryItem.gender || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Thời gian phân tích</span>
                    </div>
                    <p className="font-medium mt-1">
                      {formatDate(selectedHistoryItem.analyzed_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emotion Bars */}
              <div className="p-4 bg-white border rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" /> Biểu đồ cảm xúc
                  chi tiết
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedHistoryItem.emotions || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, value]) => {
                      const isHighest =
                        emotion === selectedHistoryItem.dominant_emotion;
                      return (
                        <div key={emotion} className="flex items-center gap-3">
                          <span className="text-2xl w-8">
                            {EMOTION_ICONS[emotion] || "❓"}
                          </span>
                          <span className="w-20 text-sm capitalize">
                            {emotion}
                          </span>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isHighest
                                  ? value >= 80
                                    ? "bg-green-500"
                                    : value >= 40
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${Math.max(value, 1)}%` }}
                            />
                          </div>
                          <span className="w-14 text-sm font-medium text-right">
                            {value.toFixed(1)}%
                          </span>
                          {isHighest && (
                            <span className="text-xs text-green-600 font-medium">
                              Chính
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* AI Assessment Section */}
              {selectedHistoryItem.assessment ? (
                <div className="p-4 bg-white border rounded-xl space-y-4">
                  {/* Risk Level */}
                  <div
                    className={`p-4 rounded-xl border ${
                      RISK_COLORS[selectedHistoryItem.assessment.risk_level] ||
                      RISK_COLORS.low
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold uppercase">
                        {RISK_LABELS[selectedHistoryItem.assessment.risk_level] || selectedHistoryItem.assessment.risk_level}
                      </span>
                      <span className="text-sm">
                        {selectedHistoryItem.assessment.risk_level === 'can_theo_doi'
                          ? 'Cần theo dõi thêm'
                          : 'Nguy cơ Burnout'}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedHistoryItem.assessment.summary && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Tổng quan
                      </h3>
                      <p className="text-gray-700">
                        {selectedHistoryItem.assessment.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Signals */}
                  {selectedHistoryItem.assessment.key_signals &&
                    selectedHistoryItem.assessment.key_signals.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Dấu hiệu chính
                        </h3>
                        <ul className="space-y-1">
                          {selectedHistoryItem.assessment.key_signals.map(
                            (signal, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <span className="text-blue-500">•</span>
                                {signal}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Recommendations */}
                  {selectedHistoryItem.assessment.recommendations &&
                    selectedHistoryItem.assessment.recommendations.length >
                      0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4" /> Khuyến nghị
                        </h3>
                        <ul className="space-y-2">
                          {selectedHistoryItem.assessment.recommendations.map(
                            (rec, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-sm"
                              >
                                <span className="text-green-600 font-bold">
                                  {i + 1}.
                                </span>
                                {rec}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Disclaimer */}
                  {selectedHistoryItem.assessment.disclaimer && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          {selectedHistoryItem.assessment.disclaimer}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Info */}
                  <div className="text-xs text-gray-400">
                    AI: {selectedHistoryItem.assessment.ai_model || "N/A"} |
                    Version:{" "}
                    {selectedHistoryItem.assessment.ai_prompt_version || "N/A"}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">
                        AI Assessment
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        AI Assessment không có trong lịch sử này. Khi phân tích
                        có bật tùy chọn "Tạo AI Assessment".
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
