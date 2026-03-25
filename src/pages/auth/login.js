import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";
import { useAppContext } from "../../context/AppContext";
import { publicApi as apiClient } from "../../api/httpClients";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async ({ identifier, password }) => {
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.post("/api/auth/login", {
        identifier,
        password,
      });

      const data = res.data;
      login(data);
      console.log("Login successful", data);

      navigate("/");
    } catch (err) {
      const msg = err.message || "Sai mật khẩu hoặc tài khoản không tồn tại.";
      console.error("Login error", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hero = (
    <AuthHero
      title="Your health journey starts with one secure sign in."
      image="https://lh3.googleusercontent.com/aida-public/AB6AXuAb4nU7JSfanOGoyEObMQx7IXUMDlIW8wegLETolmtxgaeRB-_cv2yBoqXfm3CNz2cXGi-uX9RRE9hgy-n9zYygrVUKTEDT2IXKWd9NVQeJ6hLYeWIcL7Ndz4TxNo9VNl_ctM0VS8Kq4EKmv1PEleOrjHxiPOCTVDMEylZX6eTd_fglHkRW0uZYUCrKk5CNq5XtsNHOXlXv9au6Py3XmzYpI0P_3_QoXBbazZZbXUiwlh2OKslN8SFNNgwaj2mfNPKt-Fkq0OsTZDJ_"
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AuthLayout
        hero={hero}
        brand="Pharmacy Plus"
        formMaxWidth="max-w-[420px]"
      >
        <motion.div
          whileHover={{ y: -1 }}
          className="w-full rounded-2xl bg-white/85 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-[8px]"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold leading-tight text-[#111827]">
                Đăng nhập
              </h1>
              <p className="text-sm text-[#6B7280]">
                Chào mừng trở lại. Đăng nhập để tiếp tục chăm sóc sức khỏe của
                bạn.
              </p>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          </div>
        </motion.div>
      </AuthLayout>
    </motion.div>
  );
};

export default LoginPage;
