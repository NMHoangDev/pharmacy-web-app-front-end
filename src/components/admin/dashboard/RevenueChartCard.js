import React from "react";

const RevenueChartCard = ({ bars }) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Biểu đồ Doanh thu
          </h3>
          <p className="text-sm text-slate-500">Theo dõi xu hướng 7 ngày qua</p>
        </div>
        <button className="text-primary text-sm font-medium hover:underline">
          Chi tiết
        </button>
      </div>

      <div className="relative h-64 w-full flex items-end justify-between gap-3 px-1">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="w-full h-px bg-slate-100 dark:bg-slate-700"
            />
          ))}
        </div>

        {bars.map((bar) => (
          <div
            key={bar.label}
            className="flex-1 flex flex-col items-center gap-2 group"
          >
            <div
              className="relative w-full bg-primary/20 rounded-t-sm hover:bg-primary/30 transition-all"
              style={{ height: `${bar.height}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {bar.value}
              </div>
            </div>
            <span className="text-xs text-slate-500">{bar.label}</span>
          </div>
        ))}

        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            className="drop-shadow-sm"
            d={bars
              .map((bar, idx) => {
                const xStep = 100 / Math.max(bars.length - 1, 1);
                const x = idx * xStep;
                const y = 100 - bar.height;
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
    </div>
  );
};

export default RevenueChartCard;
