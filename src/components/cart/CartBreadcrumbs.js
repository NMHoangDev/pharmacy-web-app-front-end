import React from "react";
import { Link } from "react-router-dom";

const CartBreadcrumbs = () => {
  return (
    <div className="flex flex-wrap gap-2 px-4">
      <Link
        to="/"
        className="text-[#4c739a] hover:text-primary text-base font-medium leading-normal transition-colors"
      >
        Trang chủ
      </Link>
      <span className="text-[#4c739a] text-base font-medium leading-normal">
        /
      </span>
      <span className="text-[#0d141b] dark:text-white text-base font-medium leading-normal">
        Giỏ hàng
      </span>
    </div>
  );
};

export default CartBreadcrumbs;
