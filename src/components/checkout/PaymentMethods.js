import React from "react";

const PaymentMethods = ({ options, selectedId, onSelect }) => {
  return (
    <div className="storefront-card rounded-[28px] p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Thanh toán
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Phương thức thanh toán
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-4 rounded-[22px] border p-4 transition-all ${
                isActive
                  ? "border-primary bg-primary/5 shadow-[0_18px_40px_-35px_rgba(37,99,235,0.6)]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={isActive}
                onChange={() => onSelect(opt.id)}
                className="h-5 w-5 border-slate-300 text-primary focus:ring-primary"
              />
              <span className="material-symbols-outlined text-slate-500">
                {opt.icon}
              </span>
              <span className="font-medium text-slate-900">{opt.name}</span>
              {opt.badge ? (
                <span className="ml-auto rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {opt.badge}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethods;
