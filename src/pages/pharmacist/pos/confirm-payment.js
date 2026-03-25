import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createOfflinePosOrder,
  confirmOfflinePosPayment,
} from "../../../api/pharmacistPosApi";

const paymentMethods = [
  { key: "CASH", icon: "payments", label: "Tiền mặt" },
  { key: "BANK_TRANSFER", icon: "account_balance", label: "Chuyển khoản" },
  { key: "QR_COUNTER", icon: "qr_code_scanner", label: "QR Pay" },
  { key: "POS_CARD", icon: "credit_card", label: "Thẻ" },
];

const toMoney = (value) => Number(value || 0);

const PosConfirmPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.orderDraft;

  const [method, setMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState(toMoney(draft?.total));
  const [transferReference, setTransferReference] = useState("");
  const [note, setNote] = useState(draft?.consultationNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !draft?.branchId ||
      !draft?.pharmacistId ||
      !Array.isArray(draft?.items)
    ) {
      navigate("/pharmacist/pos", { replace: true });
    }
  }, [draft, navigate]);

  const subtotal = toMoney(draft?.subtotal);
  const discount = toMoney(draft?.discount);
  const taxFee = toMoney(draft?.taxFee);
  const total = toMoney(draft?.total);

  const cashChange = useMemo(() => {
    if (method !== "CASH") return 0;
    return Math.max(toMoney(amountReceived) - total, 0);
  }, [amountReceived, method, total]);

  const itemCount = useMemo(
    () =>
      (draft?.items || []).reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0,
      ),
    [draft?.items],
  );

  const quickAmounts = useMemo(() => {
    const rounded = Math.ceil(total / 10000) * 10000;
    return [total, rounded, rounded + 50000].filter(
      (v, i, arr) => arr.indexOf(v) === i,
    );
  }, [total]);

  const handleConfirmPayment = async () => {
    if (!draft?.items?.length) {
      setError("Đơn hàng không hợp lệ.");
      return;
    }

    const received = method === "CASH" ? toMoney(amountReceived) : total;
    if (method === "CASH" && received < total) {
      setError("Số tiền khách đưa chưa đủ.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const created = await createOfflinePosOrder({
        branchId: draft.branchId,
        pharmacistId: draft.pharmacistId,
        customerName: draft.customerName || undefined,
        customerPhone: draft.customerPhone || undefined,
        consultationId: draft.consultationId || undefined,
        items: draft.items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
        discount,
        taxFee,
        note:
          [note, draft?.prescriptionSummary]
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .join(" | ") || undefined,
      });

      const paid = await confirmOfflinePosPayment(created.id, {
        pharmacistId: draft.pharmacistId,
        method,
        amountReceived: received,
        transferReference: transferReference || undefined,
      });

      navigate("/pharmacist/pos", {
        replace: true,
        state: {
          paymentSuccess: true,
          orderCode: paid?.orderCode || created?.orderCode || "",
        },
      });
    } catch (err) {
      setError(err.message || "Thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen p-4 md:p-6 font-display text-slate-900 dark:text-slate-100">
      <div className="mx-auto w-full max-w-[1100px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        <section className="w-full md:w-5/12 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Đơn hàng tại quầy
              </p>
              <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                CHƯA THANH TOÁN
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Chi tiết đơn hàng
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {(draft?.items || []).map((item, index) => (
              <div
                key={`${item.productId || "item"}-${index}`}
                className="flex items-start justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-medium truncate">
                    {item.productName || item.sku || "Sản phẩm"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {Number(item.unitPrice || 0).toLocaleString("vi-VN")}đ / đơn
                    vị
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">
                    {Number(item.lineTotal || 0).toLocaleString("vi-VN")}đ
                  </p>
                  <p className="text-xs text-slate-500">x{item.qty}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Giảm giá</span>
              <span>{discount.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Thuế/Phí</span>
              <span>{taxFee.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 items-end">
              <div>
                <p className="text-sm font-bold">Tổng cộng</p>
                <p className="text-xs text-slate-500">{itemCount} sản phẩm</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {total.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </section>

        <section className="w-full md:w-7/12 flex flex-col min-h-0">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">
              Xác nhận thanh toán
            </h1>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => navigate("/pharmacist/pos")}
              disabled={submitting}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-5 min-h-0">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <p className="text-slate-500 text-sm font-medium mb-3 uppercase tracking-wider">
                Phương thức thanh toán
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentMethods.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all ${
                      method === item.key
                        ? "border-2 border-primary bg-primary/5 text-primary"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setMethod(item.key)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {item.icon}
                    </span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {method === "CASH" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số tiền khách đưa
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-base focus:ring-2 focus:ring-primary focus:border-primary"
                      type="number"
                      min={0}
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tiền thừa trả khách
                    </label>
                    <input
                      className="w-full rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 px-3 py-2.5 text-base font-bold text-green-700"
                      type="text"
                      readOnly
                      value={`${cashChange.toLocaleString("vi-VN")}đ`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                      onClick={() => setAmountReceived(value)}
                    >
                      {value.toLocaleString("vi-VN")}đ
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mã giao dịch / Tham chiếu
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Nhập mã giao dịch"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={2}
                placeholder="Nhập ghi chú cho đơn hàng này..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50"
              onClick={() => navigate("/pharmacist/pos")}
              disabled={submitting}
            >
              Quay lại POS
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-60"
              onClick={handleConfirmPayment}
              disabled={submitting}
            >
              <span className="material-symbols-outlined text-lg">
                payments
              </span>
              <span>
                {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PosConfirmPaymentPage;
