import React, { useMemo, useState } from "react";
import "./scrollbar.css";

const DAYS = [
  { key: "t2", dow: "T2", day: 23, disabled: false },
  { key: "t3", dow: "T3", day: 24, disabled: false },
  { key: "t4", dow: "T4", day: 25, disabled: false },
  { key: "t5", dow: "T5", day: 26, disabled: false },
  { key: "t6", dow: "T6", day: 27, disabled: false },
  { key: "t7", dow: "T7", day: 28, disabled: true },
];

const MORNING_SLOTS = [
  { time: "08:00", disabled: false },
  { time: "08:30", disabled: false },
  { time: "09:00", disabled: false },
  { time: "09:30", disabled: false },
  { time: "10:00", disabled: true },
  { time: "10:30", disabled: true },
];

const AFTERNOON_SLOTS = [
  { time: "13:30", disabled: false },
  { time: "14:00", disabled: false },
  { time: "14:30", disabled: false },
  { time: "15:00", disabled: false },
  { time: "15:30", disabled: false },
  { time: "16:00", disabled: false },
];

const METHOD_OPTIONS = [
  {
    id: "video",
    title: "Video Call",
    desc: "Gặp mặt trực tuyến qua video",
    icon: "videocam",
    iconBg: "bg-blue-100",
    iconText: "text-primary",
  },
  {
    id: "voice",
    title: "Voice Call",
    desc: "Trao đổi qua cuộc gọi thoại",
    icon: "call",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
  },
  {
    id: "chat",
    title: "Chat",
    desc: "Nhắn tin trực tiếp với dược sĩ",
    icon: "chat",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
  },
];

const BookingForm = ({ onBackToPharmacists }) => {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState(DAYS[0].key);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [method, setMethod] = useState("video");
  const [description, setDescription] = useState("");

  const selectedDay = useMemo(
    () => DAYS.find((d) => d.key === selectedDayKey) ?? DAYS[0],
    [selectedDayKey]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    // Spec doesn't require an API call yet.
    // Keep as a safe placeholder until backend exists.
    // eslint-disable-next-line no-alert
    alert(
      `Đã nhận yêu cầu đặt lịch:\n- Họ tên: ${fullName}\n- Liên hệ: ${contact}\n- Ngày: ${selectedDay.dow} ${selectedDay.day}\n- Giờ: ${selectedTime}\n- Hình thức: ${method}`
    );
  };

  const renderSlotButton = (slot, isSelected) => {
    const base = "py-2 px-1 rounded-lg text-sm font-medium transition-all";

    if (slot.disabled) {
      return (
        <button
          key={slot.time}
          type="button"
          disabled
          className={`${base} border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed`}
        >
          {slot.time}
        </button>
      );
    }

    if (isSelected) {
      return (
        <button
          key={slot.time}
          type="button"
          onClick={() => setSelectedTime(slot.time)}
          className={`${base} bg-primary text-white shadow-sm ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900`}
        >
          {slot.time}
        </button>
      );
    }

    return (
      <button
        key={slot.time}
        type="button"
        onClick={() => setSelectedTime(slot.time)}
        className={`${base} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-primary/5`}
      >
        {slot.time}
      </button>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-6 md:p-8 flex flex-col gap-8">
        {/* Section: Info */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h4 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
                1
              </span>
              Thông tin cá nhân
            </h4>
            <button
              type="button"
              onClick={onBackToPharmacists}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Quay lại danh sách dược sĩ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
                Họ và tên
              </p>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all"
                placeholder="Nhập họ tên đầy đủ"
              />
            </label>
            <label className="flex flex-col flex-1">
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
                Số điện thoại / Email
              </p>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all"
                placeholder="Nhập số điện thoại hoặc email"
              />
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

        {/* Section: Date & Time */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
                2
              </span>
              Thời gian tư vấn
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Tháng 10, 2023
              </span>
              <button
                type="button"
                className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-6 pb-2">
            {DAYS.map((day) => {
              const isSelected = day.key === selectedDayKey;
              const base =
                "flex-none w-16 h-20 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all";

              if (day.disabled) {
                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled
                    className={`${base} border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-300 dark:text-slate-600 opacity-60`}
                  >
                    <span className="text-xs font-medium">{day.dow}</span>
                    <span className="text-xl font-bold">{day.day}</span>
                  </button>
                );
              }

              if (isSelected) {
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedDayKey(day.key)}
                    className={`${base} border border-primary bg-primary/5 shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900`}
                  >
                    <span className="text-xs font-medium text-primary">
                      {day.dow}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {day.day}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`${base} border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 text-slate-500 dark:text-slate-400 group`}
                >
                  <span className="text-xs font-medium group-hover:text-primary transition-colors">
                    {day.dow}
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {day.day}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">
            Buổi sáng
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
            {MORNING_SLOTS.map((slot) =>
              renderSlotButton(slot, selectedTime === slot.time)
            )}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">
            Buổi chiều
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {AFTERNOON_SLOTS.map((slot) =>
              renderSlotButton(slot, selectedTime === slot.time)
            )}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

        {/* Section: Method */}
        <div>
          <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
              3
            </span>
            Hình thức tư vấn
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {METHOD_OPTIONS.map((option) => {
              const checked = method === option.id;
              return (
                <label key={option.id} className="cursor-pointer relative">
                  <input
                    className="peer sr-only"
                    name="method"
                    type="radio"
                    checked={checked}
                    onChange={() => setMethod(option.id)}
                  />
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all flex flex-col gap-3 h-full">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center ${option.iconBg} ${option.iconText}`}
                    >
                      <span className="material-symbols-outlined">
                        {option.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {option.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {option.desc}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined fill-current">
                        check_circle
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

        {/* Section: Description */}
        <div>
          <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">
              4
            </span>
            Vấn đề sức khoẻ
          </h4>

          <label className="flex flex-col flex-1">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
              Mô tả triệu chứng hoặc vấn đề cần hỗ trợ
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary min-h-[120px] placeholder:text-slate-400 p-4 text-base font-normal leading-normal transition-all"
              placeholder="Ví dụ: Tôi bị đau đầu và sốt nhẹ từ tối hôm qua..."
            />
          </label>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bằng việc đặt lịch, bạn đồng ý với{" "}
              <a className="text-primary hover:underline" href="#">
                Điều khoản dịch vụ
              </a>
            </p>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto h-12 min-w-[200px] bg-primary hover:bg-blue-600 text-white font-bold rounded-lg px-6 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <span>Xác nhận đặt lịch</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;
