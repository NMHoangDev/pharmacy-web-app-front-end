import React from "react";

const DeliveryInfoForm = ({ form, onChange }) => {
  const handleChange = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="bg-white dark:bg-[#1A2633] rounded-xl p-6 shadow-sm border border-[#e7edf3] dark:border-gray-700">
      <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">
          local_shipping
        </span>
        Thông tin giao hàng
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-[#0d141b] dark:text-gray-200 text-sm font-medium mb-1.5">
              Họ và tên
            </span>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4"
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-[#0d141b] dark:text-gray-200 text-sm font-medium mb-1.5">
              Số điện thoại
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              className="form-input w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4"
              placeholder="0901234567"
            />
          </label>
        </div>

        <label className="flex flex-col">
          <span className="text-[#0d141b] dark:text-gray-200 text-sm font-medium mb-1.5">
            Địa chỉ nhận hàng
          </span>
          <textarea
            value={form.address}
            onChange={handleChange("address")}
            className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary p-4 min-h-[90px]"
            placeholder="Nhập đầy đủ địa chỉ giao hàng"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-[#0d141b] dark:text-gray-200 text-sm font-medium mb-1.5">
            Ghi chú (Tùy chọn)
          </span>
          <textarea
            value={form.note}
            onChange={handleChange("note")}
            className="form-textarea w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-[#0d141b] dark:text-white focus:border-primary focus:ring-primary p-4 min-h-[100px]"
            placeholder="Ví dụ: Gọi trước khi giao hàng..."
          />
        </label>
      </div>
    </div>
  );
};

export default DeliveryInfoForm;
