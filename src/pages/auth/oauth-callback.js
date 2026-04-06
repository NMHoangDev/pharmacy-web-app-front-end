import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthHero from "../../components/auth/AuthHero";
import { useAppContext } from "../../context/AppContext";
import { authApi, publicApi } from "../../api/httpClients";
import {
  clearPendingOidcState,
  exchangeOidcCodeForTokens,
} from "../../auth/keycloakOidc";
import { getRolesFromToken } from "../../auth/jwt";
import { getDefaultPathForRoles } from "../../auth/roleRedirect";

const OauthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAppContext();
  const [status, setStatus] = useState("Đang hoàn tất đăng nhập Google...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        throw new Error("Đăng nhập Google đã bị hủy hoặc bị từ chối.");
      }
      if (!code || !state) {
        throw new Error("Thiếu dữ liệu callback từ Keycloak.");
      }

      setStatus("Đang xác thực phiên đăng nhập...");
      const tokens = await exchangeOidcCodeForTokens({ code, state });
      if (!tokens.accessToken) {
        throw new Error("Không nhận được access token từ Keycloak.");
      }

      login({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      setStatus("Đang đồng bộ tài khoản và hồ sơ người dùng...");
      let me = {};
      try {
        const syncResponse = await authApi.post("/api/auth/social/sync");
        me = syncResponse?.data || {};
      } catch (syncErr) {
        console.warn("[OIDC] /api/auth/social/sync failed, fallback to /me", syncErr);
        const meResponse = await authApi.get("/api/auth/me");
        me = meResponse?.data || {};

        if (me?.userId && me?.email) {
          try {
            await authApi.put(`/api/users/${me.userId}`, {
              email: me.email,
              phone: me.phone || "",
              fullName: me.fullName || me.email,
              avatarBase64: null,
            });
          } catch (userSyncErr) {
            console.warn("[OIDC] Failed to sync user profile fallback", userSyncErr);
          }
        }
      }

      let finalAccessToken = tokens.accessToken;
      let finalRefreshToken = tokens.refreshToken;
      if (tokens.refreshToken) {
        try {
          setStatus("Đang làm mới phiên để cập nhật quyền truy cập...");
          const refreshResponse = await publicApi.post("/api/auth/refresh", {
            refreshToken: tokens.refreshToken,
          });
          const refreshed = refreshResponse?.data || {};
          if (refreshed?.token) {
            finalAccessToken = refreshed.token;
          }
          if (refreshed?.refreshToken) {
            finalRefreshToken = refreshed.refreshToken;
          }
        } catch (refreshErr) {
          console.warn("[OIDC] Failed to refresh token after social sync", refreshErr);
        }
      }

      login({
        token: finalAccessToken,
        refreshToken: finalRefreshToken,
        userId: me.userId,
        email: me.email,
        fullName: me.fullName,
        phone: me.phone,
      });

      clearPendingOidcState();
      if (active) {
        navigate(getDefaultPathForRoles(getRolesFromToken(finalAccessToken)), {
          replace: true,
        });
      }
    };

    run().catch((err) => {
      clearPendingOidcState();
      if (!active) return;
      setError(err.message || "Không thể đăng nhập với Google.");
      setStatus("");
    });

    return () => {
      active = false;
    };
  }, [login, navigate, searchParams]);

  return (
    <AuthLayout
      brand="Pharmacy Plus"
      formMaxWidth="max-w-[440px]"
      hero={
        <AuthHero
          title="Đang kết nối tài khoản của bạn với hệ thống Pharmacy Plus."
          subtitle="Chúng tôi đang xác thực phiên đăng nhập từ Google qua Keycloak và đồng bộ hồ sơ để bạn có thể tiếp tục sử dụng ứng dụng."
          metricValue="OIDC"
          metricLabel="Authorization Code Flow"
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuAb4nU7JSfanOGoyEObMQx7IXUMDlIW8wegLETolmtxgaeRB-_cv2yBoqXfm3CNz2cXGi-uX9RRE9hgy-n9zYygrVUKTEDT2IXKWd9NVQeJ6hLYeWIcL7Ndz4TxNo9VNl_ctM0VS8Kq4EKmv1PEleOrjHxiPOCTVDMEylZX6eTd_fglHkRW0uZYUCrKk5CNq5XtsNHOXlXv9au6Py3XmzYpI0P_3_QoXBbazZZbXUiwlh2OKslN8SFNNgwaj2mfNPKt-Fkq0OsTZDJ_"
          highlights={[
            "Access token và refresh token được lấy trực tiếp từ Keycloak.",
            "Spring Boot sẽ xác thực Bearer token bằng issuer và JWKs của Keycloak.",
            "Hồ sơ local sẽ được đồng bộ để app hoạt động đầy đủ ngay sau đăng nhập.",
          ]}
        />
      }
    >
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Google Sign-In
        </div>
        <h1 className="text-[28px] font-bold text-slate-900">
          Hoàn tất đăng nhập
        </h1>
        {status && (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-4 text-sm text-sky-800">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 rounded-full border-2 border-sky-300 border-t-sky-700 animate-spin" />
              <span>{status}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-4 text-sm text-red-600">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="rounded-xl bg-white px-4 py-2 font-semibold text-red-600 ring-1 ring-red-200 transition-colors duration-200 hover:bg-red-50"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default OauthCallbackPage;
