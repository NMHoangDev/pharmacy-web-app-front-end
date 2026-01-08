import React from "react";
import { Link } from "react-router-dom";

// Generic breadcrumb component that can be reused across pages
// items: [{ label: string, to?: string }]
// The last item is treated as the current page and rendered as plain text.
const Breadcrumbs = ({ items = [], homeLabel = "Trang chủ" }) => {
  if (!items.length) return null;

  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center text-xs sm:text-sm text-slate-500">
        <li>
          <Link
            to="/"
            className="inline-flex items-center font-medium text-slate-500 hover:text-primary"
          >
            <span className="material-symbols-outlined mr-1 text-[18px]">
              home
            </span>
            {homeLabel}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          return (
            <li
              key={key}
              className="inline-flex items-center font-medium text-slate-500"
            >
              <span className="mx-2 text-slate-400">/</span>
              {isLast || !item.to ? (
                <span
                  className={`inline-flex items-center ${
                    isLast
                      ? "text-slate-300 dark:text-slate-200"
                      : "text-slate-400"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="inline-flex items-center font-medium text-slate-500 hover:text-primary"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
