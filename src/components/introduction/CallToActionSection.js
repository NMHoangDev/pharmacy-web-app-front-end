import React from "react";
import { Link } from "react-router-dom";
import "../../styles/storefront-premium.css";

const CallToActionSection = () => {
  return (
    <section className="px-4 py-6 lg:px-0">
      <div className="storefront-hero rounded-[36px] border border-white/80 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              Sẵn sàng hỗ trợ
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Cần tư vấn trước khi mua thuốc hoặc đặt lịch hỗ trợ?
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Bạn có thể bắt đầu từ trang dược sĩ, trang sản phẩm hoặc khu kiến thức
              thuốc. Chúng tôi giữ hành trình đủ rõ để mỗi bước tiếp theo đều dễ hiểu.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/pharmacists"
              className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              Tư vấn với dược sĩ
            </Link>
            <Link
              to="/posts"
              className="storefront-interactive inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-6 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              Xem kiến thức thuốc
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
