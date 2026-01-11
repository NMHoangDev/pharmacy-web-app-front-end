import React from "react";

const ChatMessage = ({ role, content, timestamp, showActions }) => {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf9fy6p15rFCbZklI3GnMEUOZXdVc0sVy5eGIeL7z4tvcrMSyT_nFdSMruEOOhynldijYXzdGUVdjA7melz5Y7PRQx7acGEC0fEjvPHG3AFLpGWLtfDXWUtscFCKobWgVHW_tDjF21ipJKVWlmlu9KcVpqDmZeLPKXQunVO1TmfXVkFptK2RhJbihBfkkFnoVSkPLqadnQy4iweZjUuJ97-yaVFh0swZmSEqd4_SO_tsVh8vb3Tqr5AF5Bo_5c2vVHZcuvqu2yTp8n')",
          }}
        />
      )}

      <div
        className={`flex flex-1 flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2">
          {!isUser && (
            <p className="text-[#4c739a] dark:text-slate-400 text-[13px] font-medium leading-normal">
              Dược sĩ AI
            </p>
          )}
          {isUser && (
            <p className="text-[#4c739a] dark:text-slate-400 text-[13px] font-medium leading-normal">
              Bạn
            </p>
          )}
          <span className="text-[11px] text-slate-400">{timestamp}</span>
        </div>

        <div
          className={`text-base font-normal leading-relaxed max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-sm ${
            isUser
              ? "rounded-br-none bg-primary text-white"
              : "rounded-bl-none bg-[#f0f4f8] dark:bg-slate-700 text-[#0d141b] dark:text-white"
          }`}
        >
          {typeof content === "string" ? (
            content
          ) : (
            <div className="space-y-2">
              {content.title && <p>{content.title}</p>}
              {content.list && (
                <ul className="list-disc pl-5 space-y-1">
                  {content.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              {content.footer && <p>{content.footer}</p>}
            </div>
          )}
        </div>

        {!isUser && showActions && (
          <div className="flex gap-2 mt-1 ml-1">
            {["thumb_up", "thumb_down", "content_copy"].map((icon) => (
              <button
                key={icon}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={icon}
              >
                <span className="material-symbols-outlined !text-[18px]">
                  {icon}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="hidden sm:block bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYFOm6p4V8cSaU_sB65prZvmt2G7VakVLEIba3TXVazGkGjIO5a0AJJbju_oAkDHNqrMxNV5aER0ieULqO0N9nNLPua_t6tB0GL3pGLbovlBVuiz9-xGwPUOAOktc4tmG3W3sZ7EbOVQwFf9PL9wwx85e0p86iAO3p1_7Rck6w3qhoiKuVl_ulZEUf9Fye2Y1yKazYqf49GNNeJG_CRMmJFsT4ALkW_LPLazUSF4tkDVoCCxtScUpSbgsS0Ql7F9E64-cS6mkvdSGr')",
          }}
        />
      )}
    </div>
  );
};

export default ChatMessage;
