import React from "react";

const btnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700";

const ActionButtons = ({ onEdit, onDelete, className = "", children }) => {
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`.trim()}>
      {children}
      <button
        className={btnClass}
        type="button"
        onClick={onEdit}
        aria-label="Sửa"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      <button
        className={`${btnClass} hover:bg-rose-50 hover:text-rose-600`}
        type="button"
        onClick={onDelete}
        aria-label="Xóa"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  );
};

export default ActionButtons;
