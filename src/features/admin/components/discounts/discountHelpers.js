import { DiscountStatus, DiscountType, ScopeType } from "./discountTypes";

export const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `${num.toLocaleString("vi-VN")}đ`;
};

export const formatPercent = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0%";
  return `${num}%`;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const parseIsoToDateInput = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toIsoFromDateInput = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19);
};

export const computeScopeSummary = (discount, categoryMap) => {
  const scopes = Array.isArray(discount?.scopes) ? discount.scopes : [];
  if (!scopes.length) return "Toàn hệ thống";

  const hasAll = scopes.some((s) => String(s.scopeType) === ScopeType.ALL);
  if (hasAll) return "Toàn hệ thống";

  const categories = scopes.filter(
    (s) => String(s.scopeType) === ScopeType.CATEGORY,
  );
  const products = scopes.filter(
    (s) => String(s.scopeType) === ScopeType.PRODUCT,
  );

  if (categories.length) {
    const first = categories[0];
    const name = categoryMap?.get?.(first.scopeId) || null;
    if (name) return `Danh mục: ${name}`;
    return categories.length === 1
      ? `Danh mục: #${first.scopeId}`
      : `${categories.length} danh mục`;
  }

  if (products.length) {
    return products.length === 1 ? `1 sản phẩm` : `${products.length} sản phẩm`;
  }

  return "Toàn hệ thống";
};

export const computeDiscountPreview = (discount) => {
  if (!discount) return "";
  const type = String(discount.type || "");
  const value = Number(discount.value || 0);
  const maxDiscount =
    discount.maxDiscount != null ? Number(discount.maxDiscount) : null;
  const minOrder =
    discount.minOrderValue != null ? Number(discount.minOrderValue) : null;

  const parts = [];
  if (type === DiscountType.PERCENT) {
    parts.push(`Giảm ${formatPercent(value)}`);
    if (Number.isFinite(maxDiscount) && maxDiscount > 0) {
      parts.push(`tối đa ${formatCurrency(maxDiscount)}`);
    }
  } else if (type === DiscountType.FIXED) {
    parts.push(`Giảm ${formatCurrency(value)}`);
  } else if (type === DiscountType.FREESHIP) {
    parts.push("Freeship");
  } else {
    parts.push("Khuyến mãi");
  }

  if (Number.isFinite(minOrder) && minOrder > 0) {
    parts.push(`cho đơn từ ${formatCurrency(minOrder)}`);
  }

  return parts.join(" ");
};

export const getStatusMeta = (status) => {
  const normalized = String(status || "");
  if (normalized === DiscountStatus.ACTIVE) {
    return {
      label: "Active",
      badgeClass:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    };
  }
  if (normalized === DiscountStatus.SCHEDULED) {
    return {
      label: "Scheduled",
      badgeClass:
        "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
    };
  }
  if (normalized === DiscountStatus.DISABLED) {
    return {
      label: "Disabled",
      badgeClass:
        "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
    };
  }
  return {
    label: "Expired",
    badgeClass:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/20",
  };
};

export const getTypeBadge = (discount) => {
  const type = String(discount?.type || "");
  if (type === DiscountType.PERCENT)
    return `-${formatPercent(discount?.value)}`;
  if (type === DiscountType.FIXED) return `-${formatCurrency(discount?.value)}`;
  if (type === DiscountType.FREESHIP) return "Freeship";
  return "-";
};

export const computeUsageRatio = (discount) => {
  const used = Number(discount?.usedCount || 0);
  const limit = Number(discount?.usageLimit || 0);
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return { used, limit: limit || null, ratio: null };
  }
  return {
    used,
    limit,
    ratio: Math.max(0, Math.min(1, used / limit)),
  };
};

export const statusSwitchClass = (checked) =>
  checked
    ? "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-primary transition-colors duration-200 ease-in-out"
    : "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-300 transition-colors duration-200 ease-in-out";
