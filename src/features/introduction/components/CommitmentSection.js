import React from "react";
import "../../../app/styles/storefront-premium.css";

const items = [
  {
    icon: "medication",
    title: "Thuốc chính hãng",
    desc: "Nguồn gốc rõ ràng, trình bày thông tin gọn và nhất quán ở từng điểm chạm.",
  },
  {
    icon: "school",
    title: "Tư vấn chuyên môn",
    desc: "Người dùng có thể được hỗ trợ trước khi mua và trong quá trình sử dụng.",
  },
  {
    icon: "lock",
    title: "Bảo mật thông tin",
    desc: "Tài khoản, đơn hàng và dữ liệu cá nhân được ưu tiên bảo vệ trong toàn bộ hành trình.",
  },
];

const CommitmentSection = () => {
  return (
    <section className="px-4 py-6 lg:px-0">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="storefront-soft-card storefront-interactive rounded-[30px] p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <span className="material-symbols-outlined text-[28px]">
                {item.icon}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommitmentSection;
