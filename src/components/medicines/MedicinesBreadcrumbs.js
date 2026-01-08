import React from "react";
import Breadcrumbs from "../Breadcrumbs";

const MedicinesBreadcrumbs = () => {
  return (
    <Breadcrumbs
      items={[
        { label: "Thuốc / Sản phẩm", to: "/medicines" },
        { label: "Giảm đau, hạ sốt" },
      ]}
    />
  );
};

export default MedicinesBreadcrumbs;
