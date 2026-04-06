import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import LoginForm from "../../components/auth/LoginForm";
import { useAppContext } from "../../context/AppContext";
import { publicApi as apiClient } from "../../api/httpClients";
import { getRolesFromToken } from "../../auth/jwt";
import { startGoogleOidcLogin } from "../../auth/keycloakOidc";
import { getDefaultPathForRoles } from "../../auth/roleRedirect";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading, isAuthenticated, roles } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    navigate(getDefaultPathForRoles(roles), { replace: true });
  }, [authLoading, isAuthenticated, navigate, roles]);

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
      navigate(getDefaultPathForRoles(getRolesFromToken(data?.token)), {
        replace: true,
      });
    } catch (err) {
      const msg = err.message || "Sai mật khẩu hoặc tài khoản không tồn tại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setOauthLoading(true);
    try {
      const nextPath =
        location.state?.from?.pathname && location.state?.from?.pathname !== "/login"
          ? `${location.state.from.pathname}${location.state.from.search || ""}`
          : "/";
      await startGoogleOidcLogin({ nextPath });
    } catch (err) {
      setOauthLoading(false);
      setError(
        err.message || "Không thể bắt đầu đăng nhập với Google qua Keycloak.",
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <AuthLayout
        brand="Pharmacare"
        formMaxWidth="max-w-[448px]"
        hero={
          <AuthHero
            title="Đăng nhập một lần, tiếp tục mọi hành trình chăm sóc sức khỏe."
            subtitle="Từ mua thuốc, theo dõi đơn hàng đến nhận tư vấn dược sĩ, mọi thao tác đều được đồng bộ trong một tài khoản an toàn."
            metricValue="98%"
            metricLabel="Phiên đăng nhập thành công"
            highlights={[
              "Theo dõi đơn thuốc, đơn hàng và thanh toán trên cùng một tài khoản.",
              "Nhận tư vấn, nội dung sức khỏe và ưu đãi theo đúng nhu cầu của bạn.",
              "Trải nghiệm ổn định trên cả điện thoại và máy tính.",
            ]}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAb4nU7JSfanOGoyEObMQx7IXUMDlIW8wegLETolmtxgaeRB-_cv2yBoqXfm3CNz2cXGi-uX9RRE9hgy-n9zYygrVUKTEDT2IXKWd9NVQeJ6hLYeWIcL7Ndz4TxNo9VNl_ctM0VS8Kq4EKmv1PEleOrjHxiPOCTVDMEylZX6eTd_fglHkRW0uZYUCrKk5CNq5XtsNHOXlXv9au6Py3XmzYpI0P_3_QoXBbazZZbXUiwlh2OKslN8SFNNgwaj2mfNPKt-Fkq0OsTZDJ_"
          />
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              Đăng nhập
            </div>
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold leading-tight text-slate-900">
                Chào mừng bạn quay lại
              </h1>
              <p className="text-sm leading-6 text-slate-500">
                Đăng nhập để tiếp tục mua thuốc, theo dõi đơn hàng và quản lý
                lịch sử chăm sóc sức khỏe của bạn.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <LoginForm
            onSubmit={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            loading={loading}
            oauthLoading={oauthLoading}
            error={error}
          />
        </div>
      </AuthLayout>
    </motion.div>
  );
};

export default LoginPage;
