import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PosTopBar from "../../../components/pharmacist-pos/PosTopBar";
import PharmacistSidebar from "../../../components/pharmacist-pos/PharmacistSidebar";
import PosSearchBar from "../../../components/pharmacist-pos/PosSearchBar";
import PosProductTable from "../../../components/pharmacist-pos/PosProductTable";
import PosOrderPanel from "../../../components/pharmacist-pos/PosOrderPanel";
import {
  listOfflinePosOrders,
  searchPosProducts,
} from "../../../api/pharmacistPosApi";
import { useAppContext } from "../../../../../app/contexts/AppContext";
import { useBranches } from "../../../../../shared/hooks/useBranches";

const toUuid = (value) => {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(v) ? v : null;
};

const PharmacistPosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, userId } = useAppContext();
  const {
    branches,
    loading: loadingBranches,
    error: branchError,
  } = useBranches();

  const [query, setQuery] = useState("");
  const [branchId, setBranchId] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxFee, setTaxFee] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentOrderCode, setCurrentOrderCode] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkedConsultation, setLinkedConsultation] = useState(
    location.state?.consultationDraft || null,
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [cart],
  );

  const total = useMemo(() => {
    const d = Number(discount) || 0;
    const t = Number(taxFee) || 0;
    return Math.max(subtotal - d + t, 0);
  }, [subtotal, discount, taxFee]);

  const pharmacistId = useMemo(
    () => toUuid(userId) || toUuid(authUser?.id),
    [userId, authUser],
  );

  const normalizedBranchId = useMemo(() => toUuid(branchId), [branchId]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError("");
    try {
      const res = await searchPosProducts({
        q: query.trim() || undefined,
        branchId: normalizedBranchId || undefined,
        page: 0,
        size: 20,
      });
      setProducts(Array.isArray(res?.content) ? res.content : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoadingProducts(false);
    }
  }, [normalizedBranchId, query]);

  const loadRecentOrders = useCallback(async () => {
    if (!normalizedBranchId) return;
    try {
      const res = await listOfflinePosOrders({
        range: "TODAY",
        branchId: normalizedBranchId || undefined,
        page: 0,
        size: 5,
      });
      setRecentOrders(Array.isArray(res?.content) ? res.content : []);
    } catch {
      setRecentOrders([]);
    }
  }, [normalizedBranchId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [branchId, branches]);

  useEffect(() => {
    loadRecentOrders();
  }, [loadRecentOrders]);

  useEffect(() => {
    if (location.state?.consultationDraft) {
      setLinkedConsultation(location.state.consultationDraft);
      setMessage(
        `Đang tạo đơn từ tư vấn ${location.state.consultationDraft.appointmentId || ""}`.trim(),
      );
      setError("");
    }
  }, [location.state]);

  useEffect(() => {
    if (!location.state?.paymentSuccess) return;

    setCurrentOrderCode(location.state?.orderCode || "");
    setMessage(
      `Thanh toán thành công đơn ${location.state?.orderCode || ""}`.trim(),
    );
    setError("");
    setCart([]);
    setDiscount(0);
    setTaxFee(0);
    loadRecentOrders();
    loadProducts();
    navigate("/pharmacist/pos", { replace: true });
  }, [location.state, loadProducts, loadRecentOrders, navigate]);

  const handleAddToCart = (product) => {
    setMessage("");
    setError("");
    setCart((prev) => {
      const existed = prev.find((item) => item.productId === product.productId);
      if (existed) {
        return prev.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                qty: item.qty + 1,
                lineTotal: (item.qty + 1) * item.unitPrice,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.productId,
          sku: product.sku,
          name: product.name,
          unitPrice: Number(product.unitPrice || 0),
          qty: 1,
          lineTotal: Number(product.unitPrice || 0),
          batchNo: product.lotNo || null,
          expiryDate: product.expiryDate || null,
        },
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return { ...item, qty: nextQty, lineTotal: nextQty * item.unitPrice };
        })
        .filter(Boolean),
    );
  };

  const handleContinue = () => {
    setMessage("");
    setError("");

    if (!normalizedBranchId) {
      setError("Vui lòng chọn chi nhánh.");
      return;
    }
    if (!pharmacistId) {
      setError("Không xác định được tài khoản dược sĩ.");
      return;
    }
    if (!cart.length) {
      setError("Giỏ hàng trống.");
      return;
    }

    navigate("/pharmacist/pos/confirm-payment", {
      state: {
        orderDraft: {
          branchId: normalizedBranchId,
          pharmacistId,
          customerName: linkedConsultation?.customerName || undefined,
          customerPhone: linkedConsultation?.customerPhone || undefined,
          consultationId: linkedConsultation?.appointmentId || undefined,
          consultationNote: linkedConsultation?.note || undefined,
          prescriptionSummary:
            linkedConsultation?.prescriptionSummary || undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            productName: item.name,
            batchNo: item.batchNo,
            expiryDate: item.expiryDate,
            qty: item.qty,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
          discount: Number(discount) || 0,
          taxFee: Number(taxFee) || 0,
          subtotal,
          total,
        },
      },
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light font-display antialiased text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <PharmacistSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <PosTopBar
        userName={authUser?.fullName || authUser?.email || "Dược sĩ"}
        roleName="Dược sĩ"
        onToggleSidebar={() => setSidebarOpen(true)}
        onClearCart={() => {
          setCart([]);
          setMessage("");
          setError("");
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:p-4 xl:flex-row xl:gap-0">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-background-dark">
          <PosSearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={loadProducts}
            branchId={branchId}
            onBranchIdChange={setBranchId}
            branches={branches}
            branchLoading={loadingBranches}
            loading={loadingProducts}
          />

          <div className="px-4 pb-2 md:px-6">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                {message}
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
            <PosProductTable
              products={products}
              onAddToCart={handleAddToCart}
            />

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-sm font-semibold">
                Đơn gần đây (hôm nay)
              </h3>

              <div className="space-y-2 text-sm">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {order.orderCode}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {order.status} •{" "}
                          {Number(order.totalAmount || 0).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Chưa có đơn nào.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <PosOrderPanel
          cart={cart}
          discount={discount}
          taxFee={taxFee}
          onDiscountChange={(value) => setDiscount(Number(value) || 0)}
          onTaxFeeChange={(value) => setTaxFee(Number(value) || 0)}
          onDecreaseQty={(id) => updateQty(id, -1)}
          onIncreaseQty={(id) => updateQty(id, 1)}
          onRemoveItem={(id) =>
            setCart((prev) => prev.filter((item) => item.productId !== id))
          }
          onContinue={handleContinue}
          onClear={() => setCart([])}
          subtotal={subtotal}
          total={total}
          currentOrderCode={currentOrderCode}
        />
      </main>
    </div>
  );
};

export default PharmacistPosPage;
