import React from "react";
import CommonFilterBar from "../../../../shared/components/common/FilterBar";

const OrdersToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  payment,
  onPaymentChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  onReset,
}) => {
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "processing", label: "Đang xử lý" },
    { key: "completed", label: "Hoàn tất" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const controls = (
    <>
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
          placeholder="Tìm mã đơn, tên khách hàng"
          type="text"
        />
      </div>

      <select
        value={payment}
        onChange={(e) => onPaymentChange(e.target.value)}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="all">Tất cả thanh toán</option>
        <option value="paid">Đã thanh toán</option>
        <option value="unpaid">Chưa thanh toán</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
      </select>

      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 focus:border-primary focus:ring-primary sm:h-10 sm:text-sm"
      >
        <option value={10}>10 / trang</option>
        <option value={20}>20 / trang</option>
        <option value={50}>50 / trang</option>
      </select>

      <button
        type="button"
        onClick={onReset}
        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:h-10 sm:text-sm"
      >
        Đặt lại
      </button>
    </>
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = status === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={
              isActive
                ? "whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-200"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return <CommonFilterBar controls={controls} footer={footer} />;
};

export default OrdersToolbar;
