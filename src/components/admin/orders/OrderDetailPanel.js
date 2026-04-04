import React, { useEffect, useMemo, useState } from "react";
import { authApi } from "../../../api/httpClients";
import {
  getOrderStatusBadgeClasses,
  getPaymentStatusBadgeClasses,
  toOrderStatusLabel,
  toPaymentStatusLabel,
} from "../../../utils/orderStatus";

const FALLBACK_IMAGE = "https://placehold.co/96x96/e2e8f0/64748b?text=Thuoc";

const statusOptions = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đang giao" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

const OrderDetailPanel = ({
  open,
  order,
  onClose,
  onUpdateStatus,
  onAssignBranch,
}) => {
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    if (!open || !order?.id) return;
    const controller = new AbortController();

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        const response = await authApi.get(
          `/api/admin/orders/${order.id}/branch-availability`,
          {
            signal: controller.signal,
          },
        );
        setAvailability(response?.data || null);
        const defaultBranch =
          response?.data?.recommendedBranches?.[0] ||
          response?.data?.branches?.[0]?.id ||
          null;
        setSelectedBranchId(defaultBranch);
      } catch (err) {
        if (err && err.name === "AbortError") return;
        setAvailabilityError("Không thể tải tồn kho theo chi nhánh.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
    return () => controller.abort();
  }, [open, order?.id]);

  const branchStats = useMemo(() => {
    if (!availability?.branches || !availability?.items) return [];
    return availability.branches.map((branch) => {
      const total = availability.items.length;
      const okCount = availability.items.filter((item) => {
        const stock = (item.byBranch || []).find(
          (branchStock) => branchStock.branchId === branch.id,
        );
        return stock && stock.availableQty >= item.quantityOrdered;
      }).length;

      return {
        ...branch,
        okCount,
        total,
        isFullyAvailable: total > 0 && okCount === total,
      };
    });
  }, [availability]);

  const selectedBranchStats = branchStats.find(
    (branch) => branch.id === selectedBranchId,
  );

  const selectedBranchItems = useMemo(() => {
    if (!availability?.items || !selectedBranchId) return [];
    return availability.items.map((item) => {
      const stock = (item.byBranch || []).find(
        (branchStock) => branchStock.branchId === selectedBranchId,
      );
      return {
        ...item,
        availableQty: stock?.availableQty ?? 0,
      };
    });
  }, [availability, selectedBranchId]);

  const assignedBranch = useMemo(() => {
    if (!order?.fulfillmentBranchId || !availability?.branches) return null;
    return availability.branches.find(
      (branch) => branch.id === order.fulfillmentBranchId,
    );
  }, [order?.fulfillmentBranchId, availability]);

  const handleAssign = async () => {
    if (!selectedBranchId || !onAssignBranch) return;
    setAssigning(true);
    setAssignError("");
    const updated = await onAssignBranch(order?.id, selectedBranchId);
    if (!updated) {
      setAssignError("Gán chi nhánh thất bại.");
    }
    setAssigning(false);
  };

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
      <div className="flex h-[min(88vh,860px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Đơn {order.orderCode || order.id}
              </h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getOrderStatusBadgeClasses(
                  order.status,
                )}`}
              >
                {toOrderStatusLabel(order.status)}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPaymentStatusBadgeClasses(
                  order.payment,
                )}`}
              >
                {toPaymentStatusLabel(order.payment)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{order.dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng chi tiết"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="material-symbols-outlined text-sm text-slate-400">
                  person
                </span>
                Thông tin đơn hàng
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Khách hàng</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {order.customer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{order.phone}</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-500">Tổng thanh toán</p>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {order.totalLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {toPaymentStatusLabel(order.payment)}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                <p className="text-xs text-slate-500">Địa chỉ giao hàng</p>
                <p className="mt-1 text-sm text-slate-700">{order.address}</p>
                {order.customerNote ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Ghi chú: {order.customerNote}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="material-symbols-outlined text-sm text-slate-400">
                  local_shipping
                </span>
                Trạng thái xử lý
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onUpdateStatus(option.key, order.id)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      order.status === option.key
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="material-symbols-outlined text-sm text-slate-400">
                storefront
              </span>
              Chi nhánh thực hiện
            </h4>
            {availabilityLoading ? (
              <p className="text-xs text-slate-500">Đang tải tồn kho...</p>
            ) : availabilityError ? (
              <p className="text-xs text-rose-600">{availabilityError}</p>
            ) : order.fulfillmentBranchId ? (
              <div className="space-y-1 text-sm text-slate-700">
                <p className="font-semibold">
                  {assignedBranch?.name || order.fulfillmentBranchId}
                </p>
                <p className="text-xs text-slate-500">
                  {order.fulfillmentAssignedAt
                    ? new Date(order.fulfillmentAssignedAt).toLocaleString(
                        "vi-VN",
                      )
                    : "Chưa có thời gian gán"}
                </p>
                {order.fulfillmentStatus ? (
                  <p className="text-xs text-slate-500">
                    Trạng thái: {order.fulfillmentStatus}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-2">
                  {branchStats.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                        selectedBranchId === branch.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {branch.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {branch.addressLine || branch.city || ""}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p
                          className={`font-semibold ${
                            branch.isFullyAvailable
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }`}
                        >
                          {branch.okCount}/{branch.total} đủ hàng
                        </p>
                        <p className="text-slate-400">{branch.status}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedBranchId ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      Tồn kho theo chi nhánh
                    </p>
                    <div className="space-y-2 text-sm">
                      {selectedBranchItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between gap-3"
                        >
                          <span className="text-slate-700">{item.name}</span>
                          <span
                            className={`text-xs font-semibold ${
                              item.availableQty >= item.quantityOrdered
                                ? "text-emerald-600"
                                : "text-rose-500"
                            }`}
                          >
                            {item.availableQty}/{item.quantityOrdered}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {assignError ? (
                  <p className="text-xs text-rose-600">{assignError}</p>
                ) : null}

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={!selectedBranchStats?.isFullyAvailable || assigning}
                  className={`w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    selectedBranchStats?.isFullyAvailable
                      ? "bg-primary hover:bg-primary/90"
                      : "cursor-not-allowed bg-slate-300"
                  }`}
                >
                  {assigning ? "Đang gán..." : "Gán chi nhánh này"}
                </button>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                Sản phẩm ({order.items.length})
              </h4>
              <span className="text-xs text-slate-500">
                {order.orderCode || order.id}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={`${item.sku || item.name}-${item.qty}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                    {item.unit ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Đơn vị: {item.unit}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.priceLabel}
                    </p>
                    <p className="text-xs text-slate-500">x{item.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span>{order.subtotalLabel}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Phí vận chuyển</span>
                <span>{order.shippingLabel}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-slate-900">
                <span>Tổng</span>
                <span className="text-primary">{order.totalLabel}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPanel;
