import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  (
    { className, variant = "default", size = "md", type = "button", ...props },
    ref,
  ) => {
    const variants = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
      outline:
        "border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
      ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white",
      success: "bg-emerald-600 text-white hover:bg-emerald-700",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
