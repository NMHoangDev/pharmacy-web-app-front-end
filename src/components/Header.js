import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useCart } from "../contexts/CartContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAppContext();
  const { itemCount } = useCart();

  const avatarUrl = useMemo(() => {
    if (!profile?.avatarBase64) return "";
    return profile.avatarBase64.startsWith("data:")
      ? profile.avatarBase64
      : `data:image/png;base64,${profile.avatarBase64}`;
  }, [profile]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-[#e7edf3] dark:border-slate-700 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">
                local_pharmacy
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
              PharmaCare
            </span>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-[#e7edf3] dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <NavLink
              to="/cart"
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group"
              aria-label="Xem giỏ hàng"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 ? (
                <span className="absolute top-1 right-0 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white group-hover:scale-110 transition-transform">
                  {itemCount}
                </span>
              ) : null}
            </NavLink>
            <NavLink
              to="/account"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              aria-label="Trang tài khoản"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Ảnh đại diện"
                  className="size-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                />
              ) : (
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              )}
            </NavLink>
            <button
              type="button"
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              aria-label="Mở menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 pb-4">
          {[
            {
              to: "/",
              label: "Trang chủ",
            },
            {
              to: "/medicines",
              label: "Thuốc / Sản phẩm",
            },
            {
              to: "/pharmacists",
              label: "Dược sĩ",
            },
            {
              to: "/introduction",
              label: "Về chúng tôi",
            },
            {
              to: "/chatbot",
              label: "Tư vấn trực tuyến",
            },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "text-sm pb-1 transition-colors whitespace-nowrap",
                  isActive
                    ? "font-semibold text-primary border-b-2 border-primary"
                    : "font-medium text-slate-600 dark:text-slate-300 hover:text-primary",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors pb-1 whitespace-nowrap"
          >
            Liên hệ
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              {[
                {
                  to: "/",
                  label: "Trang chủ",
                },
                {
                  to: "/medicines",
                  label: "Thuốc / Sản phẩm",
                },
                {
                  to: "/pharmacists",
                  label: "Dược sĩ",
                },
                {
                  to: "/introduction",
                  label: "Về chúng tôi",
                },
                {
                  to: "/chatbot",
                  label: "Tư vấn trực tuyến",
                },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
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
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={closeMobile}
              >
                <span>Liên hệ</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
