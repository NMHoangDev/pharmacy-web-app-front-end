import React, { useEffect, useRef, useState } from "react";

const defaultForm = {
  name: "",
  sku: "",
  categoryId: "",
  price: "",
  unit: "đơn vị",
  stock: "",
  status: "ACTIVE",
  rx: false,
  image: "",
  images: [],
  albumId: "",
};

const DrugModal = ({
  open,
  onClose,
  onSave,
  initialData,
  categories = [],
  mode = "create",
}) => {
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const isEditing = mode === "edit";

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      categoryId: initialData?.categoryId ?? "",
      price: initialData?.price ?? "",
      unit: initialData?.unit ?? defaultForm.unit,
      stock: initialData?.stock ?? "",
      status: initialData?.status ?? defaultForm.status,
      rx: initialData?.rx ?? false,
      image: initialData?.image ?? "",
      images: initialData?.images ?? [],
      albumId: initialData?.albumId ?? "",
    });
    setUploadError("");
  }, [initialData, open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const displayImageValue =
    form.image && form.image.startsWith("data:") ? "" : form.image;

  const isBase64Value = (value) =>
    !!value &&
    (/^data:/i.test(value) ||
      (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100));

  const normalizeImageSrc = (value) => {
    if (!value) return "";
    if (value.startsWith("data:")) return value;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
      return `data:image/jpeg;base64,${value}`;
    }
    return value;
  };

  const readErrorMessage = async (response, fallback) => {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return data.message || data.error || fallback;
      }
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên thuốc");
      return;
    }
    if (!form.categoryId && categories.length) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    onSave(
      {
        ...form,
        stock: Number(form.stock || 0),
        price: Number(form.price || 0),
      },
      {
        mode,
        id: initialData?.id,
      },
    );
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const payloadImages = await Promise.all(
        files.map(async (file) => ({
          base64: await toBase64(file),
          filename: file.name,
          contentType: file.type,
        })),
      );

      const previewUrls = payloadImages.map((item) => item.base64);
      setForm((prev) => {
        const nextImages = [...(prev.images || []), ...previewUrls];
        return {
          ...prev,
          images: nextImages,
          image: prev.image || nextImages[0] || "",
        };
      });

      const response = await fetch("/api/media/drugs/base64", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: form.albumId || null,
          images: payloadImages,
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể tải ảnh lên",
        );
        throw new Error(message);
      }

      const data = await response.json();
      setForm((prev) => ({
        ...prev,
        albumId: data.albumId || prev.albumId,
      }));
    } catch (error) {
      setUploadError(error.message || "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditing ? "Cập nhật thuốc" : "Thêm thuốc mới"}
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
                <select
                  className="w-full appearance-none rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái
                </label>
                <select
                  className="w-full appearance-none rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="ACTIVE">Đang bán</option>
                  <option value="INACTIVE">Ngưng bán</option>
                </select>
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

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ảnh sản phẩm (nhiều ảnh)
              </label>
              <div className="flex flex-col gap-2">
                <input
                  className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm"
                  placeholder="https://... (ảnh chính)"
                  type="url"
                  value={displayImageValue}
                  onChange={(e) => handleChange("image", e.target.value)}
                />
                {form.image?.startsWith("data:") && (
                  <p className="text-xs text-slate-500">
                    Ảnh chính đang lưu dạng base64 (đã preview phía dưới).
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={triggerUpload}
                    disabled={uploading}
                  >
                    {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                  </button>
                  <span className="text-xs text-slate-500">
                    {form.images?.length
                      ? `${form.images.length} ảnh`
                      : form.image
                        ? "Ảnh đã sẵn sàng"
                        : "Chưa có ảnh"}
                  </span>
                  {!!form.images?.length && (
                    <button
                      type="button"
                      className="text-xs text-rose-600 hover:underline"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: [],
                          image: "",
                          albumId: "",
                        }))
                      }
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-rose-600">{uploadError}</p>
                )}
                {(form.image || form.images?.length) && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Ảnh chính
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700">
                        {form.image ? (
                          <img
                            src={normalizeImageSrc(form.image)}
                            alt="Ảnh chính"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Chưa chọn
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 break-all">
                        {form.image
                          ? isBase64Value(form.image)
                            ? "Ảnh chính (base64)"
                            : form.image
                          : "Chưa chọn ảnh chính"}
                      </div>
                    </div>
                  </div>
                )}
                {!!form.images?.length && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {form.images.map((url) => (
                      <div
                        key={url}
                        className={`group relative h-20 w-20 overflow-hidden rounded-lg border ${
                          url === form.image
                            ? "border-primary"
                            : "border-slate-200"
                        }`}
                      >
                        <img
                          src={normalizeImageSrc(url)}
                          alt="Ảnh sản phẩm"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-white/80 px-1 text-xs text-slate-600 opacity-0 transition group-hover:opacity-100"
                          onClick={() => {
                            setForm((prev) => {
                              const nextImages = prev.images.filter(
                                (item) => item !== url,
                              );
                              return {
                                ...prev,
                                images: nextImages,
                                image:
                                  prev.image === url
                                    ? nextImages[0] || ""
                                    : prev.image,
                              };
                            });
                          }}
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className="absolute bottom-1 left-1 rounded bg-white/80 px-1 text-[10px] text-slate-600 opacity-0 transition group-hover:opacity-100"
                          onClick={() => handleChange("image", url)}
                        >
                          Ảnh chính
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
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
            {isEditing ? "Cập nhật" : "Lưu thuốc"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugModal;
