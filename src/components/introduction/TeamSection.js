import React from "react";

const pharmacists = [
  {
    id: 1,
    name: "DS. Nguyễn Thị Lan",
    role: "Trưởng khoa Dược",
    license: "CCHN: 1245/BYT-CCHN",
    experience: "10 năm kinh nghiệm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-RbBTpinOJtsoz9KvvtQthajpIwjwUFDYF6xtmMlXu2vqGZ4kgLqFNA9kMa04wzUXmqexJHAlodAbh7ematOdk4Qg-JY9TUB6qRbIPbuMonMZckF7LgKl7X05-gHgnMThVyF1GTXwAXDrL1CyJEkbXiy9P62x0lLI09c8iURpCNaohnKGwzPrVREw1xOph_AS1LC7SRSACP3T7aBXPCyJAu0CRFLzm3qXNtzZnIoDs_T3jFRSKA8z3QcxkbdOjiNm1PXGA1ixekih",
  },
  {
    id: 2,
    name: "DS. Trần Văn Minh",
    role: "Dược sĩ Lâm sàng",
    license: "CCHN: 2981/BYT-CCHN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdYJMm0pxYmXc-m1qVBIbGeM8dwtQtDIxCyVu_wPUqUaSwmtX0u_H5HSyPUkkRhJaq5sfh0ALlE3B8TksVAPkaDgla1fInxN-wmAmaJ-tdV7v_3m4WhXm_Q4Y9HggBIyxcgSVkTXPy1r7aFRel4YGFxrmWB4hPWrbj7CSEfkhHxx4HEAOSYfRcZ9-JnkHvgZH7wODvcqM1x-HAU2kLdex9HyYz5phlVHZ_bS4LLN39XPTDoJ8UDkZAK07x3jgXekJC2_LYKFDRW6eg",
  },
  {
    id: 3,
    name: "DS. Lê Thị Hoa",
    role: "Chuyên viên tư vấn",
    license: "CCHN: 3342/BYT-CCHN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAI1NgMUMT5GFlBhfRyzKPtr2Gz5zL9DdRkWIEaDl2Kar-CP_jzxCO-yC2p3tW3Ts6yqoL0I4kgAl00B0E8HK445Jxi5cVHSrK9_KupJ-IoJqpNbwMejF-5pNxpcl5pH-PbdibCqFUlcGT5xIr6BOx_48dlEBN7oLZtsHvC2l9ye59OkkG8VEO1oTMHngMXzDuSqIAKkFR-c_Yh5eUz9d7fYuA8nmJsrXGoXdNqF5hkwa3e8m7kfIs7xVwzrEEuPj1KgCtEc--AHDcH",
  },
  {
    id: 4,
    name: "DS. Phạm Anh Tuấn",
    role: "Dược sĩ Đại học",
    license: "CCHN: 4410/BYT-CCHN",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOrYEGhBnIAbc9eWlE_SB7YYr6wok9_YNve5rpydHYJe1argRt503Upi_RUbZYNRrXbXv5C0GCXSGSImaJ-q5gz1XoTj5doSLSKwimQuiUZRn9qJEp1zpXzdrOnh7fwYQ0SRnBPvIY-nXPiF9Ojrw72mblfpjPgWqj8GB5nZL4IjMPrR53BzOQ7JyLz_wMYr0q-GPaNS2VXfW393JZTZqfV2kXGSjABZ-OXUL5m5pfOIGdNvJ_63elzM20WYSY-9denQ-buuwbP0s5",
  },
];

const TeamSection = () => {
  return (
    <section>
      <div className="px-4 pb-3 pt-5 flex items-center justify-between">
        <h2 className="text-[#0d141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Đội ngũ Dược sĩ Chuyên môn
        </h2>
        <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
          Xem tất cả
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 p-4">
        {pharmacists.map((pharmacist) => (
          <article
            key={pharmacist.id}
            className="flex flex-col gap-3 pb-3 group cursor-pointer"
          >
            <div
              className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-all"
              style={{ backgroundImage: `url('${pharmacist.image}')` }}
            >
              {pharmacist.experience && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
                  <p className="text-white text-xs font-medium opacity-90">
                    {pharmacist.experience}
                  </p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[#0d141b] dark:text-white text-lg font-bold leading-normal">
                  {pharmacist.name}
                </p>
                <span
                  className="material-symbols-outlined text-primary text-[18px]"
                  title="Đã xác minh"
                >
                  verified
                </span>
              </div>
              <p className="text-primary text-sm font-semibold leading-normal">
                {pharmacist.role}
              </p>
              {pharmacist.license && (
                <p className="text-[#4c739a] dark:text-slate-300 text-xs font-normal leading-normal mt-1">
                  {pharmacist.license}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
