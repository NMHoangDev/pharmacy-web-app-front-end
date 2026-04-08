import React from "react";

const AdminTableWrapper = ({ children, className = "", padded = true }) => {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70 ${
        padded ? "p-3 sm:p-4" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default AdminTableWrapper;
