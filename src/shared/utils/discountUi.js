export const parseMoneyNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const raw = String(value ?? "");
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const num = Number(digits);
  return Number.isFinite(num) ? num : NaN;
};

export const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export const formatCompactCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "0 đ";
  if (amount >= 1000000) {
    return `${(amount / 1000000).toLocaleString("vi-VN", {
      maximumFractionDigits: amount % 1000000 === 0 ? 0 : 1,
    })} triệu`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toLocaleString("vi-VN", {
      maximumFractionDigits: amount % 1000 === 0 ? 0 : 1,
    })}k`;
  }
  return `${amount.toLocaleString("vi-VN")} đ`;
};

export const hasValidDiscount = (price, originalPrice) => {
  const cur = parseMoneyNumber(price);
  const orig = parseMoneyNumber(originalPrice);
  return Number.isFinite(cur) && Number.isFinite(orig) && orig > cur;
};

export const getDiscountPercent = (price, originalPrice) => {
  const cur = parseMoneyNumber(price);
  const orig = parseMoneyNumber(originalPrice);
  if (!Number.isFinite(cur) || !Number.isFinite(orig) || orig <= cur) return 0;
  return Math.max(0, Math.round(((orig - cur) / orig) * 100));
};

const normalizeCampaignType = (campaign) =>
  String(campaign?.type || "")
    .trim()
    .toUpperCase();

export const getCampaignPresentation = (campaign) => {
  if (!campaign) return null;

  const type = normalizeCampaignType(campaign);
  const rawValue = Number(campaign?.value || 0);
  const value =
    Number.isFinite(rawValue) && rawValue > 0 ? Math.round(rawValue) : 0;
  const endDate = campaign?.endDate ? new Date(campaign.endDate) : null;
  const hasValidEndDate =
    endDate instanceof Date && !Number.isNaN(endDate.getTime());
  const endLabel = hasValidEndDate
    ? endDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    : "";

  if (type === "PERCENT" && value > 0) {
    return {
      badge: `-${value}%`,
      headline: `Đang giảm ${value}%`,
      detail:
        campaign?.displayText ||
        `Ưu đãi ${value}%${endLabel ? ` đến ${endLabel}` : ""}`,
    };
  }

  if (type === "FIXED" && value > 0) {
    const compact = formatCompactCurrency(value);
    return {
      badge: `-${compact}`,
      headline: `Giảm ${compact}`,
      detail:
        campaign?.displayText ||
        `Ưu đãi ${formatCurrency(value)}${endLabel ? ` đến ${endLabel}` : ""}`,
    };
  }

  if (type === "FREESHIP") {
    return {
      badge: "FREESHIP",
      headline: "Miễn phí giao hàng",
      detail:
        campaign?.displayText ||
        `Freeship${endLabel ? ` đến ${endLabel}` : ""}`,
    };
  }

  return {
    badge: "ƯU ĐÃI",
    headline: campaign?.name || "Ưu đãi hôm nay",
    detail: campaign?.displayText || "",
  };
};
