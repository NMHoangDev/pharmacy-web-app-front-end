import React from "react";

const ChatDisclaimer = () => {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 max-w-2xl text-center mx-auto">
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-3 py-1 rounded-md border border-amber-100 dark:border-amber-900/30">
        <span className="material-symbols-outlined !text-sm">info</span>
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          Lưu ý y tế
        </span>
      </div>
      <p className="text-xs text-[#4c739a] dark:text-slate-500 leading-relaxed">
        Thông tin do trợ lý ảo cung cấp chỉ mang tính chất tham khảo. Vui lòng
        hỏi ý kiến bác sĩ chuyên khoa hoặc dược sĩ tại quầy để được tư vấn chính
        xác nhất cho tình trạng sức khỏe của bạn.
      </p>
    </div>
  );
};

export default ChatDisclaimer;
