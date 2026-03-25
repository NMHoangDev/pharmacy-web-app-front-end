import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CheckoutBreadcrumbs from "../../components/checkout/CheckoutBreadcrumbs";
import DeliveryInfoForm from "../../components/checkout/DeliveryInfoForm";
import ShippingMethods from "../../components/checkout/ShippingMethods";
import PaymentMethods from "../../components/checkout/PaymentMethods";
import { useAppContext } from "../../context/AppContext";
import { useCart } from "../../contexts/CartContext";
import * as orderApi from "../../api/orderApi";
import * as paymentApi from "../../api/paymentApi";
import * as productApi from "../../api/productApi";
import * as userApi from "../../api/userApi";
import PageTransition from "../../components/ui/PageTransition";
import useNotificationAction from "../../hooks/useNotificationAction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

// Hardcoded options removed. Now fetched from backend.

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const shippingLabelMap = {
  STANDARD: {
    name: "Giao hàng tiêu chuẩn",
    description: "Dự kiến nhận hàng: 1-3 ngày",
    fee: 15000,
  },
  EXPRESS_2H: {
    name: "Giao hàng hỏa tốc (2h)",
    description: "Nhận hàng trong 2 giờ",
    fee: 45000,
  },
};

const paymentLabelMap = {
  COD: { name: "Thanh toán khi nhận hàng (COD)", icon: "attach_money" },
  BANK_TRANSFER: { name: "Chuyển khoản ngân hàng", icon: "account_balance" },
  VNPAY: { name: "Thanh toán VNPAY", icon: "payments" },
  ZALOPAY: { name: "Ví điện tử ZaloPay", icon: "qr_code_scanner" },
};

const CHECKOUT_VNPAY_PENDING_KEY = "checkout:vnpay:pending";

const readPendingVnpay = () => {
  try {
    const raw = localStorage.getItem(CHECKOUT_VNPAY_PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const writePendingVnpay = (payload) => {
  try {
    localStorage.setItem(CHECKOUT_VNPAY_PENDING_KEY, JSON.stringify(payload));
  } catch (e) {}
};

const clearPendingVnpay = () => {
  try {
    localStorage.removeItem(CHECKOUT_VNPAY_PENDING_KEY);
  } catch (e) {}
};

const normalizeText = (value) => String(value || "").trim();

const buildShippingAddress = (form) => ({
  fullName: normalizeText(form.fullName),
  phone: normalizeText(form.phone),
  addressLine: normalizeText(form.address),
  // Backend currently requires these fields as non-blank.
  provinceName: "N/A",
  provinceCode: "N/A",
  districtName: "N/A",
  districtCode: "N/A",
  wardName: "N/A",
  wardCode: "N/A",
});

const validateDeliveryForm = (form) => {
  if (!normalizeText(form.fullName))
    return "Vui lòng nhập họ và tên người nhận.";
  if (!normalizeText(form.phone))
    return "Vui lòng nhập số điện thoại người nhận.";
  if (!normalizeText(form.address)) return "Vui lòng nhập địa chỉ nhận hàng.";
  return "";
};

const normalizeShippingOptions = (options) =>
  (options || []).map((opt) => {
    const key = String(opt.id || "").toUpperCase();
    const label = shippingLabelMap[key];
    if (!label) return opt;
    const fee = Number(opt.fee ?? label.fee) || label.fee;
    return {
      ...opt,
      name: label.name,
      description: label.description,
      fee,
      feeLabel: formatCurrency(fee),
    };
  });

const normalizePaymentOptions = (options) =>
  (options || []).map((opt) => {
    const key = String(opt.id || "").toUpperCase();
    const label = paymentLabelMap[key];
    if (!label) return opt;
    return {
      ...opt,
      name: label.name,
      icon: label.icon,
    };
  });

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, authUser } = useAppContext();
  const { notifyAfterSuccess } = useNotificationAction();
  const { removeItem, refreshCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [processingVnpayReturn, setProcessingVnpayReturn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const vnpayReturnHandledRef = useRef(false);
  const [vnpayDialog, setVnpayDialog] = useState({
    open: false,
    status: "", // success | failed
    title: "",
    message: "",
  });

  const [shippingOptions, setShippingOptions] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [shippingId, setShippingId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [selectedCartIds, setSelectedCartIds] = useState([]);
  const [quote, setQuote] = useState({
    subtotal: 0,
    shippingFee: 0,
    discountAmount: 0,
    grandTotal: 0,
  });

  const [quoteLoading, setQuoteLoading] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  // VNPay return handler: detect query params on /checkout, verify via backend, show result dialog, clean URL.
  useEffect(() => {
    const search = location?.search || "";
    if (!search || vnpayReturnHandledRef.current) return;

    const params = new URLSearchParams(search);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionStatus = params.get("vnp_TransactionStatus");
    const txnRef = params.get("vnp_TxnRef") || "";

    // Only handle if VNPay params exist.
    if (!responseCode && !transactionStatus) return;

    vnpayReturnHandledRef.current = true;
    setProcessingVnpayReturn(true);
    setError("");

    const rawQuery = search.startsWith("?") ? search : `?${search}`;
    const pending = readPendingVnpay();
    const pendingTxnRef = pending?.txnRef ? String(pending.txnRef) : "";

    const cleanUrl = () => {
      try {
        navigate(location.pathname, { replace: true });
      } catch (e) {}
    };

    const handle = async () => {
      try {
        // Optional but recommended: backend verifies checksum and finalizes transaction/order.
        await paymentApi.verifyVnpayReturn(rawQuery);

        const isSuccess = responseCode === "00" && transactionStatus === "00";
        if (!isSuccess) {
          setVnpayDialog({
            open: true,
            status: "failed",
            title: "Thanh toán thất bại",
            message: "Vui lòng chọn phương thức thanh toán khác.",
          });
          return;
        }

        // If we stored a pending txnRef, enforce it to reduce accidental replays.
        if (pendingTxnRef && txnRef && pendingTxnRef !== txnRef) {
          setVnpayDialog({
            open: true,
            status: "failed",
            title: "Thanh toán thất bại",
            message: "Thông tin giao dịch không khớp. Vui lòng thử lại.",
          });
          return;
        }

        setVnpayDialog({
          open: true,
          status: "success",
          title: "Thanh toán thành công",
          message: "Đơn hàng của bạn đã được thanh toán.",
        });
      } catch (err) {
        setVnpayDialog({
          open: true,
          status: "failed",
          title: "Thanh toán thất bại",
          message:
            err?.message ||
            "Không thể xác thực thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.",
        });
      } finally {
        cleanUrl();
        clearPendingVnpay();
        setProcessingVnpayReturn(false);
      }
    };

    handle();
  }, [location.pathname, location.search, navigate]);

  // 1. Fetch Methods and Cart on mount
  useEffect(() => {
    if (!authUser?.id) return;

    // If VNPay just redirected back with query params, process return first.
    // This avoids extra API calls (and possible auth redirects) before showing the result dialog.
    const search = location?.search || "";
    if (
      search.includes("vnp_ResponseCode") ||
      search.includes("vnp_TransactionStatus")
    ) {
      return;
    }

    const initCheckout = async () => {
      try {
        setLoading(true);
        // Fetch everything in parallel
        const [shipRes, payRes, cartRes, userRes] = await Promise.all([
          orderApi.getShippingMethods(),
          paymentApi.getPaymentMethods(),
          orderApi.getCart(authUser.id),
          userApi.getUser(authUser.id),
        ]);

        setShippingOptions(normalizeShippingOptions(shipRes));
        setPaymentOptions(normalizePaymentOptions(payRes));
        if (shipRes.length > 0) setShippingId(shipRes[0].id);
        if (payRes.length > 0) setPaymentId(payRes[0].id);

        if (userRes) {
          setDeliveryForm((prev) => ({
            ...prev,
            fullName: prev.fullName || userRes.fullName || "",
            phone: prev.phone || userRes.phone || "",
          }));
        }

        let selectedIds = [];
        try {
          selectedIds = JSON.parse(
            sessionStorage.getItem("checkoutSelectedIds") || "[]",
          );
        } catch (e) {
          selectedIds = [];
        }
        const selectedSet = new Set(
          Array.isArray(selectedIds) ? selectedIds.map(String) : [],
        );
        const rawItems = Array.isArray(cartRes.items) ? cartRes.items : [];
        const filteredItems = selectedSet.size
          ? rawItems.filter((it) => selectedSet.has(String(it.productId)))
          : rawItems;

        setSelectedCartIds(selectedSet.size ? Array.from(selectedSet) : []);

        // Enrich IDs with full product info
        const enrichedItems = await Promise.all(
          filteredItems.map(async (item) => {
            try {
              const product = await productApi.getProductById(item.productId);
              return {
                id: item.productId,
                name: product.name || "Sản phẩm",
                subtitle: product.category || "",
                price: product.price || 0,
                quantity: item.quantity,
                image: product.imageUrls?.[0] || "",
                alt: product.name,
              };
            } catch (err) {
              return {
                id: item.productId,
                name: "Sản phẩm không tìm thấy",
                price: 0,
                quantity: item.quantity,
              };
            }
          }),
        );
        setCartItems(enrichedItems);
      } catch (err) {
        setError("Không thể khởi tạo thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [authUser?.id, location?.search]);

  // 2. Fetch Quote from Backend whenever options change
  useEffect(() => {
    if (!authUser?.id || cartItems.length === 0) return;
    if (!shippingId || !paymentId) return;

    let active = true;

    const fetchQuote = async () => {
      try {
        setQuoteLoading(true);
        const payload = {
          userId: authUser.id,
          items: cartItems.map((item) => ({
            productId: item.id,
            productName: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
          })),
          shippingMethod: shippingId,
          paymentMethod: paymentId,
          promoCode: promoCode?.trim() || "",
        };
        const quoteRes = await orderApi.getQuote(payload);
        if (!active) return;
        setQuote(
          quoteRes || {
            subtotal: 0,
            shippingFee: 0,
            discountAmount: 0,
            grandTotal: 0,
          },
        );
      } catch (err) {
        console.error("Failed to fetch quote", err);
      } finally {
        if (active) setQuoteLoading(false);
      }
    };

    const timer = setTimeout(fetchQuote, 500); // Debounce
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [authUser?.id, cartItems, shippingId, paymentId, promoCode]);

  const handleFormChange = (field, value) => {
    setDeliveryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    setError("");
    if (!authUser?.id || !accessToken) {
      navigate("/login");
      return;
    }
    if (!shippingId) {
      setError("Vui lòng chọn phương thức vận chuyển.");
      return;
    }
    if (!paymentId) {
      setError("Vui lòng chọn phương thức thanh toán.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Giỏ hàng trống, không thể đặt hàng.");
      return;
    }

    const validationError = validateDeliveryForm(deliveryForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const shippingAddress = buildShippingAddress(deliveryForm);
      if (process.env.NODE_ENV !== "production") {
        console.debug("[checkout.handlePlaceOrder] shippingAddress payload", {
          userId: authUser.id,
          shippingAddress,
        });
      }

      const checkoutPayload = {
        userId: authUser.id,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        shippingMethod: shippingId,
        paymentMethod: paymentId,
        note: deliveryForm.note,
        promoCode: promoCode?.trim() || "",
      };

      if (process.env.NODE_ENV !== "production") {
        console.debug(
          "[checkout.handlePlaceOrder] placeOrder payload",
          checkoutPayload,
        );
      }

      const orderData = await notifyAfterSuccess({
        action: () => orderApi.placeOrder(checkoutPayload),
        notificationPayload: (createdOrder) => ({
          category: "ORDER",
          title: "Đặt đơn hàng thành công",
          message: `Đơn hàng ${createdOrder?.orderId || "mới"} đã được tạo thành công`,
          sourceType: "ORDER",
          sourceId: String(createdOrder?.orderId || ""),
          sourceEventType: "ORDER_CREATED",
          actionUrl: "/account?tab=orders",
        }),
        options: {
          silent: false,
          errorMessage: "Failed to create notification after create order:",
        },
      });

      const idsToRemove = selectedCartIds.length
        ? selectedCartIds
        : cartItems.map((item) => item.id);

      if (idsToRemove.length) {
        await Promise.allSettled(idsToRemove.map((id) => removeItem(id)));
        await refreshCart();
      } else {
        clearCart();
      }

      try {
        sessionStorage.removeItem("checkoutSelectedIds");
      } catch (e) {}

      const provider = paymentId.toUpperCase();
      if (provider === "VNPAY") {
        const paymentPayload = {
          orderId: orderData.orderId,
          amount: Math.round(quote.grandTotal),
        };

        const payRes = await paymentApi.createVnpayPayment(paymentPayload);
        if (payRes?.data) {
          writePendingVnpay({
            orderId: orderData.orderId,
            txnRef: payRes?.txnRef || "",
            createdAt: Date.now(),
          });

          // Frontend VNPay debug: print hashData/query from returned URL (excluding vnp_SecureHash)
          try {
            const paymentUrl = String(payRes.data || "");
            const u = new URL(paymentUrl);
            const sp = new URLSearchParams(u.search);
            const secureHash = sp.get("vnp_SecureHash") || "";
            const raw =
              u.search && u.search.startsWith("?") ? u.search.slice(1) : "";
            const query = raw
              .split("&")
              .filter(Boolean)
              .filter(
                (p) =>
                  !p.startsWith("vnp_SecureHash=") &&
                  !p.startsWith("vnp_SecureHashType="),
              )
              .join("&");

            const decodeValue = (v) => {
              try {
                return decodeURIComponent(String(v || "").replace(/\+/g, " "));
              } catch (e) {
                return String(v || "");
              }
            };

            const hashData = query
              .split("&")
              .filter(Boolean)
              .map((pair) => {
                const idx = pair.indexOf("=");
                if (idx < 0) return pair;
                const k = pair.slice(0, idx);
                const v = pair.slice(idx + 1);
                return `${k}=${decodeValue(v)}`;
              })
              .join("&");

            console.log("==== VNPAY DEBUG ====");
            console.log("HASH DATA: " + query);
            console.log("HASH DATA RAW: " + hashData);
            console.log("QUERY: " + query);
            console.log("SECURE HASH: " + secureHash);
            console.log("=====================");
          } catch (e) {}

          window.location.href = payRes.data;
          return;
        }
        setError(payRes?.message || "Không thể khởi tạo thanh toán VNPAY.");
        return;
      }

      if (provider === "ZALOPAY") {
        setError("ZaloPay tạm thời chưa hỗ trợ. Vui lòng chọn VNPAY hoặc COD.");
        return;
      }

      navigate("/account", { state: { activeTab: "orders" } });
    } catch (err) {
      setError(err.message || "Thanh toán không thành công.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-gray-100 min-h-screen flex flex-col font-display">
      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <CheckoutBreadcrumbs />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-3xl font-black text-[#0d141b] dark:text-white tracking-tight mb-2">
                Thanh toán
              </h1>
              <p className="text-[#4c739a] dark:text-gray-400">
                Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng.
              </p>
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <DeliveryInfoForm form={deliveryForm} onChange={handleFormChange} />

            <ShippingMethods
              options={shippingOptions}
              selectedId={shippingId}
              onSelect={setShippingId}
            />

            <PaymentMethods
              options={paymentOptions}
              selectedId={paymentId}
              onSelect={setPaymentId}
            />
          </div>

          <div className="lg:w-[400px] shrink-0">
            <OrderSummary
              items={cartItems}
              shippingFee={quote.shippingFee}
              discount={quote.discountAmount}
              subtotal={quote.subtotal}
              total={quote.grandTotal}
              onApplyCoupon={setPromoCode}
              onSubmit={handlePlaceOrder}
              submitting={submitting || processingVnpayReturn}
              isLoading={loading || quoteLoading}
              appliedCode={promoCode}
            />
          </div>
        </div>
      </main>

      <Footer />

      <Dialog
        open={vnpayDialog.open}
        onOpenChange={(open) => setVnpayDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{vnpayDialog.title}</DialogTitle>
            <DialogDescription>{vnpayDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold"
              onClick={() => {
                const isSuccess = vnpayDialog.status === "success";
                setVnpayDialog({
                  open: false,
                  status: "",
                  title: "",
                  message: "",
                });
                if (isSuccess) {
                  navigate("/account?tab=orders");
                }
              }}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

const DiscountSelector = ({ value, onApply, disabled, loading, invalid }) => {
  const [mode, setMode] = useState(value ? "code" : "none");
  const [promoInput, setPromoInput] = useState(value || "");

  useEffect(() => {
    setPromoInput(value || "");
    setMode(value ? "code" : "none");
  }, [value]);

  const applyNone = () => {
    setPromoInput("");
    onApply("");
  };

  const applyCode = () => {
    onApply(promoInput);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-900 dark:text-white">
        Giảm giá
      </div>

      <label
        className={`flex items-start gap-3 border rounded-lg p-3 shadow-sm transition-colors ${
          mode === "none"
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-700 hover:border-red-500"
        }`}
      >
        <input
          type="radio"
          name="discount-mode"
          checked={mode === "none"}
          onChange={() => {
            setMode("none");
            applyNone();
          }}
          disabled={disabled || loading}
          className="mt-1"
        />
        <div className="min-w-0">
          <div className="font-medium text-slate-900 dark:text-white">
            Không áp dụng
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Thanh toán theo giá hiện tại.
          </div>
        </div>
      </label>

      <label
        className={`border rounded-lg p-3 shadow-sm transition-colors ${
          mode === "code"
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-700 hover:border-red-500"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="discount-mode"
            checked={mode === "code"}
            onChange={() => setMode("code")}
            disabled={disabled}
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900 dark:text-white">
              Nhập mã giảm giá
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Áp dụng mã cho đơn hàng này.
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                disabled={disabled}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:border-primary focus:ring-primary"
                placeholder="Mã giảm giá (ví dụ: PROMO10)"
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={
                  disabled || loading || !String(promoInput || "").trim()
                }
                className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
                  disabled || loading || !String(promoInput || "").trim()
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                }`}
              >
                {loading ? "Đang kiểm tra..." : "Áp dụng"}
              </button>
            </div>

            {invalid && !loading ? (
              <div className="mt-2 text-sm text-red-500">
                Mã không hợp lệ hoặc không áp dụng cho đơn này.
              </div>
            ) : null}
          </div>
        </div>
      </label>
    </div>
  );
};

const OrderSummary = ({
  items,
  shippingFee,
  discount,
  subtotal,
  total,
  onApplyCoupon,
  onSubmit,
  submitting,
  isLoading,
  appliedCode,
}) => {
  const [totalPulse, setTotalPulse] = useState(false);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (prevTotalRef.current !== total) {
      setTotalPulse(true);
      const t = setTimeout(() => setTotalPulse(false), 180);
      prevTotalRef.current = total;
      return () => clearTimeout(t);
    }
    return undefined;
  }, [total]);

  const invalidCode =
    Boolean(String(appliedCode || "").trim()) && Number(discount || 0) <= 0;

  return (
    <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto pr-2">
        {(items || []).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {item.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                x{item.quantity}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
              {formatCurrency((item.price || 0) * (item.quantity || 0))}
            </div>
          </div>
        ))}
      </div>

      <div className={isLoading ? "opacity-60 pointer-events-none" : ""}>
        <DiscountSelector
          value={appliedCode}
          onApply={onApplyCoupon}
          disabled={submitting}
          loading={isLoading}
          invalid={invalidCode}
        />
      </div>

      <div
        className={`mt-6 space-y-2 text-sm ${isLoading ? "opacity-60" : ""}`}
      >
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Tạm tính</span>
          <span className="text-slate-900 dark:text-white tabular-nums min-w-[7rem] text-right">
            {isLoading ? "..." : formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">
            Phí vận chuyển
          </span>
          <span className="text-slate-900 dark:text-white tabular-nums min-w-[7rem] text-right">
            {isLoading ? "..." : formatCurrency(shippingFee)}
          </span>
        </div>

        <div className="flex justify-between text-red-500">
          <span>Giảm giá</span>
          <span className="tabular-nums min-w-[7rem] text-right">
            {isLoading ? "..." : `-${formatCurrency(discount)}`}
          </span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-lg">
          <span className="text-slate-900 dark:text-white">Tổng</span>
          <span
            className={`text-slate-900 dark:text-white tabular-nums transition-transform duration-200 ${
              totalPulse ? "scale-[1.02]" : ""
            }`}
          >
            {isLoading ? "..." : formatCurrency(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || isLoading}
        className={`mt-6 w-full rounded-lg bg-primary text-white px-4 py-3 text-sm font-semibold shadow-sm transition-opacity ${
          submitting || isLoading
            ? "opacity-60 cursor-not-allowed"
            : "hover:opacity-95"
        }`}
      >
        {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
      </button>
    </div>
  );
};

export default CheckoutPage;
