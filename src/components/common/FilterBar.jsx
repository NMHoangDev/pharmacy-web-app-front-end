import React from "react";

const FilterBar = ({ controls, trailing, footer }) => {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex w-full flex-wrap items-center gap-3">
        {controls}
        {trailing || null}
      </div>
      {footer ? <div>{footer}</div> : null}
    </div>
  );
};

export default FilterBar;
