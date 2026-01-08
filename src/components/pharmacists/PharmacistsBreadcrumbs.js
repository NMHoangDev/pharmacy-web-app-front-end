import React from "react";
import Breadcrumbs from "../Breadcrumbs";

const PharmacistsBreadcrumbs = () => {
  return (
    <div className="px-0">
      <Breadcrumbs items={[{ label: "Danh sách Dược sĩ" }]} />
    </div>
  );
};

export default PharmacistsBreadcrumbs;
