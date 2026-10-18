// ==========================================
// Chat Page - AI Chat để kiểm tra cảm xúc
// ==========================================

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
  User,
  Bot,
  X,
  Sparkles,
  Clock,
  Lock,
  Plus,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

import { useSearchParams, useNavigate } from "react-router-dom";

// ==========================================
// Types
// ==========================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  client_message_id?: string;  // Q5: Idempotency key for retry detection
  created_at: string;
}

// ==========================================
// Main Component
// ==========================================

export default function ChatPage() {
  const [sessions, setSessions] = useState<{ id: string; label: string }[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [showSessionList, setShowSessionList] = useState(false);

  // Session Wrap-up & Completion states
  const [isCurrentSessionClosed, setIsCurrentSessionClosed] = useState(false);
  const [canExtend, setCanExtend] = useState(false);
  const [userExtended, setUserExtended] = useState(false);
  const [extendingSession, setExtendingSession] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<{
    summary: string;
    closingMessage: string;
    microAction?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandledSurveyPrompt = useRef(false);

  // Prefill prompt or auto-start fresh session from survey
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    const sourceParam = searchParams.get("source");

    if (promptParam && sourceParam === "survey" && !hasHandledSurveyPrompt.current) {
      hasHandledSurveyPrompt.current = true;

      const autoStartSurveyChat = async () => {
        setLoading(true);
        try {
          const res = await api.post("/api/v1/assessments");
          const newSessionId = res.data?.assessment_id;
          if (newSessionId) {
            setSelectedSession(newSessionId);
            setSessions((prev) => [
              { id: newSessionId, label: `Khảo sát ${new Date().toLocaleString("vi-VN")}` },
              ...prev.filter((s) => s.id !== "new"),
              { id: "new", label: "+ Chat mới" },
            ]);
            setIsCurrentSessionClosed(false);

            const userMsg: ChatMessage = {
              id: `temp_${Date.now()}`,
              role: "user",
              content: promptParam.trim(),
              created_at: new Date().toISOString(),
            };
            setMessages([userMsg]);
            navigate("/chat", { replace: true });

            const chatRes = await api.post(`/api/v1/assessments/${newSessionId}/chat`, {
              message: promptParam.trim(),
              analyze: true,
            });

            if (chatRes.data?.assistant_message) {
              setMessages((prev) => [...prev, chatRes.data.assistant_message]);
            }
          }
        } catch (err) {
          console.error("Auto survey chat error:", err);
          setInputText(promptParam);
        } finally {
          setLoading(false);
        }
      };

      autoStartSurveyChat();
    } else if (promptParam && !hasHandledSurveyPrompt.current) {
      setInputText(promptParam);
    }
  }, [searchParams, navigate]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when session changes
  useEffect(() => {
    if (selectedSession) {
      loadChatHistory(selectedSession);
    }
  }, [selectedSession]);

  // Load sessions list
  const loadSessions = async () => {
    try {
      const res = await api.get("/api/v1/assessments");

      const assessments = res.data.assessments || [];

      // Create sessions from assessments
      const sessionList = assessments.map((a: any) => ({
        id: a.id,
        label: `Session ${new Date(a.created_at).toLocaleString("vi-VN")}`,
      }));

      // Add a default "New Chat" option
      setSessions([{ id: "new", label: "+ Chat mới" }, ...sessionList]);

      // Auto-select first session or "new"
      if (sessionList.length > 0) {
        setSelectedSession(sessionList[0].id);
      } else {
        setSelectedSession("new");
      }
    } catch (err) {
      console.error("Load sessions error:", err);
      setSessions([{ id: "new", label: "+ Chat mới" }]);
      setSelectedSession("new");
    }
  };

  // Load chat history
  const loadChatHistory = async (assessmentId: string) => {
    if (assessmentId === "new") {
      setMessages([]);
      setIsCurrentSessionClosed(false);
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/v1/assessments/${assessmentId}/chat`);
      setMessages(res.data.messages || []);
      setIsCurrentSessionClosed(Boolean(res.data.is_closed));
      setCanExtend(Boolean(res.data.can_extend));
      setUserExtended(Boolean(res.data.user_extended));
    } catch (err) {
      console.error("Load chat history error:", err);
      setMessages([]);
      setIsCurrentSessionClosed(false);
      setCanExtend(false);
      setUserExtended(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Create new assessment session
  const createNewSession = async (): Promise<string | null> => {
    try {
      const res = await api.post("/api/v1/assessments");
      return res.data.assessment_id;
    } catch (err) {
      console.error("Create session error:", err);
      return null;
    }
  };

  // Handle starting a fresh session and clearing old messages completely
  const handleStartFreshSession = async () => {
    setCompletedSessionData(null);
    setIsCurrentSessionClosed(false);
    setCanExtend(false);
    setUserExtended(false);
    setMessages([]); // XÓA SẠCH MÀN HÌNH CHAT CŨ
    setLoading(true);

    try {
      const newId = await createNewSession();
      if (newId) {
        setSelectedSession(newId);
        const timeStr = new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setSessions((prev) => [
          { id: newId, label: `Chat mới (${timeStr})` },
          ...prev
            .filter((s) => s.id !== "new")
            .map((s) =>
              s.id === selectedSession
                ? {
                    ...s,
                    label: s.label.includes("Đã đóng")
                      ? s.label
                      : `${s.label} (Đã đóng)`,
                  }
                : s
            ),
          { id: "new", label: "+ Chat mới" },
        ]);

        // STA Compact: lấy greeting cá nhân hóa từ API dựa trên dữ liệu khảo sát.
        // Tránh câu hỏi sáo rỗng kiểu "bạn cảm thấy thế nào?".
        let greetingContent =
          "Chào bạn, hôm nay tôi ở đây để lắng nghe bạn. Qua khảo sát gần nhất, điều gì trong công việc đang tạo áp lực lớn nhất cho bạn?";
        try {
          const res = await api.get(
            `/api/v1/assessments/${newId}/chat/initial-greeting`
          );
          if (res.data?.greeting) {
            greetingContent = res.data.greeting;
          }
        } catch (greetErr) {
          console.warn("Initial greeting fallback:", greetErr);
        }

        setMessages([
          {
            id: `greeting_${Date.now()}`,
            role: "assistant",
            content: greetingContent,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to start fresh session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle user requesting extension (+3 turns)
  const handleExtendSession = async () => {
    if (!selectedSession || selectedSession === "new") return;
    setExtendingSession(true);
    try {
      const res = await api.post(`/api/v1/assessments/${selectedSession}/chat/extend`);
      if (res.data?.success) {
        setUserExtended(true);
        setCanExtend(false);
        setIsCurrentSessionClosed(false);
        setCompletedSessionData(null);
        if (res.data.assistant_message) {
          setMessages((prev) => [
            ...prev,
            {
              id: res.data.assistant_message.message_id || `asst_ext_${Date.now()}`,
              role: "assistant",
              content: res.data.assistant_message.content,
              created_at: res.data.assistant_message.created_at || new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Extend chat session error:", err);
    } finally {
      setExtendingSession(false);
      inputRef.current?.focus();
    }
  };

  // Handle user deciding to rest & complete
  const handleCloseSession = async () => {
    if (!selectedSession || selectedSession === "new") return;
    try {
      await api.post(`/api/v1/assessments/${selectedSession}/chat/close`);
    } catch (err) {
      console.error("Close chat session error:", err);
    }
    setCanExtend(false);
    setIsCurrentSessionClosed(true);
    const lastAsst = [...messages].reverse().find((m) => m.role === "assistant");
    setCompletedSessionData({
      summary: lastAsst?.content || "Phiên tư vấn tự nhận thức đã hoàn tất.",
      closingMessage: lastAsst?.content || "Bạn đã hoàn thành phiên tham vấn hôm nay. Hãy nghỉ ngơi nhé!",
    });
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    // If "new" session, create a new assessment first
    let sessionId = selectedSession;
    if (sessionId === "new") {
      const newId = await createNewSession();
      if (!newId) {
        setError("Không thể tạo session mới");
        return;
      }
      sessionId = newId;
      setSessions((prev) => [
        { id: sessionId, label: `Chat ${new Date().toLocaleString("vi-VN")}` },
        ...prev.filter((s) => s.id !== "new"),
      ]);
      setSelectedSession(sessionId);
    }

    // Q6: Validate input length trước khi gửi
    const trimmedInput = inputText.trim();
    if (trimmedInput.length > 1000) {
      setError("Tin nhắn quá dài (tối đa 1000 ký tự). Vui lòng tóm gọn.");
      return;
    }

    setLoading(true);
    setError("");

    // Q5: Tạo UUID cho mỗi message (idempotency key)
    const clientMessageId = (() => {
      if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
        return (crypto as any).randomUUID();
      }
      return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    })();

    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: trimmedInput,
      client_message_id: clientMessageId,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = trimmedInput;
    setInputText("");

    try {
      // Q1: Bỏ field `analyze` (backend không dùng nữa)
      // Q5: Gửi kèm client_message_id
      const res = await api.post(`/api/v1/assessments/${sessionId}/chat`, {
        message: currentInput,
        client_message_id: clientMessageId,
      });

      const data = res.data;

      setCanExtend(Boolean(data.can_extend));
      setUserExtended(Boolean(data.user_extended));

      // Check if session has reached completion threshold or offers extension
      if (data.can_extend && !data.user_extended) {
        // Gatekeeper: Offer extension in chat interface without abruptly closing
        setCanExtend(true);
      } else if (data.is_session_completed) {
        setIsCurrentSessionClosed(true);
        setCompletedSessionData({
          summary: data.assistant_message?.content || "",
          closingMessage:
            data.assistant_message?.content ||
            "Phiên tư vấn này đã đạt giới hạn hoàn tất và được lưu trữ thành công.",
          microAction: data.micro_action_offered || undefined,
        });
      }

      // Update with server response
      setMessages((prev) => {
        // Replace temp message with server response
        const filtered = prev.filter((m) => m.id !== userMessage.id);

        // Add user message from server
        const userMsgFromServer: ChatMessage = {
          id: data.user_message?.message_id || userMessage.id,
          role: "user",
          content: data.user_message?.content || currentInput,
          client_message_id: clientMessageId,
          created_at: data.user_message?.created_at || new Date().toISOString(),
        };

        const newMessages = [...filtered, userMsgFromServer];

        // Add assistant message if available
        if (data.assistant_message) {
          const assistantMsg: ChatMessage = {
            id: data.assistant_message.message_id || `asst_${Date.now()}`,
            role: "assistant",
            content: data.assistant_message.content || "",
            created_at:
              data.assistant_message.created_at || new Date().toISOString(),
          };
          newMessages.push(assistantMsg);
        }

        return newMessages;
      });
    } catch (err: any) {
      console.error("Send message error:", err);

      // Q3 / GAP-5: re-fetch state để biết session còn mở không
      // KHÔNG tự đoán đóng/mở — backend là nguồn xác thực cuối cùng.
      let stateError = "Có lỗi xảy ra";
      try {
        const stateRes = await api.get(
          `/api/v1/assessments/${sessionId}/chat/state`
        );
        const state = stateRes.data;
        if (!state.can_reply) {
          // Session đã đóng hoặc expired
          setIsCurrentSessionClosed(true);
          setCompletedSessionData({
            summary: "",
            closingMessage:
              "Phiên tư vấn đã hoàn tất hoặc hết hạn. Vui lòng bắt đầu phiên mới.",
            microAction: undefined,
          });
          stateError = "Phiên đã đóng. Vui lòng tạo phiên mới.";
        } else {
          // Session vẫn mở, có thể retry
          stateError = "Mất kết nối. Vui lòng thử gửi lại.";
        }
      } catch (stateErr) {
        // KHÔNG tự đoán — hiển thị trạng thái chưa xác định
        stateError =
          "Không thể xác minh trạng thái phiên. Vui lòng kiểm tra kết nối và thử lại.";
      }

      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setError(stateError);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Delete chat
  const deleteChat = async () => {
    if (selectedSession === "new" || !selectedSession) return;
    if (!confirm("Xóa lịch sử chat này?")) return;

    try {
      await api.delete(`/api/v1/assessments/${selectedSession}/chat`);
      setMessages([]);
      setSessions((prev) => prev.filter((s) => s.id !== selectedSession));
      setSelectedSession("new");
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            Trợ lý AI - Lắng nghe & Phân tích bối cảnh
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Chia sẻ cảm xúc và khó khăn trong ngày để ghi nhận các tín hiệu bối cảnh (Context Signals)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Session Selector & New Chat */}
          <div className="relative">
            <button
              onClick={() => setShowSessionList(!showSessionList)}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {selectedSession === "new"
                  ? "Phiên chat mới"
                  : sessions.find((s) => s.id === selectedSession)?.label || "Chọn phiên"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showSessionList && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedSession("new");
                    setMessages([]);
                    setShowSessionList(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-600 font-semibold border-b flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  + Tạo chat mới
                </button>
                {sessions
                  .filter((s) => s.id !== "new")
                  .map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setSelectedSession(session.id);
                        setShowSessionList(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        session.id === selectedSession ? "bg-blue-50 font-medium text-blue-600" : "text-gray-700"
                      }`}
                    >
                      <span className="text-sm">{session.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Delete Chat */}
          {selectedSession !== "new" && (
            <button
              onClick={deleteChat}
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Xóa chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center px-4 py-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">
                  Chào bạn! Ngày làm việc hôm nay của bạn thế nào?
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
                  Bạn có thể chia sẻ tự nhiên về những điều làm bạn mệt mỏi, deadline hoặc những điều đang vướng mắc. AI sẽ lắng nghe và ghi nhận các bối cảnh liên quan.
                </p>

                <div className="w-full space-y-2 text-left">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                    Gợi ý bắt đầu nhanh:
                  </p>
                  {[
                    "Hôm nay công việc của mình quá nhiều và deadline dồn dập...",
                    "Mình cảm thấy khó tập trung và cạn năng lượng sau giờ làm...",
                    "Công việc gặp nhiều vướng mắc nhưng thiếu sự phối hợp từ nhóm...",
                    "Hôm nay mọi việc khá êm đẹp, mình cảm thấy nhẹ nhõm...",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(prompt)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-gray-700 flex items-center gap-2.5 text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`max-w-[70%] ${
                        msg.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-left ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-tr-md"
                            : "bg-gray-100 text-gray-800 rounded-tl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-4 mb-2 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm flex-1">{error}</span>
              <button
                onClick={() => setError("")}
                className="p-1 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            {/* Extension Offer Card */}
            {canExtend && !userExtended && (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl mb-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Phiên đã đạt mốc đúc kết ban đầu. Bạn có muốn tiếp tục chia sẻ thêm không?
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseSession}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    🌿 Nghỉ ngơi & Hoàn tất
                  </button>
                  <button
                    type="button"
                    onClick={handleExtendSession}
                    disabled={extendingSession}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {extendingSession ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    💬 Chia sẻ thêm (+3 lượt)
                  </button>
                </div>
              </div>
            )}

            {/* Active Extension Banner */}
            {userExtended && !isCurrentSessionClosed && (
              <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl mb-3 flex items-center justify-between text-xs text-indigo-800 animate-fadeIn">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Đang trong phiên gia hạn (+3 lượt) • Hãy thoải mái chia sẻ thêm
                </span>
                <button
                  type="button"
                  onClick={handleCloseSession}
                  className="text-[11px] underline text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Hoàn tất phiên sớm
                </button>
              </div>
            )}

            {isCurrentSessionClosed && (!canExtend || userExtended) ? (
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-fadeIn">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="p-2.5 bg-slate-200 rounded-xl text-slate-600 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Phiên trò chuyện này đã kết thúc & được lưu vào nhật ký (Chỉ đọc)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dữ liệu đã được chốt để bảo toàn bối cảnh. Hãy mở một phiên mới hoàn toàn sạch sẽ để tiếp tục.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartFreshSession}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Bắt đầu Phiên Mới Ngay
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Chia sẻ cảm xúc của bạn..."
                    rows={1}
                    className="flex-1 px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || loading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">Gửi</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Nhấn Enter để gửi, Shift+Enter để xuống dòng
                </p>
              </>
            )}
          </div>
        </div>

        {/* Modal Thông Báo Đóng Session & Tạo Phiên Mới */}
        {completedSessionData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Phiên Tư Vấn Đã Hoàn Tất & Đúc Kết
                  </h3>
                  <p className="text-xs text-gray-500">
                    Đã hoàn thành mốc trao đổi tiêu chuẩn (10 lượt tin nhắn)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-gray-700 leading-relaxed max-h-56 overflow-y-auto space-y-2">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Lời đúc kết từ AI Wellbeing Companion:
                </p>
                <p className="italic bg-white p-3 rounded-xl border border-gray-200 leading-relaxed text-slate-800">
                  "{completedSessionData.closingMessage}"
                </p>
              </div>

              {completedSessionData.microAction && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Hành động vi mô 5 phút bạn có thể thử ngay:
                  </span>
                  <p className="leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                    {completedSessionData.microAction}
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 space-y-1">
                <span className="font-semibold block">Lưu ý trải nghiệm:</span>
                <p>
                  Toàn bộ cảm xúc đã được ghi nhận vào nhật ký. Hệ thống sẽ mở một phiên mới hoàn toàn sạch sẽ để bạn tiếp tục chia sẻ mà không bị loãng dữ liệu cũ.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCompletedSessionData(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Xem lại tin nhắn
                </button>
                {canExtend && !userExtended && (
                  <button
                    type="button"
                    onClick={handleExtendSession}
                    disabled={extendingSession}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    💬 Chia sẻ thêm (+3 lượt)
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStartFreshSession}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Bắt đầu Phiên Mới Ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
