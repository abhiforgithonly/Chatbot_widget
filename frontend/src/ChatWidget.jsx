import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! 👋 I'm SmartAssist, your digital services assistant. I can help you learn about our services, pricing, and support options.\n\nWhat's your name?",
      timestamp: new Date().toISOString(),
      read: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: null,
    email: null,
    query_type: null,
  });
  const [conversationStage, setConversationStage] = useState("greeting");
  const chatRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Mark bot messages as read when chat is open
  useEffect(() => {
    if (open) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          read: true,
        }))
      );
    }
  }, [open, messages.length]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get context aware quick replies based on conversation stage
  const getQuickReplies = () => {
    return ["Our Services", "Pricing", "Contact Us", "Get Support"];
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate read receipt 
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, read: true } : msg
        )
      );
    }, 600);

    try {
      console.log("📤 Sending to backend:", text);

      const historyForBackend = messages;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        {
          message: text,
          history: historyForBackend,
        }
      );

      console.log("📥 Response from backend:", res.data);

      // Update user info and conversation stage from backend
      if (res.data.userInfo) {
        setUserInfo(res.data.userInfo);
      }
      if (res.data.stage) {
        setConversationStage(res.data.stage);
      }

      // Append AI reply
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: res.data.reply,
          timestamp: new Date().toISOString(),
          read: true,
        },
      ]);
    } catch (err) {
      console.error("❌ Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date().toISOString(),
          read: true,
        },
      ]);
    }

    setLoading(false);
  };

  const quickReplies = getQuickReplies();

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-xl hover:scale-105 transition flex items-center gap-2 z-50 active:scale-95"
        aria-label="Open chat"
      >
        💬 <span className="text-sm font-medium hidden sm:inline">Chat with us</span>
        <span className="text-sm font-medium sm:hidden">Chat</span>
      </button>

      {open && (
        <>
          {/* Mobile: Full Screen Overlay */}
          {/* Desktop: Floating Window */}
          <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-4 md:right-6 sm:w-96 bg-white shadow-2xl sm:rounded-2xl border border-gray-100 overflow-hidden z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Bot Avatar in Header */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-xl sm:text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">SmartAssist</h3>
                  <p className="text-xs opacity-80">
                    {userInfo.name
                      ? `Chatting with ${userInfo.name}`
                      : "Typically replies in seconds"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white opacity-80 hover:opacity-100 text-xl sm:text-2xl px-2 active:scale-90 transition"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* User Info Card - Shows when info is collected */}
            {(userInfo.name || userInfo.email) && (
              <div className="bg-blue-50 border-b border-blue-100 p-3 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-base sm:text-lg">👤</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      Your Information
                    </p>
                    <div className="space-y-1">
                      {userInfo.name && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">
                            Name: <strong>{userInfo.name}</strong>
                          </span>
                        </div>
                      )}
                      {userInfo.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700 break-all">
                            Email: <strong>{userInfo.email}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages - Flexible height */}
            <div
              ref={chatRef}
              className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 space-y-3 sm:space-y-4"
              style={{ 
                maxHeight: 'calc(100vh - 240px)', // Mobile: account for header + input
                minHeight: '300px' // Minimum height
              }}
            >
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col">
                  {/* Message Container */}
                  <div
                    className={`flex items-end gap-2 ${
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Bot Avatar */}
                    {m.role === "bot" && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                        🤖
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] sm:max-w-[75%] p-2.5 sm:p-3 rounded-2xl ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white border shadow-sm rounded-bl-md"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.text}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp and Read Receipt */}
                  <div
                    className={`flex items-center gap-1 mt-1 px-1 ${
                      m.role === "user" ? "justify-end" : "justify-start ml-9 sm:ml-10"
                    }`}
                  >
                    <span className="text-xs text-gray-400">
                      {formatTime(m.timestamp)}
                    </span>
                    {m.role === "user" && (
                      <span className="text-xs">
                        {m.read ? (
                          <span className="text-blue-500">✓✓</span>
                        ) : (
                          <span className="text-gray-400">✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-end gap-2">
                  {/* Bot Avatar */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                    🤖
                  </div>

                  {/* Typing Bubble */}
                  <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies - Always show service options */}
            {quickReplies.length > 0 && (
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-t flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Quick Actions:
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickReplies.map((option) => (
                    <button
                      key={option}
                      onClick={() => sendMessage(option)}
                      disabled={loading}
                      className="text-xs bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition border border-blue-200 font-medium"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="flex items-center gap-2 p-3 sm:p-3 bg-white border-t flex-shrink-0">
              <input
                className="flex-1 border border-gray-200 p-2 sm:p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter message..."
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && sendMessage(input)
                }
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white p-2 px-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}