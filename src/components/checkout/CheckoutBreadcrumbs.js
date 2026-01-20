import React from "react";
import { Link } from "react-router-dom";

const CheckoutBreadcrumbs = () => {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/cart"
            className="text-[#4c739a] dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium"
          >
            Giỏ hàng
          </Link>
        </li>
        <li>
          <span className="text-[#4c739a] dark:text-gray-500">/</span>
        </li>
        <li>
          <span className="text-[#0d141b] dark:text-white font-medium">
            Thanh toán
          </span>
        </li>
        <li>
          <span className="text-[#4c739a] dark:text-gray-500">/</span>
        </li>
        <li>
          <span className="text-[#4c739a] dark:text-gray-400">Hoàn tất</span>
        </li>
      </ol>
    </nav>
  );
};

export default CheckoutBreadcrumbs;
