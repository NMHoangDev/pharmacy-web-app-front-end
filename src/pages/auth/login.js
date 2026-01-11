import React from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
  const hero = (
    <AuthHero
      title="Chăm sóc sức khỏe toàn diện cho gia đình bạn"
      description="Kết nối với mạng lưới dược sĩ chuyên nghiệp và tiếp cận các sản phẩm y tế chất lượng cao, an toàn và nhanh chóng."
      image="https://lh3.googleusercontent.com/aida-public/AB6AXuAb4nU7JSfanOGoyEObMQx7IXUMDlIW8wegLETolmtxgaeRB-_cv2yBoqXfm3CNz2cXGi-uX9RRE9hgy-n9zYygrVUKTEDT2IXKWd9NVQeJ6hLYeWIcL7Ndz4TxNo9VNl_ctM0VS8Kq4EKmv1PEleOrjHxiPOCTVDMEylZX6eTd_fglHkRW0uZYUCrKk5CNq5XtsNHOXlXv9au6Py3XmzYpI0P_3_QoXBbazZZbXUiwlh2OKslN8SFNNgwaj2mfNPKt-Fkq0OsTZDJ_"
      bullets={[
        {
          icon: "medical_services",
          title: "Tư vấn cùng dược sĩ",
          body: "Đội ngũ chuyên môn sẵn sàng hỗ trợ 24/7.",
        },
        {
          icon: "inventory_2",
          title: "Theo dõi đơn hàng",
          body: "Cập nhật trạng thái vận chuyển và lịch sử mua.",
        },
        {
          icon: "card_giftcard",
          title: "Ưu đãi thành viên",
          body: "Tích điểm đổi quà và nhận voucher độc quyền.",
        },
      ]}
    />
  );

  return (
    <AuthLayout hero={hero} brand="Pharmacy Plus">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          Đăng nhập
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          Chào mừng trở lại. Đăng nhập để tiếp tục chăm sóc sức khỏe của bạn.
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
