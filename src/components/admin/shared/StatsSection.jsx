import React from "react";
import StatsCard from "./StatsCard";

const StatsSection = ({
  items = [],
  loading = false,
  emptyText = "No summary data",
}) => {
  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[144px] animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/70"
          />
        ))}
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
        {emptyText}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatsCard key={item.key || item.label} {...item} />
      ))}
    </section>
  );
};

export default StatsSection;
