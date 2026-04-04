import React from "react";

const ShippingMethods = ({ options, selectedId, onSelect }) => {
  return (
    <div className="storefront-card rounded-[28px] p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-600">
          <span className="material-symbols-outlined">schedule</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Vận chuyển
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Hình thức vận chuyển
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-[22px] border p-4 transition-all ${
                isActive
                  ? "border-primary bg-primary/5 shadow-[0_18px_40px_-35px_rgba(37,99,235,0.6)]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40"
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <input
                  type="radio"
                  name="shipping"
                  checked={isActive}
                  onChange={() => onSelect(opt.id)}
                  className="h-5 w-5 border-slate-300 text-primary focus:ring-primary"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{opt.name}</p>
                  <p className="text-sm text-slate-500">{opt.description}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-900">
                {opt.feeLabel}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingMethods;
