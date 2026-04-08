import React from "react";

const AdminStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {card.value}
              </p>
              {card.delta && (
                <p className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    trending_up
                  </span>
                  {card.delta}
                </p>
              )}
            </div>
            <div
              className={`p-3 rounded-lg text-white ${
                card.tint || "bg-primary"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {card.icon}
              </span>
            </div>
          </div>
          {card.caption && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {card.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
