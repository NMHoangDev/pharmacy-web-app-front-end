import React from "react";

const ChatSuggestions = ({ onSelect }) => {
  const prompts = [
    { icon: "medication", label: "Liều dùng thông thường" },
    { icon: "warning", label: "Tương tác thuốc" },
    { icon: "pregnant_woman", label: "Phụ nữ mang thai" },
    { icon: "schedule", label: "Uống trước hay sau ăn?" },
  ];

  return (
    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          onClick={() => onSelect(prompt.label)}
          className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined !text-sm">
            {prompt.icon}
          </span>
          {prompt.label}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
