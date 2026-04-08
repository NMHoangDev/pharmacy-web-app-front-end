import React from "react";
import { Link } from "react-router-dom";
import "../../../app/styles/storefront-premium.css";

const IntroductionHeroSection = () => {
  return (
    <section className="px-4 pb-6 pt-2 lg:px-0">
      <div className="storefront-hero storefront-fade-up rounded-[36px] border border-white/80 px-6 py-8 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="storefront-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em]">
              <span className="material-symbols-outlined text-[16px]">
                diversity_3
              </span>
              Đồng hành cùng sức khỏe gia đình Việt
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Về chúng tôi
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              PharmaCare xây dựng trải nghiệm mua thuốc và tư vấn sức khỏe theo
              cách rõ ràng, hiện đại và ít ma sát hơn. Chúng tôi ưu tiên sự an
              tâm của người dùng ở cả giao diện lẫn vận hành dịch vụ.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/medicines"
                className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Xem hệ sản phẩm
              </Link>
              <Link
                to="/pharmacists"
                className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Gặp dược sĩ của chúng tôi
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              [
                "2026",
                "Khởi đầu với mục tiêu số hóa hành trình mua thuốc an tâm.",
              ],
              [
                "24/7",
                "Sẵn sàng hỗ trợ tư vấn và định hướng thông tin sử dụng.",
              ],
              [
                "Minh bạch",
                "Tập trung vào nội dung rõ ràng, trạng thái rõ ràng và trải nghiệm nhất quán.",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="storefront-soft-card rounded-[28px] p-5"
              >
                <div className="text-2xl font-black tracking-tight text-slate-900">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroductionHeroSection;
