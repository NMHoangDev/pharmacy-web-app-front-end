import React, { useEffect, useState } from "react";

const defaultForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  unit: "đơn vị",
  stock: "",
  stockStatus: "in",
  rx: false,
  image: "",
};

const DrugModal = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (open) setForm(defaultForm);
  }, [open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên thuốc");
      return;
    }
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Thêm thuốc mới
          </h3>
          <button
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          className="flex-1 overflow-y-auto px-6 py-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tên thuốc <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  placeholder="Nhập tên thuốc..."
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Danh mục
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  placeholder="Ví dụ: Giảm đau, hạ sốt"
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mã SKU
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  placeholder="Tự động tạo nếu trống"
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Giá bán (VNĐ)
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Đơn vị
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  placeholder="viên, vỉ, hộp..."
                  type="text"
                  value={form.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số lượng tồn kho
                </label>
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tình trạng kho
                </label>
                <select
                  className="w-full appearance-none rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  value={form.stockStatus}
                  onChange={(e) => handleChange("stockStatus", e.target.value)}
                >
                  <option value="in">Còn hàng</option>
                  <option value="low">Sắp hết</option>
                  <option value="out">Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-900/10">
              <input
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                id="rx-needed"
                type="checkbox"
                checked={form.rx}
                onChange={(e) => handleChange("rx", e.target.checked)}
              />
              <div>
                <label
                  className="text-sm font-semibold text-purple-900 dark:text-purple-300"
                  htmlFor="rx-needed"
                >
                  Thuốc kê đơn (Rx)
                </label>
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  Đánh dấu nếu thuốc yêu cầu đơn bác sĩ khi bán.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ảnh sản phẩm (URL)
              </label>
              <input
                className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                placeholder="https://..."
                type="url"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Dùng ảnh minh họa nếu để trống.
              </p>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/70 rounded-b-xl">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            type="button"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            type="submit"
            onClick={handleSubmit}
          >
            Lưu thuốc
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugModal;
