import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ChatMessage from "../../components/chatbot/ChatMessage";
import ChatSuggestions from "../../components/chatbot/ChatSuggestions";
import ChatDisclaimer from "../../components/chatbot/ChatDisclaimer";

const ChatbotPage = () => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      role: "assistant",
      content:
        "Chào bạn, tôi có thể giúp gì về đơn thuốc hôm nay? Bạn có thể hỏi về công dụng, liều dùng, hoặc tác dụng phụ của các loại thuốc.",
      timestamp: "09:41",
    },
    {
      id: "m2",
      role: "user",
      content:
        "Thuốc Panadol có tác dụng phụ gì không? Tôi đang định uống vì đau đầu.",
      timestamp: "09:42",
    },
    {
      id: "m3",
      role: "assistant",
      content: {
        title:
          "Panadol (chứa hoạt chất Paracetamol) thường an toàn khi sử dụng đúng liều lượng.",
        list: [
          "Tác dụng phụ hiếm gặp: Ban da, dị ứng.",
          "Lưu ý quan trọng: Dùng quá liều có thể gây hại nghiêm trọng cho gan.",
        ],
        footer:
          "Bạn nên uống 1 viên 500mg mỗi 4-6 giờ nếu cần, không quá 4g (8 viên) một ngày.",
      },
      timestamp: "09:42",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);

  const makeId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const todayLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  }, []);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toPlainText = (content) => {
    if (typeof content === "string") return content;
    if (!content) return "";
    const parts = [];
    if (content.title) parts.push(content.title);
    if (content.list) parts.push(content.list.join(" "));
    if (content.footer) parts.push(content.footer);
    return parts.join(" ");
  };

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      timestamp: formatTime(),
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const payloadMessages = history.map((m) => ({
        role: m.role,
        content: toPlainText(m.content),
      }));

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Yêu cầu không thành công");
      }

      const data = await res.json();
      const replyText = data.reply || data.message?.content;

      const botMessage = {
        id: makeId(),
        role: "assistant",
        content:
          replyText || "Xin lỗi, hiện chưa có câu trả lời. Bạn thử lại nhé.",
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error", err);
      setError("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleSuggestion = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4 sm:px-6 md:px-10">
        <div className="max-w-[960px] w-full mb-6">
          <div className="flex flex-wrap justify-between gap-3 items-end">
            <div className="flex flex-col gap-2">
              <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight">
                Hỏi Đáp Thuốc 24/7
              </h1>
              <p className="text-[#4c739a] dark:text-slate-400 text-sm font-normal leading-normal">
                Trợ lý ảo hỗ trợ thông tin y tế nhanh chóng và chính xác
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Sẵn sàng hỗ trợ
            </div>
          </div>
        </div>

        <div className="w-full max-w-[960px] flex-1 bg-white dark:bg-[#1A2633] rounded-2xl shadow-sm border border-[#e7edf3] dark:border-slate-800 flex flex-col overflow-hidden h-[calc(100vh-250px)] min-h-[500px] relative">
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
          >
            <div className="flex justify-center">
              <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                Hôm nay • {todayLabel}
              </span>
            </div>

            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                showActions={
                  msg.role === "assistant" && idx === messages.length - 1
                }
              />
            ))}

            {isLoading && (
              <div className="flex items-end gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 opacity-70 border border-slate-200 dark:border-slate-700"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHZjp7bZsUw5Rc3MJFUNxDPa7WmndmUQ7X7A3td9-DkgTaIbX1e67jAlIC8wP-SaubmY20fBM6Y6fFKCQlZzKDu47Dihc4s-2xS7fN6NqJplN6oQ_RQeQf1vzxaJbah45EitEJXvLOskxYdu8Jdd9Y0CKYyS8H_-ceiTcHzTr-Rdfcl5SHn2UA5_wQPB5XRuLDGqsHevhpR7zTEX33L-0VVFt2P-_j-eLz6vn9FPi9IoxggO9bbqs2pn7IDo9pqg20UqUehKm6CbiS')",
                  }}
                />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-none px-4 py-3 bg-[#f0f4f8] dark:bg-slate-700">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#e7edf3] dark:border-slate-800 p-4 bg-white dark:bg-[#1A2633] z-10">
            <ChatSuggestions onSelect={handleSuggestion} />

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all"
            >
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-700"
                aria-label="Thêm tệp"
              >
                <span className="material-symbols-outlined !text-[24px]">
                  add_circle
                </span>
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none text-[#0d141b] dark:text-white placeholder-slate-400 focus:ring-0 px-0 py-2.5 resize-none max-h-32 text-sm"
                placeholder="Nhập câu hỏi về thuốc của bạn..."
                rows={1}
                style={{ minHeight: 44 }}
              />

              <button
                type="button"
                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-700"
                aria-label="Ghi âm"
              >
                <span className="material-symbols-outlined !text-[24px]">
                  mic
                </span>
              </button>

              <button
                type="submit"
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined !text-[22px]">
                  send
                </span>
              </button>
            </form>

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>

        <ChatDisclaimer />
      </main>

      <Footer />
    </div>
  );
};

export default ChatbotPage;
