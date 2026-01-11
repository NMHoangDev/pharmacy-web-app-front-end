import React from "react";

const CategoryEditor = ({
  category,
  parentOptions,
  onChange,
  onSave,
  onDelete,
  onCancel,
}) => {
  if (!category) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <p className="text-sm text-text-secondary dark:text-slate-400">
          Chọn một danh mục để chỉnh sửa.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark overflow-hidden h-full">
      <div className="border-b border-border-light p-5 dark:border-border-dark bg-white dark:bg-surface-dark sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">
              Chỉnh sửa danh mục
            </h3>
            <p className="text-sm text-text-secondary dark:text-slate-400">
              ID: {category.id}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            Đang chỉnh sửa
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-main dark:text-white"
              htmlFor="cat-name"
            >
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              value={category.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="block w-full rounded-lg border-border-light bg-background-light p-2.5 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
              placeholder="Nhập tên danh mục"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-main dark:text-white"
              htmlFor="parent-cat"
            >
              Danh mục cha
            </label>
            <div className="relative">
              <select
                id="parent-cat"
                value={category.parentId || ""}
                onChange={(e) => onChange({ parentId: e.target.value || null })}
                className="block w-full appearance-none rounded-lg border-border-light bg-background-light p-2.5 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
              >
                <option value="">Không có (cấp 1)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary dark:text-slate-400">
                <span className="material-symbols-outlined text-[20px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-main dark:text-white"
              htmlFor="description"
            >
              Mô tả ngắn
            </label>
            <textarea
              id="description"
              value={category.description || ""}
              onChange={(e) => onChange({ description: e.target.value })}
              className="block w-full rounded-lg border-border-light bg-background-light p-2.5 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
              rows={4}
              placeholder="Mô tả sẽ hiển thị ở trang danh mục"
            />
            <p className="text-xs text-text-secondary dark:text-slate-500">
              Mô tả hiển thị cho khách hàng tại trang danh mục.
            </p>
          </div>

          <div className="rounded-lg border border-border-light bg-background-light p-4 dark:border-border-dark dark:bg-background-dark/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-main dark:text-white">
                Trạng thái hiển thị
              </p>
              <p className="text-xs text-text-secondary dark:text-slate-400">
                Ẩn danh mục sẽ không hiển thị trên cửa hàng.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={category.status === "active"}
                onChange={(e) =>
                  onChange({ status: e.target.checked ? "active" : "hidden" })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:border-gray-600" />
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main dark:text-white">
              Ảnh danh mục
            </label>
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-lg bg-slate-100 border border-border-light dark:bg-slate-800 dark:border-border-dark overflow-hidden flex items-center justify-center">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-400">
                    image
                  </span>
                )}
              </div>
              <input
                type="text"
                value={category.image || ""}
                onChange={(e) => onChange({ image: e.target.value })}
                className="flex-1 rounded-lg border-border-light bg-background-light p-2.5 text-sm text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
                placeholder="Dán liên kết ảnh hoặc để trống"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border-light bg-gray-50 p-4 dark:border-border-dark dark:bg-background-dark flex justify-between items-center">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-900/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          Xóa danh mục
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-light bg-white px-4 py-2 text-sm font-medium text-text-main shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-border-dark dark:bg-surface-dark dark:text-white dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditor;
