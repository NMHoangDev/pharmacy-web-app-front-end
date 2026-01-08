import React from "react";

const CommitmentSection = () => {
  return (
    <section className="px-4 py-8 my-8 bg-blue-50/50 dark:bg-slate-900/40 rounded-2xl border border-blue-100 dark:border-slate-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 divide-y md:divide-y-0 md:divide-x divide-blue-200 dark:divide-slate-700">
        <div className="flex flex-col items-center text-center gap-3 flex-1 w-full pt-4 md:pt-0">
          <div className="size-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-3xl">
              medication
            </span>
          </div>
          <div>
            <h3 className="text-[#0d141b] dark:text-white font-bold text-lg">
              Thuốc chính hãng
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm mt-1">
              100% sản phẩm có nguồn gốc rõ ràng
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-3 flex-1 w-full pt-4 md:pt-0">
          <div className="size-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <div>
            <h3 className="text-[#0d141b] dark:text-white font-bold text-lg">
              Tư vấn chuyên môn
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm mt-1">
              Dược sĩ đại học trực tiếp tư vấn
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-3 flex-1 w-full pt-4 md:pt-0">
          <div className="size-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div>
            <h3 className="text-[#0d141b] dark:text-white font-bold text-lg">
              Bảo mật thông tin
            </h3>
            <p className="text-[#4c739a] dark:text-slate-300 text-sm mt-1">
              Dữ liệu khách hàng được mã hóa an toàn
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommitmentSection;
