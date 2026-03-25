import React from "react";

const AdminTableWrapper = ({ children, className = "", padded = true }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${
        padded ? "p-3 sm:p-4" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default AdminTableWrapper;
