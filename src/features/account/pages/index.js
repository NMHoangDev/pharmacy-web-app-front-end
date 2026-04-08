import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/components/layout/Header";
import Footer from "../../../shared/components/layout/Footer";
import AccountSidebar from "../components/AccountSidebar";
import ProfileForm from "../components/ProfileForm";
import { useAppContext } from "../../../app/contexts/AppContext";
import { authApi } from "../../../shared/api/httpClients";
import { getQuestionBySlug, getUserQuestions } from "../../content/api/contentApi";
import { listOrders } from "../../orders/api/orderApi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import AppointmentList from "../components/AppointmentList";

const orderStatusLabelMap = {
  DRAFT: "Chờ xác nhận",
  PENDING_PAYMENT: "Chờ xác nhận",
  PLACED: "Chờ xác nhận",
  CONFIRMED: "Đang xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Đã hoàn thành",
  CANCELED: "Đã hủy",
};

const paymentStatusLabelMap = {
  INIT: "Chưa thanh toán",
  PENDING: "Chưa thanh toán",
  UNPAID: "Chưa thanh toán",
  FAILED: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã thanh toán",
};

const toOrderStatusLabel = (status) =>
  orderStatusLabelMap[String(status || "").toUpperCase()] ||
  String(status || "Đang cập nhật");

const toPaymentStatusLabel = (status) =>
  paymentStatusLabelMap[String(status || "").toUpperCase()] ||
  String(status || "Đang cập nhật");

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
  const location = useLocation();
  const navigate = useNavigate();
  const queryTab = new URLSearchParams(location.search).get("tab");
  const { accessToken, authUser, userId, logout, profile, setProfile } =
    useAppContext();
  const currentUserId = userId || authUser?.id;
  const [form, setForm] = useState(defaultProfile);
  const [activeKey, setActiveKey] = useState(
    location.state?.activeTab || queryTab || "profile",
  );
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionPagination, setQuestionPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [answerDialog, setAnswerDialog] = useState({
    open: false,
    question: null,
    answers: [],
    pagination: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: "",
  });
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

  useEffect(() => {
    const nextTab = location.state?.activeTab || queryTab;
    if (nextTab) {
      setActiveKey(nextTab);
    }
  }, [location.state, queryTab]);

  useEffect(() => {
    if (location.state?.paymentResult !== "success") return;
    setSuccessDialog({
      open: true,
      message:
        location.state?.paymentMessage ||
        "Thanh toán thành công. Đơn hàng đã được cập nhật trong lịch sử mua hàng.",
    });
    navigate(location.pathname + location.search, {
      replace: true,
      state: { activeTab: location.state?.activeTab || queryTab || "orders" },
    });
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
    queryTab,
  ]);

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
    if (!currentUserId || !accessToken) return;
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authApi.get(`/api/users/${currentUserId}`);
        const data = res.data;
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
  }, [API_BASE_URL, accessToken, currentUserId, setProfile]);

  useEffect(() => {
    if (activeKey !== "orders" || !currentUserId || !accessToken) return;
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listOrders(currentUserId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [API_BASE_URL, activeKey, accessToken, currentUserId]);

  useEffect(() => {
    if (activeKey !== "consult" || !currentUserId || !accessToken) return;
    const loadAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authApi.get(
          `/api/appointments/user/${currentUserId}?page=0&size=20`,
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
  }, [API_BASE_URL, activeKey, accessToken, currentUserId]);

  useEffect(() => {
    if (activeKey !== "questions" || !currentUserId || !accessToken) return;
    const loadQuestions = async () => {
      setQuestionLoading(true);
      setError("");
      try {
        const data = await getUserQuestions(currentUserId, {
          page: questionPagination.page,
          pageSize: questionPagination.pageSize,
          sortBy: "createdAt",
          sortDir: "desc",
        });
        setMyQuestions(data.items || []);
        setQuestionPagination(
          data.pagination || { page: 1, pageSize: 10, total: 0 },
        );
      } catch (err) {
        setError(err.message || "Không thể tải câu hỏi của bạn");
      } finally {
        setQuestionLoading(false);
      }
    };
    loadQuestions();
  }, [
    activeKey,
    accessToken,
    currentUserId,
    questionPagination.page,
    questionPagination.pageSize,
  ]);

  const openAnswerDialog = async (question) => {
    if (!question?.slug) return;
    setAnswerDialog({
      open: true,
      question,
      answers: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
      loading: true,
      error: "",
    });
    try {
      const data = await getQuestionBySlug(question.slug, {
        answerPage: 1,
        answerPageSize: 10,
        sortAnswersBy: "newest",
      });
      const pageData = data?.answers || { items: [], pagination: null };
      setAnswerDialog((prev) => ({
        ...prev,
        question: data,
        answers: pageData.items || [],
        pagination: pageData.pagination || { page: 1, pageSize: 10, total: 0 },
        loading: false,
      }));
    } catch (err) {
      setAnswerDialog((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Không thể tải câu trả lời",
      }));
    }
  };

  const loadMoreAnswers = async () => {
    if (!answerDialog.question?.slug || answerDialog.loading) return;
    const nextPage = (answerDialog.pagination?.page || 1) + 1;
    setAnswerDialog((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getQuestionBySlug(answerDialog.question.slug, {
        answerPage: nextPage,
        answerPageSize: answerDialog.pagination?.pageSize || 10,
        sortAnswersBy: "newest",
      });
      const pageData = data?.answers || { items: [], pagination: null };
      setAnswerDialog((prev) => ({
        ...prev,
        answers: [...prev.answers, ...(pageData.items || [])],
        pagination: pageData.pagination || prev.pagination,
        loading: false,
      }));
    } catch (err) {
      setAnswerDialog((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Không thể tải thêm câu trả lời",
      }));
    }
  };

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
    if (!currentUserId || !accessToken) {
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
      const res = await authApi.put(`/api/users/${currentUserId}`, payload);
      const data = res.data;
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
    if (!currentUserId || !accessToken) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("Mật khẩu mới không khớp.");
      return;
    }
    try {
      const res = await authApi.post(`/api/auth/change-password`, {
        userId: currentUserId,
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
      key: "questions",
      label: "Câu hỏi của tôi",
      icon: "forum",
      onClick: () => setActiveKey("questions"),
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
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/order-detail/${order.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(`/order-detail/${order.id}`);
                          }
                        }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Mã đơn</p>
                            <p className="font-semibold">
                              {order.orderCode || order.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Trạng thái</p>
                            <p className="font-semibold text-primary">
                              {toOrderStatusLabel(order.status)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Thanh toán: {toPaymentStatusLabel(order.paymentStatus)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Tổng tiền</p>
                            <p className="font-semibold text-emerald-600">
                              {order.totalAmount?.toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/order-detail/${order.id}`);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            Xem chi tiết
                          </button>
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
                <AppointmentList
                  appointments={appointments}
                  loading={loading}
                />
              </div>
            )}
            {activeKey === "questions" && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Câu hỏi của tôi</h2>
                  <span className="text-sm text-slate-500">
                    {questionPagination.total || 0} câu hỏi
                  </span>
                </div>
                {questionLoading ? (
                  <p className="text-sm text-slate-500">Đang tải...</p>
                ) : myQuestions.length ? (
                  <div className="space-y-3">
                    {myQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {q.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {q.createdAt
                                ? new Date(q.createdAt).toLocaleString("vi-VN")
                                : ""}
                              {q.moderationStatus && (
                                <span className="ml-2 uppercase">
                                  · {q.moderationStatus}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                              {q.answerCount} trả lời
                            </span>
                            <button
                              type="button"
                              onClick={() => openAnswerDialog(q)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              Xem tất cả trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Bạn chưa đặt câu hỏi nào.
                  </p>
                )}

                <div className="flex items-center justify-center pt-4">
                  <nav className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      onClick={() =>
                        setQuestionPagination((p) => ({
                          ...p,
                          page: Math.max(1, p.page - 1),
                        }))
                      }
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 bg-primary text-white font-bold rounded-lg shadow-md shadow-primary/20"
                    >
                      {questionPagination.page}
                    </button>
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      onClick={() =>
                        setQuestionPagination((p) => ({
                          ...p,
                          page: p.page + 1,
                        }))
                      }
                    >
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </nav>
                </div>
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
            <DialogTitle>Thành công</DialogTitle><DialogDescription>{successDialog.message}</DialogDescription>
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

      <Dialog
        open={answerDialog.open}
        onOpenChange={(open) =>
          setAnswerDialog((prev) => ({ ...prev, open, error: "" }))
        }
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thành công</DialogTitle><DialogDescription>
              {answerDialog.question?.createdAt
                ? new Date(answerDialog.question.createdAt).toLocaleString(
                    "vi-VN",
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {answerDialog.question?.content}
            </div>
            {answerDialog.error ? (
              <div className="text-sm text-rose-500">{answerDialog.error}</div>
            ) : null}
            {answerDialog.answers.length ? (
              <div className="space-y-3">
                {answerDialog.answers.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {a.author?.displayName || "Ẩn danh"}
                        </p>
                        <span className="text-xs text-slate-400">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {a.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Chưa có câu trả lời.</p>
            )}
            {answerDialog.pagination?.total > answerDialog.answers.length ? (
              <button
                type="button"
                onClick={loadMoreAnswers}
                disabled={answerDialog.loading}
                className="w-full py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg"
              >
                {answerDialog.loading ? "Đang tải..." : "Xem thêm"}
              </button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountPage;

