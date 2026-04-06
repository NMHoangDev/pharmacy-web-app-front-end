import React from "react";
import { Link } from "react-router-dom";
import "../../styles/storefront-premium.css";

const quickItems = [
  {
    icon: "pill",
    title: "Tìm thuốc dễ hơn",
    description: "Phân loại rõ ràng theo nhu cầu, hoạt chất và nhóm chăm sóc.",
  },
  {
    icon: "support_agent",
    title: "Tư vấn khi cần",
    description: "Kết nối dược sĩ để hỏi nhanh trước khi mua hoặc sử dụng.",
  },
  {
    icon: "receipt_long",
    title: "Theo dõi đơn tiện lợi",
    description: "Giỏ hàng, checkout và lịch sử đơn được thiết kế liền mạch.",
  },
];

const HeroSection = () => {
  return (
    <section className="pb-8 pt-6 sm:pb-10 sm:pt-8">
      <div className="storefront-container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="storefront-hero storefront-fade-up rounded-[36px] border border-white/80 px-5 py-6 shadow-[0_30px_80px_-54px_rgba(15,23,42,0.28)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="storefront-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em]">
                <span className="material-symbols-outlined text-[16px]">
                  health_and_safety
                </span>
                Chăm sóc sức khỏe dễ hiểu, dễ dùng
              </div>

              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Nhà thuốc trực tuyến gọn gàng, đáng tin và dễ mua hơn mỗi ngày
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Tìm đúng thuốc, đọc đúng thông tin, nhận tư vấn đúng lúc. Mọi bước
                từ khám phá sản phẩm đến thanh toán đều được thiết kế để người dùng
                cảm thấy rõ ràng và an tâm.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/medicines"
                  className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white shadow-[0_20px_34px_-22px_rgba(2,132,199,0.95)] focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  Khám phá thuốc và sản phẩm
                </Link>
                <Link
                  to="/pharmacists"
                  className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  Gặp dược sĩ tư vấn
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="storefront-soft-card rounded-full px-4 py-2">
                  Chính hãng và minh bạch thông tin
                </div>
                <div className="storefront-soft-card rounded-full px-4 py-2">
                  Hỗ trợ tư vấn trước khi mua
                </div>
                <div className="storefront-soft-card rounded-full px-4 py-2">
                  Trải nghiệm mobile mượt và rõ ràng
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {quickItems.map((item, index) => (
                <article
                  key={item.title}
                  className={[
                    "storefront-soft-card rounded-[28px] p-5 storefront-interactive",
                    index === 0 ? "lg:ml-0" : "",
                  ].join(" ")}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <span className="material-symbols-outlined text-[24px]">
                      {item.icon}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-black text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
