import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import ScheduleCalendar from "../../../components/admin/schedule/ScheduleCalendar";
import ScheduleList from "../../../components/admin/schedule/ScheduleList";

const appointmentsData = [
  {
    id: "ap-1",
    date: "2023-10-05",
    time: "09:00",
    period: "AM",
    customer: "Nguyen Van A",
    customerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr-dtwG5Yy6_17Un2hCpKjYQyU53XHKXdZ1zWkZZpz_8XJqIYrz48HXS2CiR025OGp9hvjD8EhRMs0RBdeMEKCy6ZHS3XpGJ3p-hHv1FahgvkWmqlxI99dK0iYPrcLgNwwS8dV85BDk3NDDFPXra-QQ1bx7S8BqeXAQ43R_qNG1l0Ph-ZOxG-WU6uLqx58piE5o5z91L3q-5OsFmQ8Z9CIC_pWTAUQGkSaQpl9KSaD2ecG4074XUxEdnKXv-lFJ0zYeRiCx-jm28eQ",
    pharmacist: "Dr. Le Thi Mai",
    topic: "Tư vấn đơn kê",
    status: "pending",
  },
  {
    id: "ap-2",
    date: "2023-10-05",
    time: "10:30",
    period: "AM",
    customer: "Tran Thi B",
    customerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBsIJlwld3wZDpm_ZKCSsBQnISNmgeg2a-uC-66fyfCxGLdg5p2r43cq8-oKSdPvA5ZoJ2PFWJMtEQMafPc_GI4143a11bJC3oguWq3Sf8BpOc_MQ7lDLcvibsKjIG57exjTMNIm4-7mVSHqXQLvWWtsr6teb4ZC9XS6etzXyHjG72kaRUJPuQQ8pNkk1uYkIe7ILyBjFZz1UYGjmvDLffeot79SAXmct3Jz6a0sPgGlEP6CBCdbOhFbpMO_BeajpQb7l4qxVlgTpmj",
    pharmacist: "Dr. Pham Minh",
    topic: "Tư vấn tiêm phòng",
    status: "confirmed",
  },
  {
    id: "ap-3",
    date: "2023-10-05",
    time: "16:00",
    period: "PM",
    customer: "Hoang D",
    customerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7h0-9D1Nk7D5dA3PoEYAA4O0J9LD--zUHISpCtqtart96_lcCYHFb-nbS5hxt3dNVZD8wtQMqFny0Jv4RaOKIe6npvBw-xsI4TkdqjlNq8wwWDJou1PnNCT1un7z620sXy0WhFGlIClV3t39eGJHFpf1z8CaGFwwiAmAH3xjvMJpTm_eNE4w2mbKG6rFrKRREG3RXwsYZm8UUtFG0abw4Gm9-58YHbmOeVKBVaKxXUv-1fn06Dz8LO7m7YFSmjr6O4OYdWUwdLdXm",
    pharmacist: "Dr. Pham Minh",
    topic: "Tổng quát",
    status: "completed",
  },
  {
    id: "ap-4",
    date: "2023-10-06",
    time: "14:00",
    period: "PM",
    customer: "Le Van C",
    customerAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB37tB-uOurFZZwF6qjBB9hIb8DXPInbY4gWJApHwqQwgwG47aB8EwXw0l0rGqXGc_Hoig3kHHjLDt3lu0ifocv8lRn_HnVv1dW-jz0SBYOLLnViEGYPAIXprpLvDyueioj-3mBGcl9v7C_NiWA5b4PcCsXNGJE76AYjQwtn8Q-M5BCsxiZO6EGnkWyDZtbweQCWDq_PIvhV7b-pttLTLCkHrMoQJuYYNLXWSgbZ0O76eW7kZ4mnk5p6WPw7MNMJf9URuW1umGGuVCs",
    pharmacist: "Dr. Le Thi Mai",
    topic: "Đổi thuốc",
    status: "cancelled",
  },
  {
    id: "ap-5",
    date: "2023-10-10",
    time: "10:00",
    period: "AM",
    customer: "Mai H",
    customerAvatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    pharmacist: "Dr. Ngo Thi F",
    topic: "Tư vấn vitamin",
    status: "confirmed",
  },
];

const buildSummary = (list) => {
  const map = {};
  list.forEach((item) => {
    if (!map[item.date])
      map[item.date] = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
    map[item.date].total += 1;
    map[item.date][item.status] = (map[item.date][item.status] || 0) + 1;
  });
  const sampleDate = list[0]?.date || "2023-10-01";
  const [year, month] = sampleDate.split("-");
  return { map, year, month };
};

const AdminSchedulePage = () => {
  const [appointments, setAppointments] = useState(appointmentsData);
  const summary = useMemo(() => buildSummary(appointments), [appointments]);
  const daysInMonth = 31;
  const [selectedDate, setSelectedDate] = useState(
    appointments[0]?.date || `${summary.year}-${summary.month}-01`
  );

  const listForDate = useMemo(
    () => appointments.filter((a) => a.date === selectedDate),
    [appointments, selectedDate]
  );

  const handleUpdateStatus = (id, status) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const monthLabel = useMemo(() => {
    const date = new Date(`${summary.year}-${summary.month}-01T00:00:00`);
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  }, [summary]);

  return (
    <AdminLayout activeKey="schedule">
      <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-slate-100 font-display transition-colors duration-200">
        <div className="flex flex-1 justify-center py-8 px-4 sm:px-10 lg:px-16">
          <div className="layout-content-container flex flex-col max-w-[1280px] flex-1 gap-6">
            <div className="flex flex-wrap gap-2 px-1 text-sm text-[#4c739a] dark:text-slate-400">
              <span>Home</span>
              <span className="text-[#4c739a] dark:text-slate-500">/</span>
              <span>Management</span>
              <span className="text-[#4c739a] dark:text-slate-500">/</span>
              <span className="text-[#0d141b] dark:text-slate-200">
                Schedule
              </span>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                  Quản lý lịch tư vấn
                </h1>
                <p className="text-sm text-[#4c739a] dark:text-slate-400">
                  Quản lý lịch hẹn, dược sĩ và khách hàng tư vấn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Thêm lịch hẹn sẽ được bổ sung")}
                className="flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                <span>Thêm lịch hẹn</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                <ScheduleCalendar
                  monthLabel={monthLabel}
                  daysInMonth={daysInMonth}
                  summary={summary}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h3 className="text-primary font-bold text-sm mb-2">
                    Tổng quan hôm nay
                  </h3>
                  <div className="flex justify-between items-center mb-1 text-sm text-slate-600 dark:text-slate-400">
                    <span>Tổng lịch hẹn</span>
                    <span className="font-bold text-[#0d141b] dark:text-white">
                      {summary.map[selectedDate]?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                    <span>Đã xác nhận</span>
                    <span className="font-bold text-[#0d141b] dark:text-white">
                      {summary.map[selectedDate]?.confirmed || 0}
                    </span>
                  </div>
                </div>
              </aside>
              <section className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Lịch hẹn ngày {selectedDate}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm text-[#4c739a] dark:text-slate-400 hover:text-primary flex items-center gap-1 font-medium"
                      onClick={() => alert("Bộ lọc nâng cao đang phát triển")}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        filter_list
                      </span>{" "}
                      Lọc
                    </button>
                    <button
                      type="button"
                      className="text-sm text-[#4c739a] dark:text-slate-400 hover:text-primary flex items-center gap-1 font-medium"
                      onClick={() => window.print()}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        print
                      </span>{" "}
                      In danh sách
                    </button>
                  </div>
                </div>
                <ScheduleList
                  appointments={listForDate}
                  onUpdateStatus={handleUpdateStatus}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedulePage;
