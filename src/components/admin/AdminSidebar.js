import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ activeKey = "users" }) => {
  const nav = [
    {
      key: "dashboard",
      label: "Tổng quan",
      icon: "dashboard",
      to: "/admin/dashboard",
    },
    { key: "users", label: "Người dùng", icon: "group", to: "/admin/users" },
    {
      key: "drugs",
      label: "Quản lý thuốc",
      icon: "medication",
      to: "/admin/drugs",
    },
    {
      key: "categories",
      label: "Danh mục",
      icon: "category",
      to: "/admin/categories",
    },
    {
      key: "orders",
      label: "Đơn hàng",
      icon: "receipt_long",
      to: "/admin/orders",
    },
    {
      key: "pharmacists",
      label: "Dược sĩ",
      icon: "clinical_notes",
      to: "/admin/pharmacists",
    },
    {
      key: "schedule",
      label: "Lịch tư vấn",
      icon: "event_upcoming",
      to: "/admin/schedule",
    },
    {
      key: "inventory",
      label: "Kho hàng",
      icon: "inventory_2",
      to: "/admin/inventory",
      divider: true,
    },
    {
      key: "content",
      label: "Nội dung",
      icon: "article",
      to: "/admin/content",
    },
    {
      key: "reviews",
      label: "Đánh giá",
      icon: "reviews",
      to: "/admin/reviews",
    },
    {
      key: "payments",
      label: "Thanh toán",
      icon: "payments",
      to: "/admin/payments",
      divider: true,
    },
    { key: "settings", label: "Cài đặt", icon: "settings", to: "#" },
  ];

  return (
    <aside className="w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 transition-all duration-300 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <span className="material-symbols-outlined text-primary text-3xl">
            local_pharmacy
          </span>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none">
            Admin Pharmacy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Hệ thống quản trị
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = activeKey === item.key;
          const cls = isActive
            ? "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-colors"
            : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group";

          return (
            <NavLink key={item.key} to={item.to} className={cls}>
              <span
                className={`material-symbols-outlined ${
                  isActive ? "filled" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
          <div
            className="size-9 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCoyd4ESTZWOMepkbmanL8Gp47vLEIqv07rpw8fD1fen8ZR-bQfgWGtfnUaPrGVINUTsVWJddDCs4BwHTZjxp33OXn2jXCDWlA4_n8hHE1KWiqgKea8r0U9YPFZKkPN_wF-gCw8BOCTcOTJARbESQ90MXi7Sid3tih-zubTzDPvSRMDOdKeQJIAsAFcnwG3GXUAQXcAys44ZVcxerv_rp-jsXk26PeyG-dk15_7Csfxr4ye5T0ma9LqkRF68DbR-FPPe_8HFwN5XASz')",
            }}
            aria-label="Admin avatar"
          />
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              Nguyễn Quản Trị
            </p>
            <p className="text-xs text-slate-500 truncate">admin@pharmacy.vn</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
