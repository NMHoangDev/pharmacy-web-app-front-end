import React from "react";

const StatCard = ({ icon, title, value, accent, pill }) => (
  <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7edf3] dark:border-gray-800 p-5">
    <h4 className="text-sm font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-4">
      {title}
    </h4>
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-lg font-bold text-text-main dark:text-white">
          {value}
        </p>
        {pill && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pill.bg} ${pill.text}`}
          >
            {pill.label}
          </span>
        )}
      </div>
      <div className={`p-2 rounded-lg ${accent}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
  </div>
);

const ContentStats = ({ published, pending, drafts }) => {
  return (
    <div className="flex flex-col gap-4">
      <StatCard
        icon="public"
        title="Tổng quan nội dung"
        value={published}
        accent="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        pill={{
          bg: "bg-green-50 dark:bg-green-900/30",
          text: "text-green-600",
          label: "Đã xuất bản",
        }}
      />
      <StatCard
        icon="pending_actions"
        title="Chờ duyệt"
        value={pending}
        accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        pill={{
          bg: "bg-yellow-50 dark:bg-yellow-900/30",
          text: "text-yellow-600",
          label: "Cần xử lý",
        }}
      />
      <StatCard
        icon="draft"
        title="Bản nháp"
        value={drafts}
        accent="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        pill={{
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-300",
          label: "Chưa xuất bản",
        }}
      />
    </div>
  );
};

export default ContentStats;
