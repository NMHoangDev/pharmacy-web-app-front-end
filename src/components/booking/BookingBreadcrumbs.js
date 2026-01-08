import React from "react";
import Breadcrumbs from "../Breadcrumbs";

const BookingBreadcrumbs = () => {
  return (
    <Breadcrumbs
      items={[
        { label: "Dược sĩ", to: "/pharmacists" },
        { label: "Đặt lịch tư vấn" },
      ]}
    />
  );
};

export default BookingBreadcrumbs;
