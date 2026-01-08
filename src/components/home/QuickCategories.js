import React from "react";

const QuickCategories = () => {
  return (
    <section className="py-12 bg-background-light dark:bg-background-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Danh mục nhanh
          </h2>
          <a
            href="#"
            className="text-sm font-semibold text-primary hover:text-blue-600 flex items-center gap-1"
          >
            Xem tất cả
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="#"
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <div className="size-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">pill</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center group-hover:text-primary transition-colors">
              Thuốc không kê đơn
            </h3>
            <p className="text-xs text-slate-500 mt-1">120+ Sản phẩm</p>
          </a>

          <a
            href="#"
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <div className="size-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                nutrition
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center group-hover:text-primary transition-colors">
              Vitamin &amp; TPCN
            </h3>
            <p className="text-xs text-slate-500 mt-1">85+ Sản phẩm</p>
          </a>

          <a
            href="#"
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <div className="size-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                elderly
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center group-hover:text-primary transition-colors">
              Chăm sóc người già
            </h3>
            <p className="text-xs text-slate-500 mt-1">45+ Sản phẩm</p>
          </a>

          <a
            href="#"
            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <div className="size-14 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">
                child_care
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-center group-hover:text-primary transition-colors">
              Mẹ và Bé
            </h3>
            <p className="text-xs text-slate-500 mt-1">200+ Sản phẩm</p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;
