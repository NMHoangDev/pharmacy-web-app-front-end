import React from "react";

const TrustSection = () => {
  return (
    <section className="py-16 bg-blue-50/50 dark:bg-slate-800/30 border-y border-blue-100 dark:border-slate-700">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-4xl icon-filled">
                verified_user
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Thuốc chính hãng 100%
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[250px]">
              Cam kết sản phẩm có nguồn gốc rõ ràng, đầy đủ hóa đơn chứng từ.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 relative md:after:content-[''] md:after:absolute md:after:right-0 md:after:top-1/4 md:after:h-1/2 md:after:w-[1px] md:after:bg-slate-200 dark:md:after:bg-slate-700 md:before:content-[''] md:before:absolute md:before:left-0 md:before:top-1/4 md:before:h-1/2 md:before:w-[1px] md:before:bg-slate-200 dark:md:before:bg-slate-700">
            <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-4xl icon-filled">
                support_agent
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Tư vấn chuyên môn
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[250px]">
              Đội ngũ dược sĩ đại học tư vấn tận tâm, chính xác và miễn phí.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="size-16 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-4xl icon-filled">
                local_shipping
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Giao hàng nhanh 2h
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[250px]">
              Giao hàng siêu tốc trong nội thành, đóng gói kín đáo, bảo mật.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
