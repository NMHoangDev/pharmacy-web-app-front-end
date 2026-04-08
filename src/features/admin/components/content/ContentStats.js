import React from "react";

const StatCard = ({ icon, title, value, description, tone }) => {
  const toneClassMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            toneClassMap[tone] || toneClassMap.blue
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const ContentStats = ({ published, pending, drafts }) => {
  return (
    <div className="grid gap-4">
      <StatCard
        icon="publish"
        title="Bài đã xuất bản"
        value={published}
        description="Những nội dung đã sẵn sàng hiển thị ngoài website."
        tone="emerald"
      />
      <StatCard
        icon="draft"
        title="Bản nháp"
        value={drafts}
        description="Nội dung đang chờ biên tập hoặc rà soát trước khi lên lịch."
        tone="blue"
      />
      <StatCard
        icon="pending_actions"
        title="Chờ duyệt"
        value={pending}
        description="Các mục cần người phụ trách kiểm tra lần cuối."
        tone="amber"
      />
    </div>
  );
};

export default ContentStats;
