import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../app/contexts/AppContext";
import { useCart } from "../../../app/contexts/CartContext";
import NotificationBell from "../../../features/notifications/components/NotificationBell";
import { useAuth } from "../../auth/useAuth";
import { useCampaign } from "../../hooks/useCampaign";
import CampaignBanner from "../feedback/CampaignBanner";
import "../../../app/styles/storefront-premium.css";

const navItems = [
  { to: "/", label: "Trang chủ" },
  { to: "/medicines", label: "Thuốc và sản phẩm" },
  { to: "/posts", label: "Kiến thức thuốc" },
  { to: "/forum", label: "Diễn đàn" },
  { to: "/pharmacists", label: "Dược sĩ" },
  { to: "/introduction", label: "Về chúng tôi" },
  { to: "/chatbot", label: "Tư vấn trực tuyến" },
];

const navLinkClass = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold storefront-interactive",
    "focus:outline-none focus:ring-2 focus:ring-sky-200",
    isActive
      ? "bg-sky-600 text-white shadow-[0_18px_30px_-20px_rgba(2,132,199,0.9)]"
      : "text-slate-700 hover:bg-white hover:text-slate-900",
  ].join(" ");

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    navigate(
      trimmed ? `/medicines?q=${encodeURIComponent(trimmed)}` : "/medicines",
    );
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[rgba(247,251,255,0.88)] backdrop-blur-xl">
      <CampaignBanner campaign={activeCampaign} />
      <div className="mx-auto max-w-[1280px] px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <div className="storefront-panel rounded-[28px] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <NavLink
              to="/"
              className="storefront-interactive flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="PharmaCare Home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.85)]">
                <span className="material-symbols-outlined text-[24px]">
                  local_pharmacy
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-black tracking-tight text-slate-900">
                  PharmaCare
                </div>
                <div className="truncate text-xs font-medium text-slate-500">
                  Nhà thuốc và tư vấn sức khỏe trực tuyến
                </div>
              </div>
            </NavLink>

            <form
              onSubmit={handleSearchSubmit}
              className="order-3 w-full lg:order-none lg:flex-1"
            >
              <div className="storefront-input flex h-12 items-center gap-3 px-3 sm:px-4">
                <span className="material-symbols-outlined text-[20px] text-slate-400">
                  search
                </span>
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  type="search"
                  placeholder="Tìm thuốc, hoạt chất, bệnh lý hoặc nhu cầu chăm sóc"
                  className="h-full w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Tìm kiếm thuốc"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <NotificationBell />

              <NavLink
                to="/cart"
                className="storefront-interactive relative inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
                aria-label="Giỏ hàng"
              >
                <span className="material-symbols-outlined text-[22px]">
                  shopping_cart
                </span>
                {itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                    {itemCount}
                  </span>
                ) : null}
              </NavLink>

              <NavLink
                to={isAuthenticated ? "/account" : "/login"}
                className="storefront-interactive inline-flex h-11 items-center gap-2 rounded-2xl px-2.5 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 sm:px-3"
                aria-label={isAuthenticated ? "Trang tài khoản" : "Đăng nhập"}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Ảnh đại diện"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-sky-100"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[24px] text-slate-700">
                    account_circle
                  </span>
                )}
                <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-800 lg:block">
                  {authLoading
                    ? "Đang tải..."
                    : effectiveProfile?.fullName ||
                      (isAuthenticated ? "Tài khoản" : "Đăng nhập")}
                </span>
              </NavLink>

              <button
                type="button"
                className="storefront-interactive inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 lg:hidden"
                aria-label="Mở menu"
                onClick={() => setMobileOpen((value) => !value)}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>

          <nav className="mt-3 hidden flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {mobileOpen ? (
          <div className="pt-3 lg:hidden">
            <div className="storefront-card rounded-[28px] p-3 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.26)]">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      [
                        "storefront-interactive flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200",
                        isActive
                          ? "bg-sky-600 text-white"
                          : "text-slate-700 hover:bg-sky-50",
                      ].join(" ")
                    }
                  >
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
