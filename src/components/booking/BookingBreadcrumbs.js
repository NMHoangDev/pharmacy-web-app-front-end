import React from "react";
import Breadcrumbs from "../Breadcrumbs";

const BookingBreadcrumbs = () => {
  return (
    <div className="text-sm text-slate-500 py-1">
      <Breadcrumbs
        items={[
          { label: "Dược sĩ", to: "/pharmacists" },
          { label: "Đặt lịch tư vấn" },
        ]}
      />
    </div>
  );
};

export default BookingBreadcrumbs;
