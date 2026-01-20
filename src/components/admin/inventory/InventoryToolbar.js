import React, { useMemo } from "react";

// Accepts either the older {filters, onChange, onAdd} API or the newer
// {activeFilter, onFilterChange, onSearch} API used by AdminInventoryPage.
const InventoryToolbar = ({
  filters,
  onChange,
  onAdd,
  activeFilter,
  onFilterChange,
  onSearch,
}) => {
  const mergedFilters = useMemo(
    () => ({
      query: "",
      category: activeFilter || "all",
      status: "all",
      ...(filters || {}),
    }),
    [filters, activeFilter]
  );

  const handleQueryChange = (value) => {
    if (onChange) onChange({ ...mergedFilters, query: value });
    if (onSearch) onSearch(value);
  };

  const handleCategoryChange = (value) => {
    if (onChange) onChange({ ...mergedFilters, category: value });
    if (onFilterChange) onFilterChange(value);
  };

  const handleStatusChange = (value) => {
    if (onChange) onChange({ ...mergedFilters, status: value });
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
          search
        </span>
        <input
          value={mergedFilters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          placeholder="Tìm tên thuốc, mã SKU..."
          type="text"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
        <select
          value={mergedFilters.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="h-10 min-w-[160px] cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="all">Tất cả danh mục</option>
          <option value="antibiotic">Thuốc kháng sinh</option>
          <option value="painkiller">Giảm đau, hạ sốt</option>
          <option value="supplement">Thực phẩm chức năng</option>
          <option value="medical">Vật tư y tế</option>
          <option value="device">Thiết bị y tế</option>
          <option value="drug">Thuốc kê đơn/OTC</option>
        </select>
        <select
          value={mergedFilters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-10 min-w-[140px] cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in">Còn hàng</option>
          <option value="low">Sắp hết</option>
          <option value="out">Hết hàng</option>
        </select>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm thuốc mới
        </button>
      </div>
    </div>
  );
};

export default InventoryToolbar;
