import React from "react";

const DeliveryInfoForm = ({ form, onChange }) => {
  const handleChange = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="storefront-card rounded-[28px] p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined">local_shipping</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Thanh toán
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Thông tin giao hàng
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Họ và tên</span>
          <input
            type="text"
            value={form.fullName}
            onChange={handleChange("fullName")}
            className="storefront-input h-12 px-4 text-slate-900"
            placeholder="Nguyen Van A"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            Số điện thoại
          </span>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className="storefront-input h-12 px-4 text-slate-900"
            placeholder="0901234567"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">
          Địa chỉ nhận hàng
        </span>
        <textarea
          value={form.address}
          onChange={handleChange("address")}
          className="storefront-input min-h-[110px] p-4 text-slate-900"
          placeholder="Nhập đầy đủ địa chỉ giao hàng"
        />
      </label>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Ghi chú</span>
        <textarea
          value={form.note}
          onChange={handleChange("note")}
          className="storefront-input min-h-[110px] p-4 text-slate-900"
          placeholder="Ví dụ: Gọi trước khi giao hàng..."
        />
      </label>
    </div>
  );
};

export default DeliveryInfoForm;
