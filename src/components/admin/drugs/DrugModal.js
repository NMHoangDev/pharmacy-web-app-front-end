import React, { useEffect, useRef, useState } from "react";
import { authApi as api } from "../../../api/httpClients";

const defaultForm = {
  name: "",
  sku: "",
  categoryId: "",
  costPrice: "",
  salePrice: "",
  unit: "đơn vị",
  stock: "",
  status: "ACTIVE",
  rx: false,
  description: "",
  dosageForm: "",
  packaging: "",
  activeIngredient: "",
  indications: "",
  usageDosage: "",
  contraindicationsWarning: "",
  otherInformation: "",
  image: "",
  images: [],
  albumId: "",
  createPrPost: false,
};

const inputClassName =
  "w-full rounded-lg border-slate-300 px-3 py-2.5 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm";

const textareaClassName =
  "w-full rounded-lg border-slate-300 px-3 py-2.5 shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:text-sm";

const normalizeText = (value) =>
  (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const isBase64Value = (value) =>
  !!value &&
  (/^data:/i.test(value) ||
    (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100));

const normalizeImageSrc = (value) => {
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
    return `data:image/jpeg;base64,${value}`;
  }
  return value;
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const chooseCategoryId = (categories, hint) => {
  if (!categories.length) return "";

  const normalizedHint = normalizeText(hint);
  const byHint = normalizedHint
    ? categories.find((category) =>
        normalizeText(category.name).includes(normalizedHint),
      )
    : null;

  if (byHint) return byHint.id;

  const preferred =
    categories.find((category) => {
      const n = normalizeText(category.name);
      return (
        n.includes("thuoc") ||
        n.includes("duoc") ||
        n.includes("medicine") ||
        n.includes("drug")
      );
    }) || categories[0];

  return preferred?.id || "";
};

const DrugModal = ({
  open,
  onClose,
  onSave,
  initialData,
  categories = [],
  mode = "create",
  busy = false,
}) => {
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  const isEditing = mode === "edit";
  const modalBusy = busy || submitting || uploading || generatingDraft;

  useEffect(() => {
    if (!open) return;

    setForm({
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      categoryId: initialData?.categoryId ?? "",
      costPrice: initialData?.costPrice ?? "",
      salePrice: initialData?.salePrice ?? "",
      unit: initialData?.unit ?? defaultForm.unit,
      stock: initialData?.stock ?? "",
      status: initialData?.status ?? defaultForm.status,
      rx: initialData?.rx ?? false,
      description: initialData?.description ?? "",
      dosageForm: initialData?.dosageForm ?? "",
      packaging: initialData?.packaging ?? "",
      activeIngredient: initialData?.activeIngredient ?? "",
      indications: initialData?.indications ?? "",
      usageDosage: initialData?.usageDosage ?? "",
      contraindicationsWarning: initialData?.contraindicationsWarning ?? "",
      otherInformation: initialData?.otherInformation ?? "",
      image: initialData?.image ?? "",
      images: initialData?.images ?? [],
      albumId: initialData?.albumId ?? "",
      createPrPost: false,
    });

    setUploadError("");
    setGenerateError("");
    setSubmitError("");
    setSubmitting(false);
  }, [initialData, open]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateDraft = async () => {
    const drugName = form.name.trim();
    if (!drugName) {
      window.alert("Vui lòng nhập tên thuốc trước khi dùng AI generate");
      return;
    }

    setGeneratingDraft(true);
    setGenerateError("");

    try {
      const response = await api.post("/api/chat/admin/drug-draft", {
        name: drugName,
      });
      const draft = response.data || {};

      setForm((prev) => ({
        ...prev,
        name: draft.name || prev.name,
        sku: draft.sku || prev.sku,
        categoryId:
          prev.categoryId || chooseCategoryId(categories, draft.categoryHint),
        costPrice:
          draft.costPrice != null ? String(draft.costPrice) : prev.costPrice,
        salePrice:
          draft.salePrice != null ? String(draft.salePrice) : prev.salePrice,
        stock: draft.stock != null ? String(draft.stock) : prev.stock,
        status: draft.status || prev.status || "ACTIVE",
        rx:
          typeof draft.prescriptionRequired === "boolean"
            ? draft.prescriptionRequired
            : prev.rx,
        description: draft.description || prev.description,
        dosageForm: draft.dosageForm || prev.dosageForm,
        packaging: draft.packaging || prev.packaging,
        activeIngredient: draft.activeIngredient || prev.activeIngredient,
        indications: draft.indications || prev.indications,
        usageDosage: draft.usageDosage || prev.usageDosage,
        contraindicationsWarning:
          draft.contraindicationsWarning || prev.contraindicationsWarning,
        otherInformation: draft.otherInformation || prev.otherInformation,
        image: draft.imageUrl || prev.image,
      }));
    } catch (error) {
      setGenerateError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể generate thông tin thuốc lúc này",
      );
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (modalBusy) return;

    setSubmitError("");
    if (!form.name.trim()) {
      window.alert("Vui lòng nhập tên thuốc");
      return;
    }

    if (!form.categoryId && categories.length) {
      window.alert("Vui lòng chọn danh mục");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(
        {
          ...form,
          stock: Number(form.stock || 0),
          costPrice: Number(form.costPrice || 0),
          salePrice: Number(form.salePrice || 0),
        },
        {
          mode,
          id: initialData?.id,
          createPrPost: mode === "create" ? !!form.createPrPost : false,
        },
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Lưu thuốc thất bại. Vui lòng kiểm tra lại thông tin.";
      setSubmitError(message);
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

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

      const response = await api.post("/api/media/drugs/base64", {
        albumId: form.albumId || null,
        images: payloadImages,
      });

      const data = response.data || {};
      const uploadedUrls = (data.items || [])
        .map((item) => item?.presignedUrl || item?.url || "")
        .filter(Boolean);

      setForm((prev) => {
        const nextImages = [...(prev.images || []), ...uploadedUrls];
        return {
          ...prev,
          albumId: data.albumId || prev.albumId,
          images: nextImages,
          image: prev.image || nextImages[0] || "",
        };
      });
    } catch (error) {
      setUploadError(error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (!open) return null;

  const displayImageValue =
    form.image && form.image.startsWith("data:") ? "" : form.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => {
          if (!modalBusy) onClose();
        }}
        role="presentation"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditing ? "Cập nhật thuốc" : "Thêm thuốc mới"}
          </h3>
          <button
            className="flex items-center justify-center rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            type="button"
            onClick={() => {
              if (!modalBusy) onClose();
            }}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form
          id="drug-modal-form"
          className="flex-1 overflow-y-auto px-6 py-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            {submitError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tên thuốc <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={modalBusy}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 shadow-sm transition hover:from-amber-100 hover:to-yellow-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/40 dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-amber-900/20 dark:text-amber-300"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${generatingDraft ? "animate-spin" : "animate-pulse"}`}
                    >
                      auto_awesome
                    </span>
                    {generatingDraft ? "Đang tạo nội dung..." : "AI generate"}
                  </button>
                </div>
                <input
                  className={inputClassName}
                  placeholder="Nhập tên thuốc rồi bấm AI generate..."
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Admin chỉ cần nhập tên thuốc, AI sẽ điền các trường còn lại để
                  tiết kiệm thời gian.
                </p>
                {generateError ? (
                  <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {generateError}
                  </p>
                ) : null}

                {!isEditing ? (
                  <label className="mt-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
                    <input
                      type="checkbox"
                      checked={!!form.createPrPost}
                      onChange={(e) =>
                        handleChange("createPrPost", e.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span>
                      <span className="block font-semibold">
                        Tạo bài PR cho thuốc này sau khi lưu
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-sky-700 dark:text-sky-200">
                        Hệ thống sẽ tạo bản nháp PR để bạn review trước khi
                        đăng.
                      </span>
                    </span>
                  </label>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Danh mục
                </label>
                <select
                  className={inputClassName}
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
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Trạng thái
                </label>
                <select
                  className={inputClassName}
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="ACTIVE">Đang bán</option>
                  <option value="INACTIVE">Ngừng bán</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mã SKU
                </label>
                <input
                  className={inputClassName}
                  placeholder="Tự động tạo nếu để trống"
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Đơn vị
                </label>
                <input
                  className={inputClassName}
                  placeholder="viên, vỉ, hộp..."
                  type="text"
                  value={form.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Giá gốc (VND)
                </label>
                <input
                  className={inputClassName}
                  min="0"
                  placeholder="0"
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => handleChange("costPrice", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Giá bán (VND)
                </label>
                <input
                  className={inputClassName}
                  min="0"
                  placeholder="0"
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => handleChange("salePrice", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Số lượng tồn kho
                </label>
                <input
                  className={inputClassName}
                  min="0"
                  placeholder="0"
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Dạng bào chế
                </label>
                <input
                  className={inputClassName}
                  placeholder="Ví dụ: Viên nén bao phim"
                  type="text"
                  value={form.dosageForm}
                  onChange={(e) => handleChange("dosageForm", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quy cách
                </label>
                <input
                  className={inputClassName}
                  placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
                  type="text"
                  value={form.packaging}
                  onChange={(e) => handleChange("packaging", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Thành phần chính
                </label>
                <input
                  className={inputClassName}
                  placeholder="Ví dụ: Paracetamol 500mg"
                  type="text"
                  value={form.activeIngredient}
                  onChange={(e) =>
                    handleChange("activeIngredient", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mô tả ngắn
                </label>
                <textarea
                  className={textareaClassName}
                  rows={3}
                  placeholder="Mô tả ngắn để hiển thị đầu trang chi tiết"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Công dụng
                </label>
                <textarea
                  className={textareaClassName}
                  rows={4}
                  placeholder="Nhập công dụng hoặc chỉ định sử dụng"
                  value={form.indications}
                  onChange={(e) => handleChange("indications", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cách dùng và liều dùng
                </label>
                <textarea
                  className={textareaClassName}
                  rows={4}
                  placeholder="Nhập hướng dẫn sử dụng và liều dùng"
                  value={form.usageDosage}
                  onChange={(e) => handleChange("usageDosage", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Chống chỉ định và cảnh báo
                </label>
                <textarea
                  className={textareaClassName}
                  rows={4}
                  placeholder="Nhập chống chỉ định, lưu ý hoặc cảnh báo"
                  value={form.contraindicationsWarning}
                  onChange={(e) =>
                    handleChange("contraindicationsWarning", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Thông tin khác
                </label>
                <textarea
                  className={textareaClassName}
                  rows={4}
                  placeholder="Bổ sung thông tin bảo quản, xuất xứ hoặc thông tin khác"
                  value={form.otherInformation}
                  onChange={(e) =>
                    handleChange("otherInformation", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ảnh sản phẩm (nhiều ảnh)
              </label>
              <div className="flex flex-col gap-2">
                <input
                  className={inputClassName}
                  placeholder="https://... (ảnh chính)"
                  type="url"
                  value={displayImageValue}
                  onChange={(e) => handleChange("image", e.target.value)}
                />

                {form.image?.startsWith("data:") ? (
                  <p className="text-xs text-slate-500">
                    Ảnh chính đang là base64, preview ở phần bên dưới.
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={modalBusy}
                  >
                    {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                  </button>
                  <span className="text-xs text-slate-500">
                    {form.images?.length
                      ? `${form.images.length} ảnh đã sẵn sàng`
                      : form.image
                        ? "Ảnh đã sẵn sàng"
                        : "Chưa có ảnh"}
                  </span>
                  {form.images?.length ? (
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
                  ) : null}
                </div>

                {uploadError ? (
                  <p className="text-xs text-rose-600">{uploadError}</p>
                ) : null}

                {form.image || form.images?.length ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <p className="mb-2 text-xs font-medium text-slate-500">
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
                      <div className="break-all text-xs text-slate-500">
                        {form.image
                          ? isBase64Value(form.image)
                            ? "Ảnh chính (base64)"
                            : form.image
                          : "Chưa chọn ảnh chính"}
                      </div>
                    </div>
                  </div>
                ) : null}

                {form.images?.length ? (
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
                          x
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
                ) : null}

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

        <div className="rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              type="button"
              onClick={() => {
                if (!modalBusy) onClose();
              }}
              disabled={modalBusy}
            >
              Hủy bỏ
            </button>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              form="drug-modal-form"
              disabled={modalBusy}
            >
              {submitting
                ? isEditing
                  ? "Đang cập nhật..."
                  : "Đang tạo thuốc..."
                : isEditing
                  ? "Cập nhật"
                  : "Lưu thuốc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugModal;
