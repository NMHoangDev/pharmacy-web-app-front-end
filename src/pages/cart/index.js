import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import productApi from "../../api/productApi";
import { useCart } from "../../contexts/CartContext";
import { calcSubtotal, calcVat } from "../../utils/currency";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CartBreadcrumbs from "../../components/cart/CartBreadcrumbs";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import RelatedProducts from "../../components/cart/RelatedProducts";
import EmptyState from "../../components/EmptyState";
import "../../styles/storefront-premium.css";

const VAT_RATE = 0.08;

const relatedProducts = [
  {
    id: "rel-mask",
    name: "Khẩu trang y tế 4 lớp ",
    subtitle: "Hộp 50 cái",
    price: "35.000d",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClIGEMc2twr8pldJCzYyQJEI4lt3qw_tG0QYimYI8SITxzIFdBHMvfXK6DMbX3mcGjLuAgE-nitdSkshvH3Lmj0Fc0Q50w51zHN7I6RPKeznty1n7dJvrYGjPSUOBYikfpeanVwV8AcQQSUZq3M-XejpxoKaC5Xn8v7OWQQvmf34FI0-F6QYC8UpFRFrZgkQogLtXXh_JBAH1jsBvsniJpHxtvRS_esm-TkaAzZe4oRSA8PSPur6il6GLbEyZ4nzQEAMsJiRxoqGsT",
    discount: "-10%",
  },
  {
    id: "rel-sanitizer",
    name: "Nước rửa tay khô Lifebuoy 100ml",
    subtitle: "Chai 100ml",
    price: "42.000d",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZqlxBg415ebzr9fv6RAPUz49e39j4y9EGdl1eyTFO3EqE9la-BVXazJ9ESWkhuanAMdS0IKPJmtDiIXuCWXJvQsF7rJ6oxND4LCwdn-KRf6yX0cwfrm7VHmeNS7N2Sgw_a_-EcXO14ugqfdYF2dXpv5Jhq3pOKALfh4lE50IZ297hMKuFlS3NL8ROKGoAal_vuYo12545KtfehfE6wSUKZck9eC6IHH33s_-J2X8uvJOgxsorZbsZEl7U8x603sEtw_C87NRbesTA",
  },
  {
    id: "rel-bandage",
    name: "Băng cá nhân Urgo (Hộp 100 miếng)",
    subtitle: "Hộp 100 miếng",
    price: "85.000d",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPQ-c5RO62X8lFv6z6cwxd6Ch7ISeH0Efe-I1c13ZiUvoIJunrXGKprIq9E-UgD-ut40QbmF6Pt9ycdIERV5FT69djwcdGTVqT7QbWNwzodC14hsMkNkMVdcR_DcQtBE6Cb996oDrhNDZwnDBIIkJyJVMF9o6zQu38kY3TSYL6f5LStVNS3qWOXrI1G4hufWMWw1ZAo9-RN1y0pQeCWOqTmksty_J_ACxK0OTxJ0-X2OYclUwBzqWvdnusKRIDdkDYUVBVn4R5ntSI",
  },
  {
    id: "rel-multivit",
    name: "Vitamin tổng hợp One A Day",
    subtitle: "Lọ 60 viên",
    price: "320.000d",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG5CvTJ6eF4QzMszh07cFkaT0AvYcSenIQKKQ1ao_sCH8fwzpPqBG5ezUIdxWesd80Uf5ZhSNjpnkG01OIrWxa1TSMBYoWlEtX74AWK7iPzOr3zsMCoGlVbEjEyLMuzSWMvJ8u2l9J60ap1AebUEPOUBvssgX0bWhbaN4osA6tY0Dvb_F5g-ZzOkBpHWYka0HtyU0ngI6JBVhzS7TMSHXBStJA3wh5liEPfetJn4RoQS2BZafjjJt_yee4PwGbYwqG0UsFQunmdp3W",
  },
];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const CartPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAppContext();
  const {
    cartItems: ctxCartItems,
    loading,
    refreshCart,
    upsertItem,
    removeItem,
  } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const productCacheRef = useRef({});
  const didInitialRefreshRef = useRef(false);

  useEffect(() => {
    didInitialRefreshRef.current = false;
  }, [authUser?.id]);

  useEffect(() => {
    if (loading || didInitialRefreshRef.current) return;
    if (!Array.isArray(ctxCartItems) || ctxCartItems.length === 0) {
      didInitialRefreshRef.current = true;
      refreshCart().catch(() => {});
    }
  }, [loading, ctxCartItems, refreshCart]);

  useEffect(() => {
    const loadForCart = async () => {
      const rawItems = Array.isArray(ctxCartItems) ? ctxCartItems : [];
      if (rawItems.length === 0) {
        setCartItems([]);
        setSelectedIds([]);
        return;
      }

      const uniqueIds = Array.from(
        new Set(rawItems.map((i) => i.productId)),
      ).filter(Boolean);
      const toFetch = uniqueIds.filter(
        (id) => productCacheRef.current[id] === undefined,
      );

      if (toFetch.length) {
        await Promise.all(
          toFetch.map(async (id) => {
            try {
              const product = await productApi.getProductById(id);
              productCacheRef.current[id] = product || null;
            } catch {
              productCacheRef.current[id] = null;
            }
          }),
        );
      }

      const items = rawItems.map((it) => {
        const product = productCacheRef.current[it.productId];
        return {
          id: it.productId,
          name: (product && (product.name || product.title)) || "San pham",
          price:
            (product && (product.price || product.unitPrice)) ||
            it.unitPrice ||
            0,
          image: (product && (product.imageUrl || product.image)) || undefined,
          subtitle:
            product && (product.subtitle || product.shortDescription)
              ? product.subtitle || product.shortDescription
              : "",
          quantity: it.quantity || 1,
        };
      });

      setCartItems(items);
      setSelectedIds(items.map((item) => item.id));
    };

    loadForCart();
  }, [ctxCartItems]);

  const totalItemCount = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => calcSubtotal(cartItems, selectedIds),
    [cartItems, selectedIds],
  );

  const discount = 0;
  const vatAmount = useMemo(
    () => calcVat(subtotal - discount, VAT_RATE),
    [subtotal, discount],
  );
  const total = useMemo(
    () => subtotal - discount + vatAmount,
    [subtotal, discount, vatAmount],
  );

  const allSelected =
    selectedIds.length === cartItems.length && cartItems.length > 0;

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? cartItems.map((item) => item.id) : []);
  };

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((itemId) => itemId !== id);
    });
  };

  const handleQuantityChange = async (id, quantity) => {
    const newQty = Math.max(1, Number(quantity) || 1);
    setCartItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: newQty } : it)),
    );

    try {
      await upsertItem(id, newQty);
      await refreshCart();
    } catch (err) {
      await refreshCart();
      alert(err?.message || "Khong the cap nhat so luong");
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeItem(id);
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      await refreshCart();
    } catch (err) {
      alert(err?.message || "Khong the xoa san pham");
    }
  };

  const handleCheckout = useCallback(() => {
    if (!selectedIds.length) {
      alert("Vui long chon it nhat 1 san pham de thanh toan.");
      return;
    }
    try {
      sessionStorage.setItem(
        "checkoutSelectedIds",
        JSON.stringify(selectedIds),
      );
    } catch {}
    navigate("/checkout");
  }, [navigate, selectedIds]);

  return (
    <div className="storefront-shell min-h-screen font-display text-slate-900">
      <Header />

      <main className="storefront-container flex flex-1 justify-center px-4 py-8 md:px-8 lg:px-14">
        <div className="flex w-full max-w-[1280px] flex-col gap-6">
          <CartBreadcrumbs />

          <section className="storefront-hero storefront-fade-up rounded-[32px] border border-white/70 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Cart experience
                </div>
                <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Giỏ hàng của bạn
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Kiểm tra sản phẩm, cập nhật số lượng và xem tổng chi phí trước
                  khi chuyển sang bước thanh toán.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="storefront-soft-card rounded-[22px] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Sản phẩm
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900">
                    {totalItemCount}
                  </div>
                </div>
                <div className="storefront-soft-card rounded-[22px] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Tạm tính
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
                <div className="storefront-soft-card rounded-[22px] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Tổng tạm tính
                  </div>
                  <div className="mt-2 text-lg font-bold text-primary">
                    {formatCurrency(total)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-8">
              {!loading && cartItems.length === 0 ? (
                <div className="storefront-card rounded-[28px] p-6">
                  <EmptyState
                    title="Giỏ hàng trống"
                    subtitle="Bạn chưa thêm sản phẩm nào vào giỏ hàng."
                    actionLabel="Tiếp tục mua sắm"
                    onAction={() => navigate("/medicines")}
                  />
                </div>
              ) : (
                <div className="storefront-card overflow-hidden rounded-[28px]">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[linear-gradient(180deg,#ffffff,#f8fbff)]">
                        <tr className="border-b border-slate-200">
                          <th className="w-[50px] px-4 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) =>
                                toggleSelectAll(e.target.checked)
                              }
                              className="h-5 w-5 cursor-pointer rounded border-slate-300 border-2 bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                            />
                          </th>
                          <th className="w-[40%] px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Sản phẩm
                          </th>
                          <th className="hidden px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 sm:table-cell">
                            Đơn giá
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Số lượng
                          </th>
                          <th className="hidden px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 md:table-cell">
                            Thành tiền
                          </th>
                          <th className="px-4 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-slate-500" />
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {cartItems.map((item) => (
                          <CartItemRow
                            key={item.id}
                            item={item}
                            isSelected={selectedIds.includes(item.id)}
                            onSelect={handleSelect}
                            onChangeQuantity={handleQuantityChange}
                            onRemove={handleRemove}
                            formatCurrency={formatCurrency}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 p-4 sm:hidden">
                    <p className="text-center text-xs text-slate-500">
                      éo ngang để xem thêm chi tiết trên màn hình nhỏ
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="storefront-card h-24 animate-pulse rounded-[24px]"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-6 lg:col-span-4">
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                vatRate={VAT_RATE}
                vatAmount={vatAmount}
                total={total}
                itemCount={totalItemCount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>

          <RelatedProducts products={relatedProducts} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
