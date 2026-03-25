import React from "react";
import { Stagger, StaggerItem } from "../ui/Reveal";

const CommitmentSection = () => {
  const items = [
    { icon: "medication", title: "Thuốc chính hãng", desc: "100% nguồn gốc rõ ràng" },
    { icon: "school", title: "Tư vấn chuyên môn", desc: "Dược sĩ đại học trực tiếp" },
    { icon: "lock", title: "Bảo mật thông tin", desc: "Dữ liệu được mã hóa an toàn" },
  ];

  return (
    <section className="px-4 py-10">
      <div className="rounded-2xl border border-blue-100/70 dark:border-slate-700 bg-gradient-to-br from-blue-50/70 to-white/60 dark:from-slate-900/60 dark:to-slate-950/40 backdrop-blur p-6 md:p-8">
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <StaggerItem key={it.title}>
              <div className="group rounded-2xl bg-white/70 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/60 p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">
                        {it.icon}
                      </span>
                    </div>
                    <div className="absolute -inset-1 rounded-2xl bg-primary/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div>
                    <h3 className="text-[#0d141b] dark:text-white font-extrabold text-lg leading-tight">
                      {it.title}
                    </h3>
                    <p className="text-[#4c739a] dark:text-slate-300 text-sm mt-1">
                      {it.desc}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default CommitmentSection;
