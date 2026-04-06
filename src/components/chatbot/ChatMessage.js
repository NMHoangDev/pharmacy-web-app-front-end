import React from "react";
import { useNavigate } from "react-router-dom";

const renderInline = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const renderRichContent = (content) => {
  if (typeof content !== "string") {
    return (
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
    );
  }

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trimEnd());
  const blocks = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    blocks.push({
      type: "list",
      items: bulletBuffer,
    });
    bulletBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      return;
    }

    if (/^(\*|-)\s+/.test(trimmed)) {
      bulletBuffer.push(trimmed.replace(/^(\*|-)\s+/, ""));
      return;
    }

    flushBullets();

    const plainBoldHeading =
      trimmed.startsWith("**") &&
      trimmed.endsWith("**") &&
      trimmed.length > 4;

    if (plainBoldHeading) {
      blocks.push({
        type: "heading",
        text: trimmed.slice(2, -2),
      });
      return;
    }

    blocks.push({
      type: "paragraph",
      text: trimmed,
    });
  });

  flushBullets();

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <p key={idx} className="text-[15px] font-semibold leading-6">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 text-[15px]">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-6">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-wrap leading-6">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
};

const ChatMessage = ({
  role,
  content,
  timestamp,
  showActions,
  sources = [],
}) => {
  const navigate = useNavigate();
  const isUser = role === "user";
  const productSources = sources.filter(
    (source) => source?.type === "product" && source?.id,
  );

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
        className={`flex min-w-0 flex-1 flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2">
          <p className="text-[#4c739a] dark:text-slate-400 text-[13px] font-medium leading-normal">
            {isUser ? "Bạn" : "HQPharmacare Bot"}
          </p>
          <span className="text-[11px] text-slate-400">{timestamp}</span>
        </div>

        <div
          className={`text-[15px] font-normal leading-relaxed max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm break-words ${
            isUser
              ? "rounded-br-none bg-primary text-white"
              : "rounded-bl-none bg-[#f0f4f8] dark:bg-slate-700 text-[#0d141b] dark:text-white"
          }`}
        >
          {renderRichContent(content)}
        </div>

        {!isUser && sources.length > 0 && (
          <div className="mt-2 flex max-w-[85%] sm:max-w-[70%] min-w-0 flex-col gap-2">
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {sources.map((source) => (
                  <span
                    key={`${source.id}-${source.title}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined !text-sm">
                      medication
                    </span>
                    {source.title} • {source.stockStatus}
                  </span>
                ))}
              </div>
            </div>

            {productSources.length > 0 && (
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2 px-1">
                  {productSources.slice(0, 3).map((source) => (
                    <button
                      key={`product-${source.id}`}
                      type="button"
                      onClick={() => navigate(`/medicines/${source.id}`)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-primary/90"
                    >
                      <span className="material-symbols-outlined !text-base">
                        shopping_cart
                      </span>
                      Xem chi tiết / Đặt mua
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
