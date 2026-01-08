import React from "react";

const BookingHeading = () => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
        Đặt lịch tư vấn với Dược sĩ
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
        Điền thông tin và chọn thời gian phù hợp để được hỗ trợ tận tình.
      </p>
    </div>
  );
};

export default BookingHeading;
