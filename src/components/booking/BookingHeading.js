import React from "react";

const BookingHeading = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-semibold leading-tight">
        Đặt lịch tư vấn với Dược sĩ
      </h1>
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-6 max-w-2xl">
        Chọn thời gian phù hợp, hình thức tư vấn và mô tả ngắn vấn đề sức khỏe
        để dược sĩ hỗ trợ hiệu quả hơn.
      </p>
    </div>
  );
};

export default BookingHeading;
