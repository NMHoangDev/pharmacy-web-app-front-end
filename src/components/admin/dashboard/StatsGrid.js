import React from "react";

const StatCard = ({ title, value, suffix, change, changeType, icon, note }) => {
  const isUp = changeType === "up";
  const changeColor = isUp
    ? "text-green-600 bg-green-50 dark:bg-green-500/10"
    : "text-red-500 bg-red-50 dark:bg-red-500/10";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-slate-400">
                {" "}
                {suffix}
              </span>
            )}
          </h3>
        </div>
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {change && (
          <span
            className={`flex items-center font-medium px-1.5 py-0.5 rounded ${changeColor}`}
          >
            {isUp ? (
              <span className="material-symbols-outlined text-[16px] mr-0.5">
                trending_up
              </span>
            ) : (
              <span className="material-symbols-outlined text-[16px] mr-0.5">
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((item) => (
      <StatCard key={item.key} {...item} />
    ))}
  </div>
);

export default StatsGrid;
