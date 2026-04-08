import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/components/layout/Header";
import Footer from "../../../shared/components/layout/Footer";
import CheckoutBreadcrumbs from "../components/CheckoutBreadcrumbs";
import DeliveryInfoForm from "../components/DeliveryInfoForm";
import ShippingMethods from "../components/ShippingMethods";
import PaymentMethods from "../components/PaymentMethods";
import { useAppContext } from "../../../app/contexts/AppContext";
import { useCart } from "../../../app/contexts/CartContext";
import * as orderApi from "../../orders/api/orderApi";
import * as paymentApi from "../api/paymentApi";
import * as productApi from "../../medicines/api/productApi";
import * as userApi from "../../account/api/userApi";
import { authApi } from "../../../shared/api/httpClients";
import PageTransition from "../../../shared/components/ui/PageTransition";
import useNotificationAction from "../../../shared/hooks/useNotificationAction";
import { formatCompactCurrency } from "../../../shared/utils/discountUi";
import "../../../app/styles/storefront-premium.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";

// Hardcoded options removed. Now fetched from backend.

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const parseMoneyNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const raw = String(value ?? "");
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const num = Number(digits);
  return Number.isFinite(num) ? num : NaN;
};

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

const openOrdersHistory = (navigate, options = {}) =>
  navigate("/account?tab=orders", {
    replace: !!options.replace,
    state: {
      activeTab: "orders",
      paymentResult: options.paymentResult || "",
      paymentMessage: options.paymentMessage || "",
    },
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

  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [availableDiscountsLoading, setAvailableDiscountsLoading] =
    useState(false);
  const [availableDiscountsError, setAvailableDiscountsError] = useState("");

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

    const handle = async () => {
      const isSuccess = responseCode === "00" && transactionStatus === "00";
      try {
        // Backend verifies checksum and finalizes transaction/order.
        await paymentApi.verifyVnpayReturn(rawQuery);
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

        try {
          sessionStorage.removeItem("checkoutSelectedIds");
        } catch (e) {}
        try {
          await refreshCart();
        } catch (e) {}
        clearPendingVnpay();
        setProcessingVnpayReturn(false);
        openOrdersHistory(navigate, {
          replace: true,
          paymentResult: "success",
          paymentMessage:
            "Thanh toán thành công. Đơn hàng đã được cập nhật sang Đã thanh toán và Đang xử lý.",
        });
        return;
      } catch (err) {
        if (isSuccess) {
          clearPendingVnpay();
          setProcessingVnpayReturn(false);
          openOrdersHistory(navigate, {
            replace: true,
            paymentResult: "success",
            paymentMessage:
              "Thanh toán đã hoàn tất. Đơn hàng đang được cập nhật trong lịch sử mua hàng.",
          });
          return;
        }

        setVnpayDialog({
          open: true,
          status: "failed",
          title: "Thanh toán thất bại",
          message:
            err?.message ||
            "Không thể xác thực thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.",
        });
      } finally {
        clearPendingVnpay();
        setProcessingVnpayReturn(false);
      }
    };

    handle();
  }, [location.pathname, location.search, navigate, refreshCart]);

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

  // 3. Fetch available discounts for the user (non-blocking)
  useEffect(() => {
    if (!authUser?.id || !accessToken) return;

    let active = true;
    const load = async () => {
      try {
        setAvailableDiscountsError("");
        setAvailableDiscountsLoading(true);
        const res = await authApi.get("/user/discounts/available");
        const payload = res?.data;
        const items = Array.isArray(payload)
          ? payload
          : (payload?.content ?? payload?.data ?? []);
        if (!active) return;
        setAvailableDiscounts(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!active) return;
        setAvailableDiscounts([]);
        setAvailableDiscountsError(
          err?.message || "Không thể tải danh sách mã giảm giá",
        );
      } finally {
        if (active) setAvailableDiscountsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [accessToken, authUser?.id]);

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
    <PageTransition className="storefront-shell text-[#0d141b] min-h-screen flex flex-col font-display">
      <Header />

      <main className="storefront-container flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <CheckoutBreadcrumbs />

        <section className="storefront-hero storefront-fade-up mb-8 rounded-[32px] border border-white/70 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400"></div>
              <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Hoàn tất đơn hàng của bạn
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Xác nhận địa chỉ, chọn vận chuyển, thanh toán và voucher trong
                một trải nghiệm mượt mà hơn.
              </p>
            </div>
            <div className="storefront-soft-card rounded-[22px] px-5 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Tổng số sản phẩm
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {cartItems.reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
                  0,
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row">
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

          <div className="lg:w-[420px] shrink-0">
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
              availableDiscounts={availableDiscounts}
              availableDiscountsLoading={availableDiscountsLoading}
              availableDiscountsError={availableDiscountsError}
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
                  openOrdersHistory(navigate, {
                    paymentResult: "success",
                    paymentMessage:
                      "Thanh toán thành công. Đơn hàng đã được cập nhật trong lịch sử đơn hàng.",
                  });
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

const DiscountSelector = ({
  value,
  onApply,
  disabled,
  loading,
  invalid,
  options,
  subtotal,
  optionsLoading,
  optionsError,
}) => {
  const orderSubtotal = Number(subtotal || 0);

  const eligibleOptions = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    return safeOptions.filter((item) => {
      const min = parseMoneyNumber(item?.minOrderValue);
      if (!Number.isFinite(min) || min <= 0) return true;
      return orderSubtotal >= min;
    });
  }, [options, orderSubtotal]);

  const eligibleCodeSet = useMemo(
    () =>
      new Set(
        eligibleOptions
          .map((item) =>
            String(item?.code || "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      ),
    [eligibleOptions],
  );

  const normalizedValue = useMemo(
    () =>
      String(value || "")
        .trim()
        .toLowerCase(),
    [value],
  );

  const [mode, setMode] = useState(() => {
    if (!normalizedValue) return "none";
    return eligibleCodeSet.has(normalizedValue) ? "eligible" : "code";
  });
  const [promoInput, setPromoInput] = useState(value || "");

  useEffect(() => {
    setPromoInput(value || "");
    if (!normalizedValue) {
      setMode("none");
      return;
    }
    setMode(eligibleCodeSet.has(normalizedValue) ? "eligible" : "code");
  }, [eligibleCodeSet, normalizedValue, value]);

  const applyNone = () => {
    setPromoInput("");
    onApply("");
  };

  const applyCode = () => {
    onApply(String(promoInput || "").trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Giảm giá
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Chọn voucher phù hợp hoặc nhập mã giảm giá của bạn.
          </div>
        </div>
        <div className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          {optionsLoading ? "Đang tải..." : `${eligibleOptions.length} mã`}
        </div>
      </div>

      {optionsError && !optionsLoading ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {optionsError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Voucher khả dụng
        </div>

        {optionsLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
            Đang tải danh sách voucher...
          </div>
        ) : eligibleOptions.length > 0 ? (
          <div className="space-y-2">
            {eligibleOptions.map((opt) => {
              const code = String(opt?.code || "").trim();
              const isSelected =
                mode === "eligible" &&
                String(promoInput || "")
                  .trim()
                  .toLowerCase() === code.toLowerCase();

              const type = String(opt?.type || "").toUpperCase();
              const valueLabel =
                type === "PERCENT"
                  ? `Giảm ${Number(opt?.value || 0)}%`
                  : type === "FREESHIP"
                    ? "Miễn phí giao hàng"
                    : `Giảm ${formatCurrency(parseMoneyNumber(opt?.value) || 0)}`;

              const min = parseMoneyNumber(opt?.minOrderValue);
              const minLabel =
                Number.isFinite(min) && min > 0
                  ? `Đơn tối thiểu ${formatCurrency(min)}`
                  : "Không yêu cầu giá trị tối thiểu";

              return (
                <button
                  key={code || opt?.id}
                  type="button"
                  onClick={() => {
                    setMode("eligible");
                    setPromoInput(code);
                    onApply(code);
                  }}
                  disabled={disabled || loading}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-slate-200 bg-white hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {opt?.name || "Mã giảm giá"}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {code}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {minLabel}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {valueLabel}
                      </div>
                      {isSelected ? (
                        <div className="mt-1 text-[11px] font-semibold text-primary">
                          Đang áp dụng
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
            Chưa có voucher nào phù hợp với đơn hàng hiện tại.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-start gap-3">
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
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              Không áp dụng
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Thanh toán theo giá hiện tại.
            </div>
          </div>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-start gap-3">
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

            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                disabled={disabled}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                placeholder="Mã giảm giá, ví dụ: PROMO10"
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={
                  disabled || loading || !String(promoInput || "").trim()
                }
                className={`h-11 rounded-xl px-4 text-sm font-semibold transition ${
                  disabled || loading || !String(promoInput || "").trim()
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800"
                    : "bg-slate-900 text-white hover:opacity-90 dark:bg-white dark:text-slate-900"
                }`}
              >
                {loading ? "Đang kiểm tra..." : "Áp dụng"}
              </button>
            </div>

            {invalid && !loading ? (
              <div className="mt-2 text-sm text-red-500">
                Mã không hợp lệ hoặc chưa đủ điều kiện áp dụng.
              </div>
            ) : null}
          </div>
        </label>
      </div>
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
  availableDiscounts,
  availableDiscountsLoading,
  availableDiscountsError,
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
  const normalizedAppliedCode = String(appliedCode || "")
    .trim()
    .toLowerCase();
  const appliedDiscountMeta = (
    Array.isArray(availableDiscounts) ? availableDiscounts : []
  ).find(
    (item) =>
      String(item?.code || "")
        .trim()
        .toLowerCase() === normalizedAppliedCode,
  );
  const availableDiscountCount = Array.isArray(availableDiscounts)
    ? availableDiscounts.length
    : 0;

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

      <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-4 shadow-sm dark:border-amber-400/20 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
              Ưu đãi đơn hàng
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {availableDiscountsLoading
                ? "Đang tải voucher phù hợp..."
                : availableDiscountCount > 0
                  ? `Bạn đang có ${availableDiscountCount} mã giảm giá`
                  : "Chưa có mã giảm giá khả dụng"}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {normalizedAppliedCode
                ? `Mã đang áp dụng: ${String(appliedCode).trim().toUpperCase()}`
                : "Chọn voucher bên dưới hoặc nhập mã để thử áp dụng."}
            </div>
          </div>

          {discount > 0 ? (
            <div className="shrink-0 rounded-2xl bg-white/90 px-4 py-3 text-right shadow-sm dark:bg-slate-900/80">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Đang tiết kiệm
              </div>
              <div className="mt-1 text-lg font-black text-rose-600 dark:text-rose-300">
                -{formatCompactCurrency(discount)}
              </div>
            </div>
          ) : null}
        </div>

        {appliedDiscountMeta?.name ? (
          <div className="mt-3 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            <span className="font-semibold">{appliedDiscountMeta.name}</span>
            {appliedDiscountMeta?.code ? (
              <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {String(appliedDiscountMeta.code).toUpperCase()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={isLoading ? "opacity-60 pointer-events-none" : ""}>
        <DiscountSelector
          value={appliedCode}
          onApply={onApplyCoupon}
          disabled={submitting}
          loading={isLoading}
          invalid={invalidCode}
          options={availableDiscounts}
          subtotal={subtotal}
          optionsLoading={availableDiscountsLoading}
          optionsError={availableDiscountsError}
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

        {normalizedAppliedCode && !isLoading ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
            {discount > 0
              ? `Đơn hàng đang áp dụng mã ${String(appliedCode)
                  .trim()
                  .toUpperCase()} và giảm ${formatCurrency(discount)}.`
              : `Mã ${String(appliedCode)
                  .trim()
                  .toUpperCase()} hiện chưa đủ điều kiện hoặc không còn hiệu lực.`}
          </div>
        ) : null}

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
