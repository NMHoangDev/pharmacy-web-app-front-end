import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../app/contexts/AppContext";
import { getRoleLabel } from "../../../shared/auth/roleRedirect";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: "dashboard",
    path: "/admin/dashboard",
  },
  { key: "users", label: "Người dùng", icon: "group", path: "/admin/users" },
  {
    key: "drugs",
    label: "Quản lý thuốc",
    icon: "medication",
    path: "/admin/drugs",
  },
  {
    key: "discounts",
    label: "Khuyến mãi",
    icon: "sell",
    path: "/admin/discounts",
  },
  {
    key: "categories",
    label: "Danh mục",
    icon: "category",
    path: "/admin/categories",
  },
  {
    key: "orders",
    label: "Đơn hàng",
    icon: "receipt_long",
    path: "/admin/orders",
  },
  {
    key: "pharmacists",
    label: "Dược sĩ",
    icon: "clinical_notes",
    path: "/admin/pharmacists",
  },
  {
    key: "schedule",
    label: "Lịch tư vấn",
    icon: "event_upcoming",
    path: "/admin/schedule",
  },
  {
    key: "branches",
    label: "Chi nhánh",
    icon: "store",
    path: "/admin/branches",
  },
  {
    key: "inventory",
    label: "Kho hàng",
    icon: "inventory_2",
    path: "/admin/inventory",
  },
  {
    key: "content",
    label: "Nội dung",
    icon: "article",
    path: "/admin/content",
  },
  {
    key: "reviews",
    label: "Đánh giá",
    icon: "reviews",
    path: "/admin/reviews",
  },
];

const AdminSidebar = ({ activeKey = "dashboard", open = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, profile, roles, logout } = useAppContext();

  const displayName =
    profile?.fullName ||
    profile?.name ||
    authUser?.fullName ||
    authUser?.email ||
    "Quản trị viên";
  const email = profile?.email || authUser?.email || "Chưa có email";
  const roleLabel = getRoleLabel(roles);

  const goTo = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    onClose?.();
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 transform flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-200 dark:border-slate-700 dark:bg-slate-800 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Admin Pharmacy
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bảng điều khiển
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
            aria-label="Đóng thanh điều hướng admin"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              Quản lý hệ thống
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Giao diện admin được rút gọn, ưu tiên để nhìn và điều hướng nhanh
              như trang lịch hẹn của dược sĩ.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const routeActive =
              location.pathname === item.path ||
              (item.path !== "/admin/dashboard" &&
                location.pathname.startsWith(item.path));
            const active = activeKey === item.key || routeActive;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goTo(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
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

        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  shield_person
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {email}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  {roleLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Dong sidebar admin"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default AdminSidebar;
