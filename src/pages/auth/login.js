import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
  const navigate = useNavigate();
  const API_BASE_URL = useMemo(
    () => process.env.REACT_APP_API_BASE_URL || "http://localhost:8087",
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, message: "" });

  const closeModal = () => setModal({ open: false, message: "" });

  const handleLogin = async ({ identifier, password }) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error("Login failed", {
          status: res.status,
          statusText: res.statusText,
          detail,
        });
        throw new Error(detail || "Sai mật khẩu hoặc tài khoản không tồn tại.");
      }

      const data = await res.json();

      localStorage.setItem("authToken", data.token);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: data.userId,
          email: data.email,
          phone: data.phone,
          fullName: data.fullName,
          expiresAt: data.expiresAt,
        })
      );

      navigate("/");
    } catch (err) {
      const msg = err.message || "Sai mật khẩu hoặc tài khoản không tồn tại.";
      console.loading("Login error", err);
      setError(msg);
      setModal({ open: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

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
        {error && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
      <LoginForm onSubmit={handleLogin} loading={loading} />
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-2xl">
                error
              </span>
              <h2 className="text-lg font-semibold text-slate-900">
                Đăng nhập không thành công
              </h2>
            </div>
            <p className="text-sm text-slate-600">{modal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold"
                onClick={closeModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
