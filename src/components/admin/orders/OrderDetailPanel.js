import React, { useEffect, useMemo, useState } from "react";
import { authApi } from "../../../api/httpClients";

const statusStyles = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  processing: { label: "Processing", color: "bg-blue-500" },
  shipped: { label: "Shipped", color: "bg-purple-500" },
  completed: { label: "Completed", color: "bg-slate-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

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
  const badge = statusStyles[order?.status] || statusStyles.pending;

  useEffect(() => {
    if (!open || !order?.id) return;
    const controller = new AbortController();
    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        const response = await authApi.get(
          `/api/admin/orders/${order.id}/branch-availability`,
          { signal: controller.signal },
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
          (b) => b.branchId === branch.id,
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
    (b) => b.id === selectedBranchId,
  );

  const selectedBranchItems = useMemo(() => {
    if (!availability?.items || !selectedBranchId) return [];
    return availability.items.map((item) => {
      const stock = (item.byBranch || []).find(
        (b) => b.branchId === selectedBranchId,
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
      (b) => b.id === order.fulfillmentBranchId,
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
      <div className="flex h-[min(86vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Đơn {order.id}
              </h3>
              <span className={`flex size-2 rounded-full ${badge.color}`} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{order.dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng chi tiết"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="material-symbols-outlined text-slate-400 text-sm">
                storefront
              </span>
              Chi nhánh thực hiện
            </h4>
            {availabilityLoading ? (
              <p className="text-xs text-slate-500">Đang tải tồn kho...</p>
            ) : availabilityError ? (
              <p className="text-xs text-rose-600">{availabilityError}</p>
            ) : order.fulfillmentBranchId ? (
              <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
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
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selectedBranchId === branch.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:bg-slate-50"
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
                      <div className="text-xs text-right">
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
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      Tồn kho theo chi nhánh
                    </p>
                    <div className="space-y-2 text-sm">
                      {selectedBranchItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between"
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
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    selectedBranchStats?.isFullyAvailable
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {assigning ? "Đang gán..." : "Gán chi nhánh này"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="material-symbols-outlined text-slate-400 text-sm">
                person
              </span>
              Thông tin khách hàng
            </h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  account_circle
                </span>
                <div>
                  <p className="font-semibold">{order.customer}</p>
                  <p className="text-xs text-slate-500">{order.customerNote}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  call
                </span>
                <span>{order.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">
                  location_on
                </span>
                <span>{order.address}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Sản phẩm ({order.items.length})
            </h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.name} className="flex gap-3 items-center">
                  <div
                    className="size-12 shrink-0 rounded bg-slate-100 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-label={item.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.meta}</p>
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
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
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
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Trạng thái
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(statusStyles).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onUpdateStatus(key, order.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    order.status === key
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-slate-200 text-slate-700 hover:border-primary"
                  }`}
                >
                  {statusStyles[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onUpdateStatus("completed", order.id)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                check
              </span>
              Hoàn tất
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus("cancelled", order.id)}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <span className="material-symbols-outlined text-[18px]">
                block
              </span>
              Hủy đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPanel;
