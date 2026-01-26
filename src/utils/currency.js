// Safe currency helpers for VND
export function toIntegerVnd(value) {
  // Ensure numeric and in VND integer units
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  // Round to nearest integer VND
  return Math.round(n);
}

export function calcSubtotal(items = [], selectedIds = null) {
  // items: [{id, price, unitPrice, quantity}]
  return items.reduce((sum, item) => {
    if (selectedIds && !selectedIds.includes(item.id)) return sum;
    const price = toIntegerVnd(item.unitPrice ?? item.price ?? 0);
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    return sum + price * qty;
  }, 0);
}

export function calcVat(amount, rate = 0.08) {
  const base = toIntegerVnd(amount);
  return Math.round(base * Number(rate));
}

export function formatVnd(value) {
  const n = toIntegerVnd(value);
  return n.toLocaleString("vi-VN") + " ₫";
}

export default { toIntegerVnd, calcSubtotal, calcVat, formatVnd };
