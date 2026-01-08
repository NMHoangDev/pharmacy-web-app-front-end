import React from "react";

const PharmacistsFilters = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-24 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
        <span className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined text-primary">
            filter_list
          </span>
          Bộ lọc
        </span>
        <button className="text-sm text-slate-500 hover:text-primary">
          Xóa tất cả
        </button>
      </div>

      <details
        className="group py-2 border-b border-slate-100 dark:border-slate-700"
        open
      >
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-900 dark:text-white">
          <span>Chuyên môn</span>
          <span className="transition group-open:rotate-180">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </span>
        </summary>
        <div className="text-slate-500 mt-3 flex flex-col gap-2">
          {["Dược lâm sàng", "Dược nhi", "Tư vấn TPCN", "Dược mỹ phẩm"].map(
            (label, index) => (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer hover:text-primary"
              >
                <input
                  type="checkbox"
                  defaultChecked={index === 0}
                  className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm">{label}</span>
              </label>
            )
          )}
        </div>
      </details>

      <details
        className="group py-2 border-b border-slate-100 dark:border-slate-700"
        open
      >
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-900 dark:text-white">
          <span>Hình thức tư vấn</span>
          <span className="transition group-open:rotate-180">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </span>
        </summary>
        <div className="text-slate-500 mt-3 flex flex-col gap-2">
          {["Online (Video/Chat)", "Tại quầy thuốc"].map((label, index) => (
            <label
              key={label}
              className="flex items-center gap-3 cursor-pointer hover:text-primary"
            >
              <input
                type="checkbox"
                defaultChecked={index === 0}
                className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </details>

      <details
        className="group py-2 border-b border-slate-100 dark:border-slate-700"
        open
      >
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-900 dark:text-white">
          <span>Kinh nghiệm</span>
          <span className="transition group-open:rotate-180">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </span>
        </summary>
        <div className="text-slate-500 mt-3 flex flex-col gap-2">
          {["Dưới 3 năm", "3 - 5 năm", "Trên 5 năm"].map((label) => (
            <label
              key={label}
              className="flex items-center gap-3 cursor-pointer hover:text-primary"
            >
              <input
                type="checkbox"
                className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </details>

      <details
        className="group py-2 border-b border-slate-100 dark:border-slate-700"
        open
      >
        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-900 dark:text-white">
          <span>Đánh giá</span>
          <span className="transition group-open:rotate-180">
            <span className="material-symbols-outlined text-xl">
              expand_more
            </span>
          </span>
        </summary>
        <div className="text-slate-500 mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer hover:text-primary">
            <input
              type="checkbox"
              className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            <span className="flex items-center gap-1 text-sm">
              4
              <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                star
              </span>
              trở lên
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:text-primary">
            <input
              type="checkbox"
              className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            <span className="flex items-center gap-1 text-sm">
              5
              <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                star
              </span>
            </span>
          </label>
        </div>
      </details>

      <button className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow hover:bg-primary-dark transition-colors">
        Áp dụng
      </button>
    </aside>
  );
};

export default PharmacistsFilters;
