import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CheckoutBreadcrumbs from "../../components/checkout/CheckoutBreadcrumbs";
import DeliveryInfoForm from "../../components/checkout/DeliveryInfoForm";
import ShippingMethods from "../../components/checkout/ShippingMethods";
import PaymentMethods from "../../components/checkout/PaymentMethods";
import OrderSummary from "../../components/checkout/OrderSummary";

const defaultItems = [
  {
    id: "panadol",
    name: "Panadol Extra 500mg",
    subtitle: "Hộp 15 vỉ x 12 viên",
    price: 140000,
    quantity: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDP0UGd15PmZpV6DQpeSwcN3tyEneDcyQl1xlAnamdrxTGlrkqLKcBGmCZXALfdFMEcuHPULvlbAcaWwpIe6yZ_Pc83ya9liN5NHeYUiaDUGb4V9ywOa4CnIrQ9875bfs5A6V4ky-z_zYXJ6_RwWsPXq5sAZCrPi_ZQ_LXmwyRQ8g0vcdaOtJlHv21lcIv-18jEx0oIzLWBon4tMeZqFGyb3eoqDlefRfEXZlXq9ePd5YIwwCqdNvlrRhFBD7U6S61wtFaNiI6BrtGZ",
    alt: "Panadol Extra 500mg",
  },
  {
    id: "vitaminc",
    name: "Vitamin C 500mg Kirkland",
    subtitle: "Lọ 500 viên",
    price: 450000,
    quantity: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSGZkLY1q8PDi_97_nA3H42RrUCGgqkIBeceDntyVF72fgPqThPlsO2scasYiE8nKx00MMAuD8w7llBtZ_NOrtXNZyluzW832h1KjxbBKA-NkwFlIzm1-AKcM9w4aWQxnFK6jb6_HCa6Eh0bTsjXQb87Gpc-OmwxZHV9JuArOV80PQDu22Z2M6-Ir04CHebiaEWeiW5KNlGROg5qFK_eB4R5BCxNG7DoUd8io0n0ks-2OljQOTfW0PicNoZSPjOmXFnmvSim5RjwPe",
    alt: "Vitamin C 500mg Kirkland",
  },
  {
    id: "mask",
    name: "Khẩu trang Y tế 4 lớp",
    subtitle: "Hộp 50 cái",
    price: 35000,
    quantity: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCX6eVA2I2MmUry2uSm8lN5n2g_QtQHhYoQ-j08Nd0xcx6594OFz3gTVFWuWnX_6zl-eTvR7_0qiXKvTnELWvuNCN6Mc-TDHH-nYTOr8EssGXRft8n0DNcn8p6OUO83gQLO6GT2Qh5K_-nKHrdjFS8CiTJIa5CbGTx6lcER3j3riroO1p2_eb32ASmu5fh-0Gc_HGeszbsNjNc9Al-NBG3YFp0kzC27BrrwiW2p65OCfVgJd6ApfmFpgP4AUB-y8crAiSHzOK0NDcS-",
    alt: "Khẩu trang Y tế",
  },
];

const shippingOptions = [
  {
    id: "standard",
    name: "Giao hàng tiêu chuẩn",
    desc: "Dự kiến nhận hàng: 14/06 - 16/06",
    fee: 15000,
    feeLabel: "15.000₫",
  },
  {
    id: "express",
    name: "Giao hàng hỏa tốc (2h)",
    desc: "Nhận hàng trong 2 giờ",
    fee: 45000,
    feeLabel: "45.000₫",
  },
];

const paymentOptions = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    icon: "attach_money",
    badge: "Khuyên dùng",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: "account_balance",
  },
  {
    id: "card",
    label: "Thẻ tín dụng / Ghi nợ quốc tế",
    icon: "credit_card",
  },
  {
    id: "ewallet",
    label: "Ví điện tử MoMo / ZaloPay",
    icon: "qr_code_scanner",
  },
];

const formatCurrency = (value) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems?.length
    ? location.state.cartItems
    : defaultItems;

  const [deliveryForm, setDeliveryForm] = useState({
    fullName: "Nguyễn Văn A",
    phone: "0912 345 678",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    ward: "Bến Nghé",
    note: "",
  });
  const [shippingId, setShippingId] = useState(shippingOptions[0].id);
  const [paymentId, setPaymentId] = useState(paymentOptions[0].id);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const shippingFee = useMemo(() => {
    const selected = shippingOptions.find((opt) => opt.id === shippingId);
    return selected ? selected.fee : 0;
  }, [shippingId]);

  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const handleFormChange = (field, value) => {
    setDeliveryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    // Placeholder action; integrate API later
    alert(
      `Đặt hàng thành công!\nTổng thanh toán: ${formatCurrency(
        total
      )}\nPhương thức: ${paymentId}`
    );
    navigate("/");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-gray-100 min-h-screen flex flex-col font-display">
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
              shippingFee={shippingFee}
              discount={discount}
              subtotal={subtotal}
              total={total}
              onApplyCoupon={() => {}}
              onSubmit={handlePlaceOrder}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
