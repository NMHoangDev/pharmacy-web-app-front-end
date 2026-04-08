import React from "react";

const PaymentStats = ({ stats }) => {
  const cards = [
    {
      key: "revenue",
      title: "Tổng doanh thu (Hôm nay)",
      value: stats.revenue,
      trend: "+12.5%",
      trendColor: "text-green-600",
      icon: "payments",
      iconBg: "bg-blue-50 dark:bg-blue-900/20 text-primary",
    },
    {
      key: "failed",
      title: "Giao dịch lỗi",
      value: stats.failed,
      subtitle: "Cần xử lý ngay",
      subtitleColor: "text-red-500",
      icon: "error",
      iconBg: "bg-red-50 dark:bg-red-900/20 text-red-600",
    },
    {
      key: "pending",
      title: "Đang chờ xử lý",
      value: stats.pending,
      subtitle: "Đơn hàng COD",
      icon: "hourglass_top",
      iconBg: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {card.value}
            </p>
            {card.trend && (
              <div
                className={`flex items-center gap-1 mt-1 text-sm ${card.trendColor}`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  trending_up
                </span>
                <span>{card.trend}</span>
              </div>
            )}
            {card.subtitle && (
              <p
                className={`text-xs mt-1 font-medium ${
                  card.subtitleColor || "text-slate-400"
                }`}
              >
                {card.subtitle}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${card.iconBg}`}>
            <span className="material-symbols-outlined">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentStats;
