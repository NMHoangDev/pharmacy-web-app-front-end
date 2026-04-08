import React from "react";
import { cn } from "../../lib/utils";

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
    secondary:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    outline:
      "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
};

export { Badge };
