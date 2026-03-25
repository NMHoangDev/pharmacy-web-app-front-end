import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useCart } from "../contexts/CartContext";
import NotificationBell from "./notifications/NotificationBell";
import { useAuth } from "../auth/useAuth";
import { useCampaign } from "../hooks/useCampaign";
import CampaignBanner from "./CampaignBanner";

const navItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/medicines", label: "Thuốc / Sản phẩm" },
  { to: "/posts", label: "Kiến thức thuốc" },
  { to: "/forum", label: "Diễn đàn" },
  { to: "/pharmacists", label: "Dược sĩ" },
  { to: "/introduction", label: "Về chúng tôi" },
  { to: "/chatbot", label: "Tư vấn trực tuyến" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAppContext();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { itemCount } = useCart();
  const { activeCampaign } = useCampaign({ refreshIntervalMs: 180000 });

  const effectiveProfile = isAuthenticated ? profile : null;

  const avatarUrl = useMemo(() => {
    if (!effectiveProfile?.avatarBase64) return "";
    return effectiveProfile.avatarBase64.startsWith("data:")
      ? effectiveProfile.avatarBase64
      : `data:image/png;base64,${effectiveProfile.avatarBase64}`;
  }, [effectiveProfile]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <CampaignBanner campaign={activeCampaign} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-3 sm:gap-6">
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-3 shrink-0 group"
            aria-label="PharmaCare Home"
          >
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/15 group-hover:ring-primary/25 transition">
              <span className="material-symbols-outlined text-[26px]">
                local_pharmacy
              </span>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                PharmaCare
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Pharmacy & Consultation
              </div>
            </div>
          </NavLink>

          {/* Search (desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </span>
              <input
                type="text"
                placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
                className="block w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30
                           transition"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 hidden lg:flex items-center">
                <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1">
                  ⌘ K
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search button (mobile) */}
            <button
              type="button"
              className="md:hidden h-10 w-10 grid place-items-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Tìm kiếm"
            >
              <span className="material-symbols-outlined text-[22px]">
                search
              </span>
            </button>

            {/* Cart */}
            <NotificationBell />

            {/* Cart */}
            <NavLink
              to="/cart"
              className="relative h-10 w-10 grid place-items-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Xem giỏ hàng"
            >
              <span className="material-symbols-outlined text-[22px]">
                shopping_cart
              </span>
              {itemCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
                  {itemCount}
                </span>
              ) : null}
            </NavLink>

            {/* Account */}
            <NavLink
              to={isAuthenticated ? "/account" : "/login"}
              className="h-10 px-2 sm:px-3 flex items-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label={
                authLoading
                  ? "Đang kiểm tra đăng nhập"
                  : isAuthenticated
                    ? "Trang tài khoản"
                    : "Đăng nhập"
              }
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Ảnh đại diện"
                  className="size-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                />
              ) : (
                <span className="material-symbols-outlined text-slate-700 dark:text-slate-200 text-[24px]">
                  account_circle
                </span>
              )}
              <span className="hidden lg:block text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[160px] truncate">
                {authLoading
                  ? "..."
                  : effectiveProfile?.fullName ||
                    (isAuthenticated ? "Tài khoản" : "Đăng nhập")}
              </span>
            </NavLink>

            {/* Mobile menu */}
            <button
              type="button"
              className="md:hidden h-10 w-10 grid place-items-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Mở menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "px-3 py-2 rounded-xl text-sm font-semibold transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="mt-1 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden">
              <div className="p-3">
                {/* Mobile search */}
                <div className="relative mb-3">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      search
                    </span>
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm thuốc, bệnh lý..."
                    className="block w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        [
                          "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900",
                        ].join(" ")
                      }
                    >
                      <span>{item.label}</span>
                      <span className="material-symbols-outlined text-[18px] text-slate-400">
                        chevron_right
                      </span>
                    </NavLink>
                  ))}

                  <button
                    type="button"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                    onClick={closeMobile}
                  >
                    <span>Liên hệ</span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} PharmaCare
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
