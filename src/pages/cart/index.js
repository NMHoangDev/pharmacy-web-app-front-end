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
import { getUserId } from "../../utils/auth";
import { calcSubtotal, calcVat } from "../../utils/currency";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CartBreadcrumbs from "../../components/cart/CartBreadcrumbs";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import RelatedProducts from "../../components/cart/RelatedProducts";
import EmptyState from "../../components/EmptyState";

const VAT_RATE = 0.08;

const relatedProducts = [
  {
    id: "rel-mask",
    name: "Khẩu trang y tế 4 lớp (Hộp 50 cái)",
    subtitle: "Hộp 50 cái",
    price: "35.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClIGEMc2twr8pldJCzYyQJEI4lt3qw_tG0QYimYI8SITxzIFdBHMvfXK6DMbX3mcGjLuAgE-nitdSkshvH3Lmj0Fc0Q50w51zHN7I6RPKeznty1n7dJvrYGjPSUOBYikfpeanVwV8AcQQSUZq3M-XejpxoKaC5Xn8v7OWQQvmf34FI0-F6QYC8UpFRFrZgkQogLtXXh_JBAH1jsBvsniJpHxtvRS_esm-TkaAzZe4oRSA8PSPur6il6GLbEyZ4nzQEAMsJiRxoqGsT",
    discount: "-10%",
  },
  {
    id: "rel-sanitizer",
    name: "Nước rửa tay khô Lifebuoy 100ml",
    subtitle: "Chai 100ml",
    price: "42.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZqlxBg415ebzr9fv6RAPUz49e39j4y9EGdl1eyTFO3EqE9la-BVXazJ9ESWkhuanAMdS0IKPJmtDiIXuCWXJvQsF7rJ6oxND4LCwdn-KRf6yX0cwfrm7VHmeNS7N2Sgw_a_-EcXO14ugqfdYF2dXpv5Jhq3pOKALfh4lE50IZ297hMKuFlS3NL8ROKGoAal_vuYo12545KtfehfE6wSUKZck9eC6IHH33s_-J2X8uvJOgxsorZbsZEl7U8x603sEtw_C87NRbesTA",
  },
  {
    id: "rel-bandage",
    name: "Băng cá nhân Urgo (Hộp 100 miếng)",
    subtitle: "Hộp 100 miếng",
    price: "85.000đ",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPQ-c5RO62X8lFv6z6cwxd6Ch7ISeH0Efe-I1c13ZiUvoIJunrXGKprIq9E-UgD-ut40QbmF6Pt9ycdIERV5FT69djwcdGTVqT7QbWNwzodC14hsMkNkMVdcR_DcQtBE6Cb996oDrhNDZwnDBIIkJyJVMF9o6zQu38kY3TSYL6f5LStVNS3qWOXrI1G4hufWMWw1ZAo9-RN1y0pQeCWOqTmksty_J_ACxK0OTxJ0-X2OYclUwBzqWvdnusKRIDdkDYUVBVn4R5ntSI",
  },
  {
    id: "rel-multivit",
    name: "Vitamin tổng hợp One A Day",
    subtitle: "Lọ 60 viên",
    price: "320.000đ",
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

  // debug: log context cart items on every render
  // eslint-disable-next-line no-console
  console.log("CartPage render -> ctxCartItems:", ctxCartItems);
  // debug: auth info
  // eslint-disable-next-line no-console
  console.log(
    "CartPage authToken:",
    sessionStorage.getItem("authToken"),
    "getUserId:",
    getUserId(),
  );

  const [cartItems, setCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const productCacheRef = useRef({});

  // Build display cart items from ctxCartItems + product cache
  // Ensure we refresh on mount if context is empty
  useEffect(() => {
    if (
      !loading &&
      (!Array.isArray(ctxCartItems) || ctxCartItems.length === 0)
    ) {
      // eslint-disable-next-line no-console
      console.log("CartPage mounted -> ctx empty calling refreshCart");
      refreshCart().catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("refreshCart error", e);
      });
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
              const p = await productApi.getProductById(id);
              productCacheRef.current[id] = p || null;
            } catch (e) {
              productCacheRef.current[id] = null;
            }
          }),
        );
      }

      const items = rawItems.map((it) => {
        const p = productCacheRef.current[it.productId];
        return {
          id: it.productId, // IMPORTANT: use productId as key for row & selection
          name: (p && (p.name || p.title)) || "Sản phẩm không tên",
          price: (p && (p.price || p.unitPrice)) || it.unitPrice || 0,
          image: (p && (p.imageUrl || p.image)) || undefined,
          subtitle:
            p && (p.subtitle || p.shortDescription)
              ? p.subtitle || p.shortDescription
              : "",
          quantity: it.quantity || 1,
        };
      });

      setCartItems(items);
      // auto select all by default (optional)
      setSelectedIds(items.map((i) => i.id));
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

  // id here is productId
  const handleQuantityChange = async (id, quantity) => {
    const newQty = Math.max(1, Number(quantity) || 1);

    // optimistic UI
    setCartItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: newQty } : it)),
    );

    try {
      await upsertItem(id, newQty);
      // optional: refreshCart to sync header cart icon count
      await refreshCart();
    } catch (err) {
      await refreshCart();
      alert(err?.message || "Không thể cập nhật số lượng");
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeItem(id);
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      // optional: refreshCart to sync
      await refreshCart();
    } catch (err) {
      alert(err?.message || "Không thể xóa sản phẩm");
    }
  };

  const handleCheckout = useCallback(() => {
    if (!selectedIds.length) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    // tuỳ hệ thống của bạn: dùng /checkout hoặc /payment
    navigate("/checkout");
  }, [navigate, selectedIds]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full flex justify-center py-8 px-4 md:px-10 lg:px-40">
        <div className="flex flex-col max-w-[1200px] w-full gap-6">
          <CartBreadcrumbs />

          <div className="flex flex-wrap justify-between items-end gap-3 px-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141b] dark:text-white tracking-light text-[32px] font-bold leading-tight">
                Giỏ hàng của bạn
              </h1>
              <p className="text-[#4c739a] text-sm font-normal leading-normal">
                ({totalItemCount} sản phẩm)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Empty state first (when not loading) */}
              {!loading && cartItems.length === 0 ? (
                <EmptyState
                  title="Giỏ hàng trống"
                  subtitle="Bạn chưa thêm sản phẩm nào vào giỏ hàng."
                  actionLabel="Tiếp tục mua sắm"
                  onAction={() => navigate("/medicines")}
                />
              ) : (
                <div className="flex overflow-hidden rounded-lg border border-[#cfdbe7] dark:border-gray-700 bg-white dark:bg-[#1a2634] shadow-sm">
                  <table className="flex-1 w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-gray-800 border-b border-[#cfdbe7] dark:border-gray-700">
                        <th className="px-4 py-3 text-left w-[50px]">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                            className="h-5 w-5 rounded border-[#cfdbe7] border-2 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-[#4c739a] text-sm font-medium leading-normal w-[40%]">
                          Sản phẩm
                        </th>
                        <th className="hidden sm:table-cell px-4 py-3 text-left text-[#4c739a] text-sm font-medium leading-normal">
                          Đơn giá
                        </th>
                        <th className="px-4 py-3 text-left text-[#4c739a] text-sm font-medium leading-normal">
                          Số lượng
                        </th>
                        <th className="hidden md:table-cell px-4 py-3 text-left text-[#4c739a] text-sm font-medium leading-normal">
                          Thành tiền
                        </th>
                        <th className="px-4 py-3 text-right text-[#4c739a] text-sm font-medium leading-normal" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#cfdbe7] dark:divide-gray-700">
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

                  <div className="p-4 bg-slate-50 dark:bg-gray-800 border-t border-[#cfdbe7] dark:border-gray-700 sm:hidden">
                    <p className="text-xs text-center text-[#4c739a]">
                      Kéo sang trái để xem thêm chi tiết
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
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
