import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../../../shared/components/layout/Header";
import Footer from "../../../../shared/components/layout/Footer";
import ChatMessage from "../../components/chatbot/ChatMessage";
import ChatSuggestions from "../../components/chatbot/ChatSuggestions";
import ChatDisclaimer from "../../components/chatbot/ChatDisclaimer";
import { getAccessToken } from "../../../../shared/auth/authStorage";

const ChatbotPage = () => {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8087";
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      role: "assistant",
      content: "HQPharmacare xin chào bạn, bạn cần mình hỗ trợ gì hôm nay?",
      timestamp: "",
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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatTime = () =>
    new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
      const payloadMessages = history.map((message) => ({
        role: message.role,
        content: toPlainText(message.content),
      }));
      const requestPayload = {
        conversationId,
        messages: payloadMessages,
      };

      const token = getAccessToken();
      const headers = { "Content-Type": "application/json; charset=UTF-8" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
      });

      const rawText = await res.text();

      if (!res.ok) {
        let parsedError = null;
        try {
          parsedError = rawText ? JSON.parse(rawText) : null;
        } catch (parseError) {
          console.warn("[chatbot] failed to parse error body", parseError);
        }

        throw new Error(
          parsedError?.message ||
            parsedError?.error ||
            rawText ||
            "Yêu cầu không thành công",
        );
      }

      const data = rawText ? JSON.parse(rawText) : {};
      setConversationId(data.conversationId || conversationId);

      const botMessage = {
        id: makeId(),
        role: "assistant",
        content:
          data.reply ||
          "Xin lỗi, hiện chưa có câu trả lời phù hợp cho câu hỏi của bạn. Vui lòng thử lại với câu hỏi khác hoặc liên hệ tổng đài hỗ trợ khách hàng của HQPharmacare để được trợ giúp nhanh hơn.",
        timestamp: formatTime(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("[chatbot] chat error", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
      });
      setError("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Header />

      <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 md:gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#0d141b] dark:text-white">
                Hỏi đáp thuốc 24/7
              </h1>
              <p className="text-sm font-normal leading-normal text-[#4c739a] dark:text-slate-400">
                Trợ lý AI hỗ trợ thông tin y tế, sản phẩm và tình trạng còn
                hàng trong hệ thống nhà thuốc
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Sẵn sàng hỗ trợ
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#e7edf3] bg-white shadow-sm dark:border-slate-800 dark:bg-[#1A2633]">
            <div className="flex h-[calc(100vh-320px)] min-h-[560px] flex-col overflow-hidden rounded-2xl">
              <div
                ref={chatRef}
                className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-4 scroll-smooth overscroll-contain md:p-6"
              >
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400 dark:bg-slate-800">
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
                    sources={msg.sources || []}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-end gap-3">
                    <div
                      className="aspect-square h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-cover bg-center bg-no-repeat opacity-70 dark:border-slate-700"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHZjp7bZsUw5Rc3MJFUNxDPa7WmndmUQ7X7A3td9-DkgTaIbX1e67jAlIC8wP-SaubmY20fBM6Y6fFKCQlZzKDu47Dihc4s-2xS7fN6NqJplN6oQ_RQeQf1vzxaJbah45EitEJXvLOskxYdu8Jdd9Y0CKYyS8H_-ceiTcHzTr-Rdfcl5SHn2UA5_wQPB5XRuLDGqsHevhpR7zTEX33L-0VVFt2P-_j-eLz6vn9FPi9IoxggO9bbqs2pn7IDo9pqg20UqUehKm6CbiS')",
                      }}
                    />
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-none bg-[#f0f4f8] px-4 py-3 dark:bg-slate-700">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="delay-75 h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="delay-150 h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-[#e7edf3] bg-white p-4 dark:border-slate-800 dark:bg-[#1A2633]">
                <ChatSuggestions onSelect={setInput} />

                <form
                  onSubmit={handleSubmit}
                  className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-primary dark:hover:bg-slate-700"
                    aria-label="Thêm gợi ý"
                  >
                    <span className="material-symbols-outlined !text-[24px]">
                      add_circle
                    </span>
                  </button>

                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className="max-h-32 w-full resize-none border-none bg-transparent px-0 py-2.5 text-sm text-[#0d141b] placeholder-slate-400 focus:ring-0 dark:text-white"
                    placeholder="Nhập câu hỏi về thuốc của bạn..."
                    rows={1}
                    style={{ minHeight: 44 }}
                  />

                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg bg-primary p-2 text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
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
          </div>

          <div className="w-full">
            <ChatDisclaimer />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatbotPage;
