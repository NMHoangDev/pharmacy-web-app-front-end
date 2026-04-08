import React, { useMemo } from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const InventoryStats = ({ stats }) => {
  const cards = useMemo(() => {
    if (Array.isArray(stats)) return stats;

    const safeStats = stats || {};
    return [
      {
        key: "total-stock",
        title: "Tổng tồn kho",
        value: (safeStats.totalStock || 0).toLocaleString("vi-VN"),
        valueColor: "text-primary",
        icon: "inventory_2",
        iconBg: "bg-primary/10",
        text: "text-primary",
        bg: "bg-primary/5",
        border: "border-primary/30",
      },
      {
        key: "low-stock",
        title: "Sản phẩm sắp hết",
        value: (safeStats.lowStock || 0).toLocaleString("vi-VN"),
        valueColor: "text-amber-600",
        icon: "warning",
        iconBg: "bg-amber-100 dark:bg-amber-900/60",
        text: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
        caption: "< 20 đơn vị / SKU",
      },
      {
        key: "inventory-value",
        title: "Giá trị tồn kho",
        value: formatCurrency(safeStats.value || 0),
        valueColor: "text-emerald-600",
        icon: "payments",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
        text: "text-emerald-700",
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
        border: "border-emerald-200 dark:border-emerald-800",
        caption: "Tổng = giá x tồn",
      },
    ];
  }, [stats]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((item) => (
        <div
          key={item.key}
          className={`rounded-xl border ${item.border} ${item.bg} p-4 dark:border-opacity-30`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${item.text}`}>{item.title}</p>
              <h3 className={`mt-2 text-3xl font-bold ${item.valueColor}`}>
                {item.value}
              </h3>
            </div>
            <div className={`rounded-lg p-2 ${item.iconBg} ${item.text}`}>
              <span className="material-symbols-outlined block">
                {item.icon}
              </span>
            </div>
          </div>
          {item.caption && (
            <div className="mt-4">
              <span className={`text-xs font-medium underline ${item.text}`}>
                {item.caption}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
