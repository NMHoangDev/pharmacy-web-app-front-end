import React, { useEffect, useRef, useState } from "react";

const ActionDropdown = React.memo(function ActionDropdown({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const run = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Actions"
      >
        <span className="material-symbols-outlined text-[18px]">
          more_horiz
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            className="w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => run(onView)}
          >
            View Detail
          </button>
          <button
            type="button"
            className="w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => run(onEdit)}
          >
            Edit
          </button>
          <button
            type="button"
            className="w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => run(onToggleStatus)}
          >
            Change Status
          </button>
          <button
            type="button"
            className="w-full rounded px-2 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            onClick={() => run(onDelete)}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
});

export default ActionDropdown;
