import React from "react";
import "../../../app/styles/storefront-premium.css";

const pharmacists = [
  {
    id: 1,
    name: "DS. Lê Ngọc Bảo Hân",
    role: "Trưởng khoa dược",
    meta: "10 năm kinh nghiệm lâm sàng và chăm sóc người dùng",
    image: "images/lengocbaohan.webp",
  },
  {
    id: 2,
    name: "DS. Trần Minh Hùng",
    role: "Dược sĩ lâm sàng",
    meta: "Tập trung tư vấn sử dụng thuốc an toàn và đúng liều",
    image: "images/tranminhhung.webp",
  },
  {
    id: 3,
    name: "DS. Trân Hà Linh",
    role: "Chuyên viên tư vấn",
    meta: "Ưu tiên trải nghiệm dễ hiểu cho người mua thuốc lần đầu",
    image: "images/tranhalinh.jpg",
  },
];

const TeamSection = () => {
  return (
    <section className="px-4 py-6 lg:px-0">
      <div className="storefront-card rounded-[32px] p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              Đội ngũ đồng hành
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Dược sĩ của chúng tôi
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Không chỉ đúng chuyên môn, đội ngũ còn được định hướng để giao tiếp
            dễ hiểu, giúp người dùng ít áp lực hơn khi tiếp cận thông tin sức
            khỏe.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pharmacists.map((person) => (
            <article
              key={person.id}
              className="storefront-soft-card storefront-interactive overflow-hidden rounded-[28px]"
            >
              <div
                className="aspect-[4/3] bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${person.image}')` }}
              />
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-900">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-sky-700">
                  {person.role}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {person.meta}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
