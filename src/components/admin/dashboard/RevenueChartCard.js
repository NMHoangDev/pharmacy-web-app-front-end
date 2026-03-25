import React from "react";

const RevenueChartCard = ({
  bars = [],
  title = "Biểu đồ Doanh thu",
  subtitle = "Theo dõi xu hướng 7 ngày qua",
  loading = false,
  empty = false,
}) => {
  const safeBars = Array.isArray(bars) ? bars : [];

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <a
          className="text-primary text-sm font-medium hover:underline"
          href="/admin/orders"
        >
          Chi tiết
        </a>
      </div>

      <div className="relative h-64 w-full">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full h-px bg-slate-100 dark:bg-slate-700"
            />
          ))}
        </div>

        {loading ? (
          <div className="relative z-10 w-full h-full flex items-end justify-between gap-3 px-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm animate-pulse"
                  style={{ height: `${20 + (i % 5) * 12}%` }}
                />
                <span className="text-xs text-slate-400">…</span>
              </div>
            ))}
          </div>
        ) : empty || safeBars.length === 0 ? (
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="text-sm text-slate-500">
              Chưa có dữ liệu cho khoảng thời gian này
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full h-full flex items-end justify-between gap-3 px-1">
            {safeBars.map((bar, index) => {
              const label = bar?.label ?? String(index + 1);
              const value = bar?.value ?? "";
              const height = Number.isFinite(bar?.height)
                ? Math.max(0, Math.min(100, bar.height))
                : 0;

              return (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="relative w-full bg-primary/20 rounded-t-sm hover:bg-primary/30 transition-all"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              );
            })}

            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                className="drop-shadow-sm"
                d={safeBars
                  .map((bar, idx) => {
                    const xStep = 100 / Math.max(safeBars.length - 1, 1);
                    const x = idx * xStep;
                    const height = Number.isFinite(bar?.height)
                      ? Math.max(0, Math.min(100, bar.height))
                      : 0;
                    const y = 100 - height;
                    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#137fec"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChartCard;
