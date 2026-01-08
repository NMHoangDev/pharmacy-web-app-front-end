import React from "react";

const formatCurrency = (value) => {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value.toLocaleString("vi-VN")} đ`;
};

const MedicinesFilters = ({
  priceRange,
  minPrice,
  maxPrice,
  onChangePriceRange,
}) => {
  const brands = [
    "Panadol",
    "Tylenol",
    "Advil",
    "Efferalgan",
    "Hapacol",
    "Voltaren",
    "Salonpas",
  ];

  const audiences = [
    "Người lớn",
    "Trẻ em",
    "Người cao tuổi",
    "Phụ nữ mang thai",
    "Mẹ & bé",
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-24 z-30">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
            <h3 className="font-bold">Bộ lọc</h3>
          </div>
          <button className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline">
            Xóa tất cả
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Khoảng giá */}
          <div className="p-5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Khoảng giá
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Giá thấp nhất</label>
                <input
                  type="range"
                  min={minPrice}
                  max={priceRange.max}
                  step={10000}
                  value={priceRange.min}
                  onChange={(e) =>
                    onChangePriceRange({
                      ...priceRange,
                      min: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Giá cao nhất</label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={maxPrice}
                  step={10000}
                  value={priceRange.max}
                  onChange={(e) =>
                    onChangePriceRange({
                      ...priceRange,
                      max: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                {formatCurrency(priceRange.min)}
              </div>
              <span>-</span>
              <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                {formatCurrency(priceRange.max)}
              </div>
            </div>
          </div>

          {/* Nhóm sản phẩm */}
          <details className="group p-4" open>
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 dark:text-white list-none">
              <span className="text-sm">Nhóm sản phẩm</span>
              <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400 text-[20px]">
                expand_more
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Thuốc giảm đau, hạ sốt
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Thuốc kháng viêm
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Thuốc giãn cơ
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Vitamin &amp; khoáng chất
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Thực phẩm chức năng
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group/item">
                <input
                  type="checkbox"
                  className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                  Chăm sóc cá nhân
                </span>
              </label>
            </div>
          </details>

          {/* Thương hiệu */}
          <details className="group p-4">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 dark:text-white list-none">
              <span className="text-sm">Thương hiệu</span>
              <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400 text-[20px]">
                expand_more
              </span>
            </summary>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-3 cursor-pointer group/item"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </details>

          {/* Đối tượng sử dụng */}
          <details className="group p-4">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 dark:text-white list-none">
              <span className="text-sm">Đối tượng sử dụng</span>
              <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-slate-400 text-[20px]">
                expand_more
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              {audiences.map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-3 cursor-pointer group/item"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover/item:text-primary transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
};

export default MedicinesFilters;
