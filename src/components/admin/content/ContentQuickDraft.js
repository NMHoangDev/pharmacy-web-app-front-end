import React, { useState } from "react";

const ContentQuickDraft = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSave = () => {
    alert("Đã lưu nháp: " + (title || "(Không tiêu đề)"));
  };

  const handleContinue = () => {
    alert("Mở trình soạn thảo đầy đủ (mock)");
  };

  return (
    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            edit_note
          </span>
          Soạn thảo nhanh
        </h3>
        <button
          type="button"
          className="text-sm text-primary font-medium hover:underline"
          onClick={handleContinue}
        >
          Mở trình soạn thảo đầy đủ
        </button>
      </div>
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
          placeholder="Tiêu đề bài viết..."
          type="text"
        />
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex gap-1 items-center flex-wrap">
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                format_bold
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                format_italic
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                format_underlined
              </span>
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                link
              </span>
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                image
              </span>
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 text-sm border-none focus:ring-0 resize-none text-text-main dark:text-white"
            placeholder="Nội dung bài viết..."
            rows="4"
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-secondary dark:text-gray-500 italic">
            Tự động lưu 2 phút trước
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={handleSave}
            >
              Lưu nháp
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm"
              onClick={handleContinue}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentQuickDraft;
