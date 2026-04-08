import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthHero from "../components/AuthHero";
import SignupForm from "../components/SignupForm";
import { useAppContext } from "../../../app/contexts/AppContext";
import { startGoogleOidcLogin } from "../../../shared/auth/keycloakOidc";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const API_BASE_URL = useMemo(
    () =>
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_API_BASE_URL ||
      "http://localhost:8087",
    [],
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState({ open: false, type: "", message: "" });

  const closeModal = () => setModal({ open: false, type: "", message: "" });

  const handleSignup = async (form) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail;
        try {
          const json = await res.json();
          detail = json?.message || JSON.stringify(json);
        } catch (e) {
          detail = await res.text();
        }

        if (res.status === 409) {
          const lower = (detail || "").toLowerCase();
          let userMessage = "Email hoặc số điện thoại đã được đăng ký.";
          if (lower.includes("email")) userMessage = "Email đã được đăng ký.";
          if (lower.includes("phone") || lower.includes("số")) {
            userMessage = "Số điện thoại đã được đăng ký.";
          }
          setError(userMessage);
          setModal({ open: true, type: "error", message: userMessage });
          return;
        }

        throw new Error(detail || "Đăng ký thất bại. Kiểm tra lại thông tin.");
      }

      const data = await res.json();
      setSuccess("Tạo tài khoản thành công. Vui lòng đăng nhập.");
      setModal({
        open: true,
        type: "success",
        message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
      });

      if (data?.token) {
        login(data);
      }

      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      const msg = err.message || "Đăng ký thất bại. Kiểm tra lại thông tin.";
      setError(msg);
      setModal({ open: true, type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setOauthLoading(true);
    try {
      await startGoogleOidcLogin({ nextPath: "/" });
    } catch (err) {
      setOauthLoading(false);
      setError(
        err.message || "Không thể bắt đầu đăng ký với Google qua Keycloak.",
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
        formMaxWidth="max-w-[540px]"
        hero={
          <AuthHero
            title="Tạo tài khoản để mua thuốc và quản lý chăm sóc sức khỏe dễ hơn."
            subtitle="Đăng ký một lần để lưu thông tin giao hàng, theo dõi đơn mua, nhận tư vấn dược sĩ và sử dụng các tính năng cá nhân hóa trong hệ thống."
            metricValue="3 bước"
            metricLabel="Đăng ký nhanh, rõ ràng"
            highlights={[
              "Lưu hồ sơ cá nhân để đặt hàng và thanh toán nhanh hơn trong những lần sau.",
              "Nhận lịch sử đơn mua, đơn thuốc và hỗ trợ sức khỏe ở một nơi thống nhất.",
              "Chuẩn bị dữ liệu nền cho các tính năng tư vấn thông minh và gợi ý phù hợp.",
            ]}
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBOcrWLuiRwJCdDac42Y7IguhEGRZVxoR1VTpUabE5Wa5_ZDPmrSgMQpPl6IcOaNKXtUECt-4gmid5I0lPEcAT0GO_HU3SBcbYfnhidPPcufUVN9EDMYaUKgzd66MoqHXfWcsFTRCXA8k9NXp4tfKDON3EcrZPAmw-OF7emthJxLsr90fEzvfW0nKOhUv-1MVC_ECCjEW0ZJTSGZlLwnqH8A6mmxLxDrcE3HnCrkDpUjsfVGDznyPHKtUDE8-QEluCp5DiwQSWHqUhj"
          />
        }
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Đăng ký
            </div>
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold leading-tight text-slate-900">
                Tạo tài khoản mới
              </h1>
              <p className="text-sm leading-6 text-slate-500">
                Điền thông tin cơ bản để bắt đầu mua thuốc, đặt lịch tư vấn và
                quản lý hành trình chăm sóc sức khỏe của bạn.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <SignupForm
            onSubmit={handleSignup}
            onGoogleLogin={handleGoogleSignup}
            loading={loading}
            oauthLoading={oauthLoading}
          />
        </div>

        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/96 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.20)]">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 material-symbols-outlined text-2xl ${
                    modal.type === "success"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {modal.type === "success" ? "check_circle" : "error"}
                </span>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {modal.type === "success"
                      ? "Đăng ký thành công"
                      : "Đăng ký không thành công"}
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">
                    {modal.message}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  onClick={closeModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </AuthLayout>
    </motion.div>
  );
};

export default SignupPage;
