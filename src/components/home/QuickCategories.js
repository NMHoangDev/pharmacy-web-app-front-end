import React from "react";

const QuickCategories = () => {
  const items = [
    { icon: "pill", title: "Thuốc không kê đơn", sub: "120+ Sản phẩm" },
    { icon: "nutrition", title: "Vitamin & TPCN", sub: "85+ Sản phẩm" },
    { icon: "elderly", title: "Chăm sóc người già", sub: "45+ Sản phẩm" },
    { icon: "child_care", title: "Mẹ và Bé", sub: "200+ Sản phẩm" },
  ];

  return (
    <section className="py-12 bg-background-light dark:bg-background-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Danh mục nhanh
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Chọn nhanh theo nhu cầu phổ biến
            </p>
          </div>

          <a
            href="#"
            className="text-sm font-semibold text-primary hover:opacity-90 flex items-center gap-1"
          >
            Xem tất cả
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <a
              key={it.title}
              href="#"
              className="group p-6 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="size-14 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center text-primary mb-4
                           group-hover:scale-110 transition-transform duration-300"
              >
                <span className="material-symbols-outlined text-3xl">
                  {it.icon}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {it.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {it.sub}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;
