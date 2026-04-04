import React from "react";

const trendToneClass = {
  up: "border-emerald-200 bg-emerald-50 text-emerald-700",
  down: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

const StatsCard = ({
  label,
  value,
  description,
  trend,
  tone = "neutral",
  icon,
}) => {
  const trendClass = trendToneClass[tone] || trendToneClass.neutral;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        {icon ? (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[20px]">
              {icon}
            </span>
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}

      {trend ? (
        <p
          className={`mt-4 inline-flex rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${trendClass}`}
        >
          {trend}
        </p>
      ) : null}
    </article>
  );
};

export default StatsCard;
