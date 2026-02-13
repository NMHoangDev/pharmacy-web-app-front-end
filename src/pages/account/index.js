import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AccountSidebar from "../../components/account/AccountSidebar";
import ProfileForm from "../../components/account/ProfileForm";
import { useAppContext } from "../../context/AppContext";
import api from "../../api/client";
import apiClient from "../../api/apiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const defaultProfile = {
  name: "Nguyễn Văn A",
  membership: "Thành viên Bạc",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA_EezwnfLzBKww4BRIH1s-vBwjAFYY3cG6-9kFErXXeS-uW-okTFRp8Paz5sL8K1R12wbV03911lKC_SJzGdRvrJohSGl1YI4UuyDMejsk-X6AUw502W9qyUxnoibiY-rZaxN15pJUVD0nbkA-PQMbPUfDvxE_5j0k2vkUOiELYnLBpC1dYUaVDl7ktj4vKRRNH0luqCYHrk8UBKS5OnrpOuomlib3FdY1f9g3deyHUMlz4w-xRQ1s72FKn2C7cbyYxAYj1nf2bPI_",
  fullName: "Nguyễn Văn A",
  phone: "0987 654 321",
  email: "nguyenvana@example.com",
  gender: "male",
  dob: "1995-05-15",
  address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
};

const AccountPage = () => {
  const { authToken, authUser, logout, profile, setProfile } = useAppContext();
  const [form, setForm] = useState(defaultProfile);
  const [activeKey, setActiveKey] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successDialog, setSuccessDialog] = useState({
    open: false,
    message: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState("");
  const API_BASE_URL = useMemo(
    () => process.env.REACT_APP_API_BASE_URL || "http://localhost:8087",
    [],
  );

  const avatarPreview = useMemo(() => {
    const value =
      form.avatarUrl || profile?.avatarBase64 || defaultProfile.avatarUrl;
    if (!value) return "";
    if (value.startsWith("data:") || value.startsWith("http")) {
      return value;
    }
    return `data:image/png;base64,${value}`;
  }, [form.avatarUrl, profile?.avatarBase64]);

  useEffect(() => {
    if (!authUser?.id || !authToken) return;
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.getUser(authUser.id);
        const merged = {
          ...defaultProfile,
          name: data.fullName || defaultProfile.name,
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          avatarUrl: data.avatarBase64 || "",
        };
        setForm(merged);
        setProfile(data);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [API_BASE_URL, authToken, authUser?.id, setProfile]);

  useEffect(() => {
    if (activeKey !== "orders" || !authUser?.id || !authToken) return;
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listOrdersByUser(authUser.id);
        setOrders(data || []);
      } catch (err) {
        setError(err.message || "Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [API_BASE_URL, activeKey, authToken, authUser?.id]);

  useEffect(() => {
    if (activeKey !== "consult" || !authUser?.id || !authToken) return;
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get(
          `/api/appointments/user/${authUser.id}?page=0&size=20`,
        );
        const data = res.data || {};
        setAppointments(data?.content || []);
      } catch (err) {
        setError(err.message || "Không thể tải lịch tư vấn");
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [API_BASE_URL, activeKey, authToken, authUser?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("Ảnh vượt quá 1MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setForm((prev) => ({ ...prev, avatarUrl: result }));
      if (profile) {
        setProfile({ ...profile, avatarBase64: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser?.id || !authToken) {
      setError("Bạn cần đăng nhập để lưu thay đổi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rawAvatar = form.avatarUrl || "";
      const avatarBase64 = rawAvatar.startsWith("data:")
        ? rawAvatar.split(",")[1] || ""
        : rawAvatar.startsWith("http")
          ? ""
          : rawAvatar;
      const payload = {
        email: form.email,
        phone: form.phone,
        fullName: form.fullName,
        avatarBase64,
      };
      const data = await api.updateUser(authUser.id, payload);
      setProfile(data);
      setForm((prev) => ({
        ...prev,
        name: data.fullName || prev.name,
        avatarUrl: data.avatarBase64 || prev.avatarUrl,
      }));
      setSuccessDialog({ open: true, message: "Lưu thay đổi thành công." });
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm((prev) => ({
      ...defaultProfile,
      ...prev,
      avatarUrl: profile?.avatarBase64 || prev.avatarUrl,
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus("");
    if (!authUser?.id || !authToken) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("Mật khẩu mới không khớp.");
      return;
    }
    try {
      const res = await apiClient.post(`/api/auth/change-password`, {
        userId: authUser.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (!res || res.status >= 400) {
        throw new Error("Không thể đổi mật khẩu");
      }
      setPasswordStatus("Đổi mật khẩu thành công.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordStatus(err.message || "Không thể đổi mật khẩu");
    }
  };

  const navItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: "person",
      onClick: () => setActiveKey("profile"),
    },
    {
      key: "orders",
      label: "Lịch sử đơn hàng",
      icon: "inventory_2",
      onClick: () => setActiveKey("orders"),
    },
    {
      key: "consult",
      label: "Lịch tư vấn",
      icon: "calendar_month",
      badge: appointments.length ? String(appointments.length) : undefined,
      onClick: () => setActiveKey("consult"),
    },
    {
      key: "password",
      label: "Đổi mật khẩu",
      icon: "lock",
      onClick: () => setActiveKey("password"),
    },
    { key: "divider-1", type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: "logout",
      onClick: logout,
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-slate-900 dark:text-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <AccountSidebar
            profile={{
              ...form,
              avatarUrl: avatarPreview,
              name: form.fullName || form.name,
            }}
            navItems={navItems}
            activeKey={activeKey}
          />

          <main className="lg:col-span-9">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {activeKey === "profile" && (
              <ProfileForm
                form={{ ...form, avatarUrl: avatarPreview }}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onAvatarChange={handleAvatarChange}
              />
            )}
            {activeKey === "orders" && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Lịch sử đơn hàng</h2>
                {loading ? (
                  <p className="text-sm text-slate-500">Đang tải...</p>
                ) : orders.length ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Mã đơn</p>
                            <p className="font-semibold">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Trạng thái</p>
                            <p className="font-semibold text-primary">
                              {order.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Tổng tiền</p>
                            <p className="font-semibold text-emerald-600">
                              {order.totalAmount?.toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-600">
                          {order.items?.map((item) => (
                            <div
                              key={item.productId}
                              className="flex justify-between"
                            >
                              <span>{item.productName}</span>
                              <span>
                                x{item.quantity} ·{" "}
                                {item.unitPrice?.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chưa có đơn hàng nào.
                  </p>
                )}
              </div>
            )}
            {activeKey === "consult" && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Lịch tư vấn</h2>
                {loading ? (
                  <p className="text-sm text-slate-500">Đang tải...</p>
                ) : appointments.length ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Ngày hẹn</p>
                            <p className="font-semibold">
                              {appointment.startAt || "Chưa xác định"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Trạng thái</p>
                            <p className="font-semibold text-primary">
                              {appointment.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Dược sĩ</p>
                            <p className="font-semibold">
                              {appointment.pharmacistId}
                            </p>
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="mt-3 text-sm text-slate-600">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Chưa có lịch tư vấn.</p>
                )}
              </div>
            )}
            {activeKey === "password" && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Đổi mật khẩu</h2>
                <form
                  className="space-y-4 max-w-md"
                  onSubmit={handlePasswordChange}
                >
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">
                      Mật khẩu hiện tại
                    </span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Mật khẩu mới</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">
                      Xác nhận mật khẩu mới
                    </span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                    />
                  </label>
                  {passwordStatus && (
                    <div className="text-sm text-slate-600">
                      {passwordStatus}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium"
                  >
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />

      <Dialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Lưu thành công</DialogTitle>
            <DialogDescription>{successDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold"
              onClick={() => setSuccessDialog({ open: false, message: "" })}
            >
              Đóng
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountPage;
