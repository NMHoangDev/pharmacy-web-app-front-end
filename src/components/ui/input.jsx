import React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
