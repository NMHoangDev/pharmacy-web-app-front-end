import React from "react";
import "../../styles/storefront-premium.css";

const pharmacists = [
  {
    id: 1,
    name: "DS. Nguyễn Thị Lan",
    role: "Trưởng khoa dược",
    meta: "10 năm kinh nghiệm lâm sàng và chăm sóc người dùng",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-RbBTpinOJtsoz9KvvtQthajpIwjwUFDYF6xtmMlXu2vqGZ4kgLqFNA9kMa04wzUXmqexJHAlodAbh7ematOdk4Qg-JY9TUB6qRbIPbuMonMZckF7LgKl7X05-gHgnMThVyF1GTXwAXDrL1CyJEkbXiy9P62x0lLI09c8iURpCNaohnKGwzPrVREw1xOph_AS1LC7SRSACP3T7aBXPCyJAu0CRFLzm3qXNtzZnIoDs_T3jFRSKA8z3QcxkbdOjiNm1PXGA1ixekih",
  },
  {
    id: 2,
    name: "DS. Trần Văn Minh",
    role: "Dược sĩ lâm sàng",
    meta: "Tập trung tư vấn sử dụng thuốc an toàn và đúng liều",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdYJMm0pxYmXc-m1qVBIbGeM8dwtQtDIxCyVu_wPUqUaSwmtX0u_H5HSyPUkkRhJaq5sfh0ALlE3B8TksVAPkaDgla1fInxN-wmAmaJ-tdV7v_3m4WhXm_Q4Y9HggBIyxcgSVkTXPy1r7aFRel4YGFxrmWB4hPWrbj7CSEfkhHxx4HEAOSYfRcZ9-JnkHvgZH7wODvcqM1x-HAU2kLdex9HyYz5phlVHZ_bS4LLN39XPTDoJ8UDkZAK07x3jgXekJC2_LYKFDRW6eg",
  },
  {
    id: 3,
    name: "DS. Lê Thị Hoa",
    role: "Chuyên viên tư vấn",
    meta: "Ưu tiên trải nghiệm dễ hiểu cho người mua thuốc lần đầu",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAI1NgMUMT5GFlBhfRyzKPtr2Gz5zL9DdRkWIEaDl2Kar-CP_jzxCO-yC2p3tW3Ts6yqoL0I4kgAl00B0E8HK445Jxi5cVHSrK9_KupJ-IoJqpNbwMejF-5pNxpcl5pH-PbdibCqFUlcGT5xIr6BOx_48dlEBN7oLZtsHvC2l9ye59OkkG8VEO1oTMHngMXzDuSqIAKkFR-c_Yh5eUz9d7fYuA8nmJsrXGoXdNqF5hkwa3e8m7kfIs7xVwzrEEuPj1KgCtEc--AHDcH",
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
            Không chỉ đúng chuyên môn, đội ngũ còn được định hướng để giao tiếp dễ hiểu,
            giúp người dùng ít áp lực hơn khi tiếp cận thông tin sức khỏe.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pharmacists.map((person) => (
            <article
              key={person.id}
              className="storefront-soft-card storefront-interactive overflow-hidden rounded-[28px]"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${person.image}')` }}
              />
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-900">{person.name}</h3>
                <p className="mt-1 text-sm font-semibold text-sky-700">{person.role}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{person.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
