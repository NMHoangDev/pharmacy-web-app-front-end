import React from "react";
import Breadcrumbs from "../../../../shared/components/layout/Breadcrumbs";

const PharmacistsBreadcrumbs = () => {
  return (
    <div className="px-0 py-1 text-sm text-slate-500">
      <Breadcrumbs items={[{ label: "Danh sách Dược sĩ" }]} />
    </div>
  );
};

export default PharmacistsBreadcrumbs;
