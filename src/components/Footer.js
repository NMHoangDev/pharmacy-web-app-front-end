import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/storefront-premium.css";

const primaryLinks = [
  { to: "/medicines", label: "Thuốc và sản phẩm" },
  { to: "/posts", label: "Kiến thức thuốc" },
  { to: "/forum", label: "Diễn đàn" },
  { to: "/pharmacists", label: "Dược sĩ tư vấn" },
];

const supportLinks = [
  { to: "/introduction", label: "Về chúng tôi" },
  { to: "/account/orders", label: "Theo dõi đơn hàng" },
  { to: "/cart", label: "Giỏ hàng" },
  { to: "/checkout", label: "Thanh toán" },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/80 bg-[linear-gradient(180deg,rgba(244,249,255,0.92),rgba(237,246,255,0.98))]">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="storefront-card rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_20px_32px_-20px_rgba(37,99,235,0.85)]">
                  <span className="material-symbols-outlined text-[26px]">
                    local_pharmacy
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">
                    PharmaCare
                  </h3>
                  <p className="text-sm text-slate-500">
                    Nhà thuốc trực tuyến, tư vấn dược sĩ và chăm sóc sức khỏe
                    tại nhà
                  </p>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-7 text-slate-600">
                Tập trung vào trải nghiệm mua thuốc minh bạch, dễ hiểu và an
                tâm. Người dùng có thể tìm sản phẩm, nhận tư vấn, theo dõi đơn
                hàng và quản lý sức khỏe trong cùng một hành trình gọn gàng.
              </p>
            </div>

            <div className="storefront-soft-card rounded-[28px] p-5">
              <div className="text-sm font-black text-slate-900">
                Khám phá nhanh
              </div>
              <div className="mt-4 space-y-2">
                {primaryLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="storefront-interactive flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      arrow_outward
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="storefront-soft-card rounded-[28px] p-5">
              <div className="text-sm font-black text-slate-900">
                Hỗ trợ mua sắm
              </div>
              <div className="mt-4 space-y-2">
                {supportLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="storefront-interactive flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <span>{item.label}</span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      chevron_right
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} PharmaCare. Trải nghiệm mua thuốc an
              tâm và rõ ràng.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <span className="material-symbols-outlined text-[16px]">
                  verified
                </span>
                Chính hãng
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="material-symbols-outlined text-[16px]">
                  local_shipping
                </span>
                Giao nhanh
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
