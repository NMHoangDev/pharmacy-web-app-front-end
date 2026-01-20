import React from "react";

const ReviewsToolbar = ({
  query,
  rating,
  status,
  onQueryChange,
  onRatingChange,
  onStatusChange,
}) => (
  <div className="p-4 border-b border-[#e7edf3] dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex flex-1 items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-[20px]">
          search
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-800 border border-[#cfdbe7] dark:border-gray-700 rounded-lg text-sm text-[#0d141b] dark:text-white placeholder:text-[#4c739a] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Tìm theo tên khách, tên thuốc..."
          type="text"
        />
      </div>
      <div className="relative min-w-[140px]">
        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-[#cfdbe7] dark:border-gray-700 rounded-lg text-sm text-[#0d141b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="all">Tất cả sao</option>
          <option value="5">5 Sao</option>
          <option value="4">4 Sao</option>
          <option value="3">3 Sao</option>
          <option value="2">2 Sao</option>
          <option value="1">1 Sao</option>
        </select>
        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#4c739a] pointer-events-none text-[20px]">
          arrow_drop_down
        </span>
      </div>
      <div className="relative min-w-[140px]">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-[#cfdbe7] dark:border-gray-700 rounded-lg text-sm text-[#0d141b] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
          <option value="pending">Chưa trả lời</option>
          <option value="responded">Đã trả lời</option>
        </select>
        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#4c739a] pointer-events-none text-[20px]">
          arrow_drop_down
        </span>
      </div>
    </div>
  </div>
);

export default ReviewsToolbar;
