import React from "react";
import { Stagger, StaggerItem, Reveal } from "../ui/Reveal";
import { motion } from "framer-motion";

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
    <section className="px-4 py-10">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[#0d141b] dark:text-white text-[24px] md:text-[26px] font-black tracking-[-0.02em]">
              Đội ngũ Dược sĩ Chuyên môn
            </h2>
            <p className="mt-1 text-[#4c739a] dark:text-slate-300 text-sm">
              Xác minh chứng chỉ • Tư vấn tận tâm • Hỗ trợ nhanh
            </p>
          </div>

          <button className="text-primary text-sm font-bold inline-flex items-center gap-1 hover:opacity-90">
            Xem tất cả
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </Reveal>

      <Stagger className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pharmacists.map((p) => (
          <StaggerItem key={p.id}>
            <motion.article
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.99 }}
              className="group cursor-pointer rounded-2xl border border-slate-200/70 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/30 backdrop-blur overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${p.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]" />

                {p.experience && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/35 border border-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      {p.experience}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[#0d141b] dark:text-white text-base font-extrabold leading-snug">
                        {p.name}
                      </p>
                      <span
                        className="material-symbols-outlined text-primary text-[18px]"
                        title="Đã xác minh"
                      >
                        verified
                      </span>
                    </div>

                    <p className="mt-1 text-primary text-sm font-semibold">
                      {p.role}
                    </p>

                    {p.license && (
                      <p className="mt-2 text-[#4c739a] dark:text-slate-300 text-xs">
                        {p.license}
                      </p>
                    )}
                  </div>

                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      chat
                    </span>
                  </div>
                </div>

                <div className="mt-4 h-px bg-slate-200/70 dark:bg-slate-800/60" />

                <div className="mt-3 flex items-center justify-between text-xs text-[#4c739a] dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>
                    Phản hồi nhanh
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      shield
                    </span>
                    Bảo mật
                  </span>
                </div>
              </div>
            </motion.article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default TeamSection;
