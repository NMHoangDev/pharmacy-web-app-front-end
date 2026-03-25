import React from "react";
import CommonFilterBar from "../../common/FilterBar";

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
          placeholder="Tìm theo tên hoặc email"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
        />
      </div>

      <select
        value={branchId || ""}
        onChange={(event) => onBranchChange?.(event.target.value)}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="">Tất cả chi nhánh</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <select
        value={specialty}
        onChange={(event) => onSpecialtyChange(event.target.value)}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="all">Tất cả vai trò</option>
        <option value="clinical">Dược sĩ lâm sàng</option>
        <option value="retail">Dược sĩ quầy thuốc</option>
        <option value="hospital">Dược sĩ bệnh viện</option>
        <option value="research">Nghiên cứu</option>
        <option value="online">Tư vấn trực tuyến</option>
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="VERIFIED">Đã xác thực</option>
        <option value="PENDING">Chờ xác thực</option>
        <option value="SUSPENDED">Tạm khóa</option>
      </select>

      <select
        value={sortValue}
        onChange={(event) => {
          const [nextSortBy, nextSortDir] = String(event.target.value).split(
            "|",
          );
          onSortChange(nextSortBy, nextSortDir);
        }}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="name|asc">Tên A - Z</option>
        <option value="name|desc">Tên Z - A</option>
        <option value="createdAt|desc">Mới nhất</option>
        <option value="createdAt|asc">Cũ nhất</option>
      </select>
    </>
  );

  return <CommonFilterBar controls={controls} />;
});

export default FilterBar;
