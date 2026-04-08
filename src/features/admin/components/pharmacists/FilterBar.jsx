import React from "react";
import CommonFilterBar from "../../../../shared/components/common/FilterBar";

const specialtyOptions = [
  { value: "all", label: "Tat ca chuyen mon" },
  { value: "clinical", label: "Duoc lam sang" },
  { value: "general", label: "Tong quat" },
  { value: "pediatric", label: "Duoc nhi" },
  { value: "supplement", label: "Tu van TPCN" },
  { value: "cosmetic", label: "Duoc my pham" },
  { value: "obstetric", label: "Duoc san phu" },
  { value: "retail", label: "Duoc si quay thuoc" },
  { value: "hospital", label: "Duoc si benh vien" },
  { value: "research", label: "Nghien cuu" },
  { value: "online", label: "Tu van truc tuyen" },
];

const statusOptions = [
  { value: "all", label: "Tat ca trang thai" },
  { value: "VERIFIED", label: "Da xac thuc" },
  { value: "PENDING", label: "Cho xac thuc" },
  { value: "ONLINE", label: "Dang online" },
  { value: "OFFLINE", label: "Ngoai tuyen" },
  { value: "BUSY", label: "Ban" },
  { value: "ACTIVE", label: "Hoat dong" },
  { value: "SUSPENDED", label: "Tam khoa" },
];

const sortOptions = [
  { value: "createdAt|desc", label: "Moi nhat" },
  { value: "createdAt|asc", label: "Cu nhat" },
  { value: "updatedAt|desc", label: "Cap nhat gan day" },
  { value: "name|asc", label: "Ten A - Z" },
  { value: "name|desc", label: "Ten Z - A" },
];

const selectClassName =
  "h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm";

const FilterBar = React.memo(function FilterBar({
  query,
  onQueryChange,
  branchId,
  branches = [],
  onBranchChange,
  specialty,
  onSpecialtyChange,
  status,
  onStatusChange,
  sortBy,
  sortDir,
  onSortChange,
  pageSize,
  onPageSizeChange,
  onClearAll,
}) {
  const sortValue = `${sortBy}|${sortDir}`;

  const controls = (
    <>
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tim theo ten, email, so dien thoai, ma duoc si"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
        />
      </div>

      <select
        value={branchId || ""}
        onChange={(event) => onBranchChange?.(event.target.value)}
        className={selectClassName}
      >
        <option value="">Tat ca chi nhanh</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <select
        value={specialty}
        onChange={(event) => onSpecialtyChange(event.target.value)}
        className={selectClassName}
      >
        {specialtyOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className={selectClassName}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={sortValue}
        onChange={(event) => {
          const [nextSortBy, nextSortDir] = String(event.target.value).split(
            "|",
          );
          onSortChange(nextSortBy, nextSortDir);
        }}
        className={selectClassName}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        className={selectClassName}
      >
        {[10, 20, 50].map((value) => (
          <option key={value} value={value}>
            {value} / trang
          </option>
        ))}
      </select>
    </>
  );

  return (
    <CommonFilterBar
      controls={controls}
      trailing={
        <button
          type="button"
          onClick={onClearAll}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:h-10 sm:text-sm"
        >
          Xoa bo loc
        </button>
      }
    />
  );
});

export default FilterBar;
