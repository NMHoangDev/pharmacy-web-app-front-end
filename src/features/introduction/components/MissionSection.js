import React from "react";
import "../../../app/styles/storefront-premium.css";

const items = [
  {
    icon: "favorite",
    title: "Sứ mệnh",
    desc: "Đưa trải nghiệm mua thuốc và tìm thông tin sức khỏe về mức rõ ràng, dễ tiếp cận và đáng tin hơn.",
  },
  {
    icon: "visibility",
    title: "Tầm nhìn",
    desc: "Trở thành nền tảng nhà thuốc trực tuyến giúp người dùng ra quyết định nhanh nhưng vẫn đủ thông tin.",
  },
  {
    icon: "verified_user",
    title: "Giá trị cốt lõi",
    desc: "Minh bạch nội dung, chuẩn hóa vận hành và luôn đặt sự an toàn của người dùng lên trước.",
  },
];

const MissionSection = () => {
  return (
    <section className="px-4 py-6 lg:px-0">
      <div className="storefront-card rounded-[32px] p-6 sm:p-7">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            Câu chuyện của chúng tôi
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Xây dựng một nhà thuốc online rõ ràng hơn từ bên trong
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            PharmaCare bắt đầu từ câu hỏi rất thực tế: vì sao việc mua thuốc và tìm
            thông tin sức khỏe vẫn còn rời rạc, khó hiểu và dễ gây mất niềm tin?
            Chúng tôi chọn trả lời bằng một hệ trải nghiệm thống nhất, nơi giao diện,
            nội dung và dịch vụ cùng phục vụ một mục tiêu là làm cho người dùng an tâm hơn.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="storefront-soft-card storefront-interactive rounded-[28px] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
