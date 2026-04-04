import React from "react";

const StatCard = ({ title, value, suffix, change, changeType, icon, note }) => {
  const isUp = changeType === "up";
  const changeColor = isUp
    ? "bg-green-50 text-green-600 dark:bg-green-500/10"
    : "bg-red-50 text-red-500 dark:bg-red-500/10";

  return (
    <div className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-slate-400">
                {" "}
                {suffix}
              </span>
            )}
          </h3>
        </div>
        <div className="rounded-2xl bg-primary/10 p-2.5 text-primary dark:bg-primary/15 dark:text-primary-light">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {change && (
          <span
            className={`flex items-center rounded-xl px-2 py-1 text-xs font-semibold ${changeColor}`}
          >
            {isUp ? (
              <span className="material-symbols-outlined mr-0.5 text-[16px]">
                trending_up
              </span>
            ) : (
              <span className="material-symbols-outlined mr-0.5 text-[16px]">
                trending_down
              </span>
            )}
            {change}
          </span>
        )}
        {note && (
          <span className="text-slate-400 dark:text-slate-500">{note}</span>
        )}
      </div>
    </div>
  );
};

const StatsGrid = ({ stats }) => (
  <div
    className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
      {
        5: "lg:grid-cols-5",
      }[Math.min(5, stats?.length || 0)] || "lg:grid-cols-4"
    }`}
  >
    {stats.map((item) => (
      <StatCard key={item.key} {...item} />
    ))}
  </div>
);

export default StatsGrid;
