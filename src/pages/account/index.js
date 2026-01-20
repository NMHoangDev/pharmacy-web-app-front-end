import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AccountSidebar from "../../components/account/AccountSidebar";
import ProfileForm from "../../components/account/ProfileForm";

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

const navItems = [
  {
    key: "profile",
    label: "Thông tin cá nhân",
    icon: "person",
    to: "/account",
  },
  { key: "orders", label: "Lịch sử đơn hàng", icon: "inventory_2", to: "#" },
  {
    key: "consult",
    label: "Lịch tư vấn",
    icon: "calendar_month",
    badge: "2",
    to: "#",
  },
  { key: "password", label: "Đổi mật khẩu", icon: "lock", to: "#" },
  { key: "divider-1", type: "divider" },
  { key: "logout", label: "Đăng xuất", icon: "logout", to: "#" },
];

const AccountPage = () => {
  const [form, setForm] = useState(defaultProfile);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thông tin đã được lưu (demo)");
  };

  const handleCancel = () => {
    setForm(defaultProfile);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-slate-900 dark:text-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <AccountSidebar
            profile={form}
            navItems={navItems}
            activeKey="profile"
          />

          <main className="lg:col-span-9">
            <ProfileForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountPage;
