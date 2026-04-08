import React from "react";
import "../../../app/styles/storefront-premium.css";

const trustItems = [
  {
    icon: "verified_user",
    title: "Thuốc chính hãng",
    desc: "Nguồn gốc rõ ràng, thông tin được trình bày dễ đọc và thống nhất.",
  },
  {
    icon: "support_agent",
    title: "Hỏi dược sĩ nhanh",
    desc: "Người dùng có thể hỏi trước khi mua để giảm nhầm lẫn khi sử dụng.",
  },
  {
    icon: "workspace_premium",
    title: "Trải nghiệm đáng tin",
    desc: "Từ danh sách sản phẩm đến checkout đều được làm gọn, rõ trạng thái.",
  },
];

const TrustSection = () => {
  return (
    <section className="py-6 sm:py-8">
      <div className="storefront-container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="storefront-card rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Cam kết cốt lõi
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Vì sao người dùng có thể yên tâm sử dụng
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Phần này được giữ rất gọn để nhấn vào điều người dùng cần biết nhất:
              an toàn, minh bạch và hỗ trợ khi phát sinh câu hỏi.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="storefront-soft-card storefront-interactive rounded-[28px] p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <span className="material-symbols-outlined text-[28px]">
                    {item.icon}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
