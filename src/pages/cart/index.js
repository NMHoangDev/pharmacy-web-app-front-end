import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CartBreadcrumbs from "../../components/cart/CartBreadcrumbs";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import RelatedProducts from "../../components/cart/RelatedProducts";

const VAT_RATE = 0.08;

const initialCart = [
  {
    id: "item-panadol",
    name: "Panadol Extra",
    subtitle: "Hộp 15 vỉ x 12 viên",
    price: 120000,
    quantity: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRU8EEqyAuUefWlJcQLDCY5GgwUgKHGQvqO3kVf0gLzTqSPqAft7NtGTlp5TUkiY9CanQy8LfjZcoQMDK3v5uzhgqybTa1UQ1l0fV4_2ps1d6RMrY3KhKvUQl8_FfhIpWcn1lYL0jh96ywUSc9AgkknKrpJv0CBFFsVNb5MYg2qyt0-EaBpzPaaXK5-o6Dp-C1vsPVHDlecFJG9ZDb8iuovnLr098Srr_cr6SDCQD1AA-XsMW3MtTJv04Av7kZADiQHB12Ft9Ql7_A",
    alt: "Hộp Panadol Extra đỏ",
  },
  {
    id: "item-berberin",
    name: "Berberin 100mg",
    subtitle: "Lọ 100 viên",
    price: 25000,
    quantity: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkAQ4qAKdQWMJVnpDfwtpMuekHTIcR2U8uBl_XboWCiBnl2x0MF9IyGIxJeDty88OZ3Xvg6-tJTXmbEo1tZ4tnQYr43vUKshmWf4oZGLLeslSmw-vnc-WKjG7ummghE5Sd21Naq2q6i2IEJT1Rv3443OPU7GG-8kDDwQvFDbEH4qc7CRG720ZaqsEDfxE-t1_69tdT-JaPlq8tLReCzoTXPsYI_yPxDhc7aKO5AVw4lmtJLiTa2-_Wr921phYeyBGy9gahX38RvL7o",
    alt: "Lọ Berberin màu vàng",
  },
  {
    id: "item-vitamin-c",
    name: "Vitamin C 500mg",
    subtitle: "Hộp 10 vỉ",
    price: 45000,
    quantity: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8vaPrYdlw7fVPGHaiFZLKXS5fW_rNm7OkNfcmHWyZhnMjbasDE3qlkD6kvmSPytMu7tlwFYL39mLj72R33RYb8gFu3QvMPeO8jqm4KQxR2g3Wrtb5iK7hXpOYkE3yUC1KpVvn-uAvQaSERM-3BBpUbBFMSMTqCQyBZ4GR1HsU8okWmbiKI-H7b4VnJsIGePTxsX1X9XaBHAPH_-Kmh17EPWzXaVkn93KKs8f7gCUCt_BScDP2OpjWwG2u_OTZPlCyYyw0xhISIL4r",
    badge: "Bán chạy",
    alt: "Vỉ Vitamin C màu cam",
  },
];

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
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(initialCart);
  const [selectedIds, setSelectedIds] = useState(() =>
    initialCart.map((item) => item.id)
  );

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (!selectedIds.includes(item.id)) return sum;
      return sum + item.price * item.quantity;
    }, 0);
  }, [cartItems, selectedIds]);

  const discount = 0;
  const vatAmount = subtotal * VAT_RATE;
  const total = subtotal - discount + vatAmount;

  const allSelected =
    selectedIds.length === cartItems.length && cartItems.length > 0;

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? cartItems.map((item) => item.id) : []);
  };

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((itemId) => itemId !== id);
    });
  };

  const handleQuantityChange = (id, quantity) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleCheckout = () => {
    const itemsForCheckout = cartItems.filter((item) =>
      selectedIds.includes(item.id)
    );
    if (itemsForCheckout.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems: itemsForCheckout,
      },
    });
  };

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
                ({itemCount} sản phẩm)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
            <div className="lg:col-span-8 flex flex-col gap-4">
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

              {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#1a2634] rounded-lg border border-[#cfdbe7] dark:border-gray-700">
                  <span className="material-symbols-outlined text-[64px] text-gray-300">
                    shopping_basket
                  </span>
                  <p className="mt-4 text-gray-500 font-medium">
                    Giỏ hàng của bạn đang trống
                  </p>
                  <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold">
                    Tiếp tục mua sắm
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                vatRate={VAT_RATE}
                vatAmount={vatAmount}
                total={total}
                itemCount={itemCount}
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
