// ==========================================
// Login Page - Firebase Authentication
// ==========================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSuccess("");
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      const code = err.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("Email hoặc mật khẩu không chính xác.");
      } else if (code === "auth/too-many-requests") {
        setError("Quá nhiều lần thử thất bại. Vui lòng thử lại sau vài phút hoặc đặt lại mật khẩu.");
      } else if (code === "auth/user-disabled") {
        setError("Tài khoản này đã bị vô hiệu hóa.");
      } else if (code === "auth/invalid-email") {
        setError("Địa chỉ email không hợp lệ.");
      } else {
        setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email vào ô bên trên để nhận liên kết đặt lại mật khẩu.");
      return;
    }
    setError("");
    setResetSuccess("");
    setIsResetting(true);

    try {
      await resetPassword(email.trim());
      setResetSuccess("Đã gửi email hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra hòm thư của bạn.");
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Không tìm thấy tài khoản nào với địa chỉ email này.");
      } else {
        setError(err.message || "Không thể gửi email đặt lại mật khẩu.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">DeepFace AI</h1>
          <p className="text-sm text-gray-400">Đăng nhập tài khoản Firebase Authentication</p>
        </div>

        {/* Card Form */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700/60">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Password Success Banner */}
          {resetSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-start gap-3 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl
                    text-white placeholder-gray-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting || isLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {isResetting ? "Đang gửi..." : "Quên mật khẩu?"}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-12 py-3 bg-gray-700/70 border border-gray-600 rounded-xl
                    text-white placeholder-gray-400 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 font-bold rounded-xl text-sm
                flex items-center justify-center gap-2
                bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
