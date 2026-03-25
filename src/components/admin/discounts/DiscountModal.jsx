import React, { useEffect, useMemo, useRef, useState } from "react";
import { authApi as api } from "../../../api/httpClients";
import {
  computeDiscountPreview,
  parseIsoToDateInput,
  toIsoFromDateInput,
} from "./discountHelpers";
import { DiscountStatus, DiscountType, ScopeType } from "./discountTypes";

const steps = [
  "Thông tin",
  "Loại giảm",
  "Phạm vi",
  "Điều kiện",
  "Thời gian",
  "Đối tượng",
  "Xem trước",
];

const defaultForm = {
  name: "",
  code: "",
  description: "",
  type: DiscountType.PERCENT,
  value: "",
  maxDiscount: "",
  minOrderValue: "",
  usageLimit: "",
  usagePerUser: "",
  startDate: "",
  endDate: "",

  scopeMode: ScopeType.ALL,
  categoryIds: [],
  productIds: [],

  targetMode: "ALL",
  targetUserIds: [],
};

const Stepper = ({ current }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((label, idx) => {
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={
                active
                  ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  : done
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                    : "flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600"
              }
            >
              {idx + 1}
            </div>
            <span
              className={
                active
                  ? "text-xs font-semibold text-slate-900"
                  : "text-xs font-medium text-slate-500"
              }
            >
              {label}
            </span>
            {idx < steps.length - 1 ? (
              <span className="mx-1 text-slate-300">/</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const parseNumberOrNull = (value) => {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toUpperCode = (value) => (value || "").toUpperCase().replace(/\s+/g, "");

const DiscountModal = ({
  open,
  onClose,
  onSave,
  mode = "create", // create | edit | view
  initialData,
  categories = [],
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [productQuery, setProductQuery] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const productAbortRef = useRef(null);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    setStep(0);

    if (!initialData) {
      setForm(defaultForm);
      return;
    }

    const scopes = Array.isArray(initialData.scopes) ? initialData.scopes : [];
    const hasAll = scopes.some((s) => String(s.scopeType) === ScopeType.ALL);
    const catIds = scopes
      .filter((s) => String(s.scopeType) === ScopeType.CATEGORY)
      .map((s) => s.scopeId)
      .filter((id) => id != null);
    const prodIds = scopes
      .filter((s) => String(s.scopeType) === ScopeType.PRODUCT)
      .map((s) => s.scopeId)
      .filter((id) => id != null);

    setForm({
      ...defaultForm,
      name: initialData.name ?? "",
      code: initialData.code ?? "",
      description: initialData.description ?? "",
      type: initialData.type ?? DiscountType.PERCENT,
      value: initialData.value ?? "",
      maxDiscount: initialData.maxDiscount ?? "",
      minOrderValue: initialData.minOrderValue ?? "",
      usageLimit: initialData.usageLimit ?? "",
      usagePerUser: initialData.usagePerUser ?? "",
      startDate: parseIsoToDateInput(initialData.startDate) || "",
      endDate: parseIsoToDateInput(initialData.endDate) || "",
      scopeMode: hasAll
        ? ScopeType.ALL
        : catIds.length
          ? ScopeType.CATEGORY
          : ScopeType.PRODUCT,
      categoryIds: catIds,
      productIds: prodIds,
      targetMode: initialData.targeted ? "SPECIFIC" : "ALL",
      targetUserIds: [],
    });
  }, [initialData, open]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const searchProducts = async (query) => {
    const q = String(query || "").trim();
    if (!q) {
      setProductOptions([]);
      setProductError("");
      return;
    }

    if (productAbortRef.current) {
      productAbortRef.current.abort();
    }

    const controller = new AbortController();
    productAbortRef.current = controller;

    setProductLoading(true);
    setProductError("");
    try {
      const response = await api.get("/api/catalog/internal/products", {
        params: { q, page: 0, size: 10, sort: "createdAt,desc" },
        signal: controller.signal,
      });
      const payload = response.data;
      const items = payload?.content ?? [];
      setProductOptions(
        items.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
        })),
      );
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      setProductError("Không tìm được sản phẩm. Vui lòng thử lại.");
      setProductOptions([]);
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchProducts(productQuery), 350);
    return () => clearTimeout(timer);
  }, [productQuery, open]);

  const selectedCategoryLabels = useMemo(() => {
    return (form.categoryIds || []).map((id) => ({
      id,
      name: categoryMap.get(id) || `#${id}`,
    }));
  }, [form.categoryIds, categoryMap]);

  const previewDiscount = useMemo(() => {
    const tmp = {
      ...form,
      value: parseNumberOrNull(form.value) || 0,
      maxDiscount: parseNumberOrNull(form.maxDiscount),
      minOrderValue: parseNumberOrNull(form.minOrderValue),
    };
    return computeDiscountPreview(tmp);
  }, [form]);

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Vui lòng nhập tên chương trình.";
      if (!form.code.trim()) return "Vui lòng nhập mã giảm giá.";
      return null;
    }

    if (step === 1) {
      if (!form.type) return "Vui lòng chọn loại giảm.";
      const value = parseNumberOrNull(form.value);
      if (value == null || value <= 0)
        return "Vui lòng nhập giá trị giảm hợp lệ.";
      if (String(form.type) === DiscountType.PERCENT) {
        const max = parseNumberOrNull(form.maxDiscount);
        if (max != null && max < 0) return "Tối đa giảm không hợp lệ.";
      }
      return null;
    }

    if (step === 2) {
      if (
        form.scopeMode === ScopeType.CATEGORY &&
        !(form.categoryIds || []).length
      ) {
        return "Vui lòng chọn ít nhất 1 danh mục.";
      }
      if (
        form.scopeMode === ScopeType.PRODUCT &&
        !(form.productIds || []).length
      ) {
        return "Vui lòng chọn ít nhất 1 sản phẩm.";
      }
      return null;
    }

    if (step === 4) {
      if (!form.startDate) return "Vui lòng chọn ngày bắt đầu.";
      if (!form.endDate) return "Vui lòng chọn ngày kết thúc.";
      return null;
    }

    if (step === 5) {
      if (
        form.targetMode === "SPECIFIC" &&
        !(form.targetUserIds || []).length
      ) {
        return "Vui lòng nhập ít nhất 1 user id.";
      }
      return null;
    }

    return null;
  };

  const buildPayload = () => {
    const startIso = toIsoFromDateInput(form.startDate);
    const endIso = toIsoFromDateInput(form.endDate);

    const now = new Date();
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;

    const computedStatus = (() => {
      const currentStatus = String(initialData?.status || "");
      if (mode === "edit" && currentStatus === DiscountStatus.DISABLED) {
        return DiscountStatus.DISABLED;
      }
      if (start && now < start) return DiscountStatus.SCHEDULED;
      if (end && now > end) return DiscountStatus.EXPIRED;
      return DiscountStatus.ACTIVE;
    })();

    const scopes = (() => {
      if (form.scopeMode === ScopeType.CATEGORY) {
        return (form.categoryIds || []).map((id) => ({
          scopeType: ScopeType.CATEGORY,
          scopeId: id,
        }));
      }
      if (form.scopeMode === ScopeType.PRODUCT) {
        return (form.productIds || []).map((id) => ({
          scopeType: ScopeType.PRODUCT,
          scopeId: id,
        }));
      }
      return [{ scopeType: ScopeType.ALL }];
    })();

    return {
      name: form.name.trim(),
      code: toUpperCode(form.code),
      // NOTE: backend DTO currently does not have description field.
      type: form.type,
      value: parseNumberOrNull(form.value) || 0,
      maxDiscount: parseNumberOrNull(form.maxDiscount),
      minOrderValue: parseNumberOrNull(form.minOrderValue),
      usageLimit: parseNumberOrNull(form.usageLimit),
      usagePerUser: parseNumberOrNull(form.usagePerUser),
      startDate: startIso,
      endDate: endIso,
      status: computedStatus,
      scopes,
      targetUserIds:
        form.targetMode === "SPECIFIC" ? form.targetUserIds || [] : [],
    };
  };

  const handleSubmit = () => {
    const err = validateStep();
    if (err) {
      window.alert(err);
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => Math.min(steps.length - 1, prev + 1));
      return;
    }

    const payload = buildPayload();
    if (!payload.startDate || !payload.endDate) {
      window.alert("Ngày bắt đầu/kết thúc không hợp lệ.");
      return;
    }

    onSave?.(payload, { mode, id: initialData?.id });
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const renderBody = () => {
    if (step === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên chương trình <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Nhập tên chương trình..."
              type="text"
              value={form.name}
              disabled={isView}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="VD: SPRING20"
              type="text"
              value={form.code}
              disabled={isView}
              onChange={(e) =>
                handleChange("code", toUpperCode(e.target.value))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả (tuỳ chọn)
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Mô tả ngắn..."
              type="text"
              value={form.description}
              disabled={isView}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (step === 1) {
      const type = String(form.type);
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Loại giảm
              </label>
              <select
                className="w-full appearance-none rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={form.type}
                disabled={isView}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value={DiscountType.PERCENT}>Phần trăm (%)</option>
                <option value={DiscountType.FIXED}>Số tiền cố định</option>
                <option value={DiscountType.FREESHIP}>Freeship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giá trị
              </label>
              <input
                className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder={
                  type === DiscountType.PERCENT ? "VD: 20" : "VD: 50000"
                }
                type="number"
                min="0"
                disabled={isView}
                value={form.value}
                onChange={(e) => handleChange("value", e.target.value)}
              />
            </div>
          </div>

          {type === DiscountType.PERCENT ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tối đa giảm (VNĐ)
              </label>
              <input
                className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="VD: 100000"
                type="number"
                min="0"
                disabled={isView}
                value={form.maxDiscount}
                onChange={(e) => handleChange("maxDiscount", e.target.value)}
              />
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Xem nhanh</p>
            <p className="mt-1 text-sm text-slate-600">{previewDiscount}</p>
          </div>
        </div>
      );
    }

    if (step === 2) {
      const mode = String(form.scopeMode);
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[ScopeType.ALL, ScopeType.CATEGORY, ScopeType.PRODUCT].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  disabled={isView}
                  className={
                    mode === item
                      ? "rounded-lg border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                      : "rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  }
                  onClick={() => handleChange("scopeMode", item)}
                >
                  {item === ScopeType.ALL
                    ? "Toàn hệ thống"
                    : item === ScopeType.CATEGORY
                      ? "Theo danh mục"
                      : "Theo sản phẩm"}
                </button>
              ),
            )}
          </div>

          {mode === ScopeType.ALL ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Khuyến mãi áp dụng cho toàn hệ thống.
            </div>
          ) : null}

          {mode === ScopeType.CATEGORY ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Chọn danh mục
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryLabels.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {c.name}
                    {!isView ? (
                      <button
                        type="button"
                        className="text-slate-500 hover:text-rose-600"
                        onClick={() =>
                          handleChange(
                            "categoryIds",
                            (form.categoryIds || []).filter(
                              (id) => id !== c.id,
                            ),
                          )
                        }
                      >
                        ✕
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => {
                  const checked = (form.categoryIds || []).includes(
                    category.id,
                  );
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        disabled={isView}
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange("categoryIds", [
                              ...(form.categoryIds || []),
                              category.id,
                            ]);
                          } else {
                            handleChange(
                              "categoryIds",
                              (form.categoryIds || []).filter(
                                (id) => id !== category.id,
                              ),
                            );
                          }
                        }}
                      />
                      <span className="text-sm text-slate-700">
                        {category.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {mode === ScopeType.PRODUCT ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Chọn sản phẩm (tìm kiếm)
              </p>

              <div className="flex flex-wrap gap-2">
                {(form.productIds || []).map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    #{id}
                    {!isView ? (
                      <button
                        type="button"
                        className="text-slate-500 hover:text-rose-600"
                        onClick={() =>
                          handleChange(
                            "productIds",
                            (form.productIds || []).filter((pid) => pid !== id),
                          )
                        }
                      >
                        ✕
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-primary focus:ring-primary"
                  placeholder="Tìm theo tên sản phẩm..."
                  type="text"
                  disabled={isView}
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
              </div>

              {productLoading ? (
                <p className="text-sm text-slate-500">Đang tìm sản phẩm...</p>
              ) : productError ? (
                <p className="text-sm text-rose-600">{productError}</p>
              ) : null}

              {!!productOptions.length ? (
                <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                  {productOptions.map((p) => {
                    const selected = (form.productIds || []).includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            SKU: {p.sku}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isView}
                          className={
                            selected
                              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                              : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          }
                          onClick={() => {
                            if (selected) {
                              handleChange(
                                "productIds",
                                (form.productIds || []).filter(
                                  (id) => id !== p.id,
                                ),
                              );
                            } else {
                              handleChange("productIds", [
                                ...(form.productIds || []),
                                p.id,
                              ]);
                            }
                          }}
                        >
                          {selected ? "Đã chọn" : "Chọn"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <p className="text-xs text-slate-500">
                Gợi ý: đây là chọn theo ID sản phẩm. Bạn có thể dùng mã SKU/ tên
                để tìm.
              </p>
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Đơn tối thiểu (VNĐ)
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              type="number"
              min="0"
              disabled={isView}
              placeholder="VD: 200000"
              value={form.minOrderValue}
              onChange={(e) => handleChange("minOrderValue", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Giới hạn lượt dùng
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              type="number"
              min="0"
              disabled={isView}
              placeholder="VD: 1000"
              value={form.usageLimit}
              onChange={(e) => handleChange("usageLimit", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mỗi user tối đa
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              type="number"
              min="0"
              disabled={isView}
              placeholder="VD: 1"
              value={form.usagePerUser}
              onChange={(e) => handleChange("usagePerUser", e.target.value)}
            />
          </div>
          <div className="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Tóm tắt</p>
            <p className="mt-1 text-sm text-slate-600">{previewDiscount}</p>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ngày bắt đầu
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              type="datetime-local"
              disabled={isView}
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ngày kết thúc
            </label>
            <input
              className="w-full rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              type="datetime-local"
              disabled={isView}
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Lưu ý</p>
            <p className="mt-1 text-sm text-slate-600">
              Trạng thái sẽ tự động là <b>Scheduled</b> nếu chưa tới ngày bắt
              đầu,
              <b>Active</b> nếu đang chạy, hoặc <b>Expired</b> nếu đã hết hạn.
            </p>
          </div>
        </div>
      );
    }

    if (step === 5) {
      const tempUserId = (form.__tempUserId || "").trim();
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isView}
              className={
                form.targetMode === "ALL"
                  ? "rounded-lg border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              }
              onClick={() => handleChange("targetMode", "ALL")}
            >
              Tất cả người dùng
            </button>
            <button
              type="button"
              disabled={isView}
              className={
                form.targetMode === "SPECIFIC"
                  ? "rounded-lg border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              }
              onClick={() => handleChange("targetMode", "SPECIFIC")}
            >
              Người dùng cụ thể
            </button>
          </div>

          {form.targetMode === "SPECIFIC" ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                User IDs
              </label>
              <div className="flex flex-wrap gap-2">
                {(form.targetUserIds || []).map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {id}
                    {!isView ? (
                      <button
                        type="button"
                        className="text-slate-500 hover:text-rose-600"
                        onClick={() =>
                          handleChange(
                            "targetUserIds",
                            (form.targetUserIds || []).filter((x) => x !== id),
                          )
                        }
                      >
                        ✕
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border-slate-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Nhập user id rồi bấm Thêm"
                  type="text"
                  disabled={isView}
                  value={form.__tempUserId || ""}
                  onChange={(e) => handleChange("__tempUserId", e.target.value)}
                />
                <button
                  type="button"
                  disabled={isView || !tempUserId}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  onClick={() => {
                    const normalized = tempUserId;
                    if (!normalized) return;
                    const next = Array.from(
                      new Set([...(form.targetUserIds || []), normalized]),
                    );
                    setForm((prev) => ({
                      ...prev,
                      targetUserIds: next,
                      __tempUserId: "",
                    }));
                  }}
                >
                  Thêm
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Gợi ý: nếu chưa có API lấy danh sách users, bạn có thể nhập trực
                tiếp các user id từ hệ thống.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Khuyến mãi áp dụng cho tất cả người dùng.
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Xem trước</p>
          <p className="mt-1 text-sm text-slate-600">{previewDiscount}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Thông tin gửi lên API
          </p>
          <pre className="mt-2 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {JSON.stringify(buildPayload(), null, 2)}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Lưu ý: trường <b>description</b> hiện chỉ hiển thị ở UI (backend DTO
            chưa nhận).
          </p>
        </div>
      </div>
    );
  };

  if (!open) return null;

  const title = isView
    ? "Xem khuyến mãi"
    : isEdit
      ? "Cập nhật khuyến mãi"
      : "Tạo khuyến mãi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative flex w-full max-w-4xl max-h-[90vh] flex-col rounded-xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-700">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
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
          <Stepper current={step} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">{renderBody()}</div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/70 rounded-b-xl">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            type="button"
            onClick={onClose}
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              type="button"
              onClick={handleBack}
              disabled={step === 0}
            >
              Quay lại
            </button>
            {isView ? null : (
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                type="button"
                onClick={handleSubmit}
              >
                {step < steps.length - 1
                  ? "Tiếp tục"
                  : isEdit
                    ? "Cập nhật"
                    : "Tạo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
