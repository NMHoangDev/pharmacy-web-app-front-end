import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    key: "pos",
    label: "Bán hàng tại quầy",
    icon: "point_of_sale",
    path: "/pharmacist/pos",
  },
  {
    key: "orders",
    label: "Quản lý đơn tại quầy",
    icon: "receipt_long",
    path: "/pharmacist/pos/orders",
  },
  {
    key: "appointments",
    label: "Lịch hẹn",
    icon: "calendar_month",
    path: "/pharmacist/appointments",
  },
];

const PharmacistSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-72 transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 dark:border-slate-700 dark:bg-slate-800 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">medication</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Dược sĩ
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bảng điều khiển
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
            aria-label="Đóng thanh điều hướng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="space-y-2 p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/pharmacist/pos" &&
                location.pathname.startsWith(item.path));

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Đóng sidebar"
          className="fixed inset-0 z-30 bg-black/40"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default PharmacistSidebar;
