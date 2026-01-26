import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as appointmentApi from "../../api/appointmentApi";
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
    id: "video_call",
    title: "Video Call",
    desc: "Gặp mặt trực tuyến qua video",
    icon: "videocam",
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    iconText: "text-primary",
  },
  {
    id: "voice_call",
    title: "Voice Call",
    desc: "Trao đổi qua cuộc gọi thoại",
    icon: "call",
    iconBg: "bg-green-100 dark:bg-green-500/15",
    iconText: "text-green-600 dark:text-green-400",
  },
  {
    id: "chat",
    title: "Chat",
    desc: "Nhắn tin trực tiếp với dược sĩ",
    icon: "chat",
    iconBg: "bg-purple-100 dark:bg-purple-500/15",
    iconText: "text-purple-600 dark:text-purple-400",
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}
function formatLocalDateTime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:00`;
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}
function isPhone(v) {
  // đơn giản: nhận số VN 9–11 digits (bạn có thể siết chặt hơn tuỳ dự án)
  return /^[0-9]{9,11}$/.test(
    String(v || "")
      .trim()
      .replace(/\s/g, ""),
  );
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}) => {
  const hasValue = String(value || "").length > 0;

  return (
    <label className="group relative block">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "peer w-full h-12 rounded-xl border bg-white/70 dark:bg-slate-900/60",
          "border-slate-200 dark:border-slate-700",
          "px-4 pt-4 text-slate-900 dark:text-white",
          "placeholder:opacity-0",
          "outline-none transition-all",
          "focus:border-primary focus:ring-4 focus:ring-primary/15",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "",
        ].join(" ")}
      />
      <span
        className={[
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
          "text-slate-500 dark:text-slate-400 transition-all",
          "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary",
          hasValue
            ? "top-3 -translate-y-0 text-xs text-slate-600 dark:text-slate-300"
            : "",
        ].join(" ")}
      >
        {label}
      </span>

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-400/0 select-none">.</p>
      )}
    </label>
  );
};

const TextareaField = ({ label, value, onChange, placeholder, error }) => {
  const hasValue = String(value || "").length > 0;

  return (
    <label className="group relative block">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "peer w-full min-h-[120px] rounded-xl border bg-white/70 dark:bg-slate-900/60",
          "border-slate-200 dark:border-slate-700",
          "px-4 pt-6 pb-3 text-slate-900 dark:text-white",
          "placeholder:opacity-0",
          "outline-none transition-all resize-none",
          "focus:border-primary focus:ring-4 focus:ring-primary/15",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "",
        ].join(" ")}
      />
      <span
        className={[
          "pointer-events-none absolute left-4 top-5",
          "text-slate-500 dark:text-slate-400 transition-all",
          "peer-focus:text-xs peer-focus:text-primary peer-focus:-translate-y-2",
          hasValue
            ? "text-xs text-slate-600 dark:text-slate-300 -translate-y-2"
            : "",
        ].join(" ")}
      >
        {label}
      </span>

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-400/0 select-none">.</p>
      )}
    </label>
  );
};

const MethodCard = ({ option, checked, onChange }) => {
  return (
    <label className="relative cursor-pointer">
      <input
        className="peer sr-only"
        name="method"
        type="radio"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={[
          "h-full rounded-2xl border p-4 transition-all",
          "border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60",
          "hover:-translate-y-[1px] hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-950/40",
          "peer-checked:border-primary peer-checked:ring-4 peer-checked:ring-primary/10 peer-checked:bg-primary/5",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div
            className={[
              "size-11 rounded-2xl flex items-center justify-center",
              option.iconBg,
              option.iconText,
            ].join(" ")}
          >
            <span className="material-symbols-outlined">{option.icon}</span>
          </div>

          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white">
              {option.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {option.desc}
            </p>
          </div>

          <div className="text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>
      </div>
    </label>
  );
};

const BookingForm = ({ onBackToPharmacists, pharmacistId }) => {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState(DAYS[0].key);
  const [selectedTime, setSelectedTime] = useState("09:00");

  // FIX: default phải khớp option.id
  const [method, setMethod] = useState("video_call");

  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    contact: "",
    description: "",
  });

  const [dialog, setDialog] = useState({
    open: false,
    type: "success", // success | error | busy
    title: "",
    message: "",
  });

  const selectedDay = useMemo(
    () => DAYS.find((d) => d.key === selectedDayKey) ?? DAYS[0],
    [selectedDayKey],
  );

  const navigate = useNavigate();

  const validate = () => {
    const next = { fullName: "", contact: "", description: "" };

    if (!String(fullName || "").trim())
      next.fullName = "Vui lòng nhập họ và tên.";
    if (!String(contact || "").trim()) {
      next.contact = "Vui lòng nhập số điện thoại hoặc email.";
    } else if (!isEmail(contact) && !isPhone(contact)) {
      next.contact =
        "Thông tin liên hệ không hợp lệ (email hoặc số điện thoại).";
    }

    // mô tả không bắt buộc, nhưng nếu nhập thì nên tối thiểu vài ký tự cho “xịn”
    if (
      String(description || "").trim() &&
      String(description || "").trim().length < 10
    ) {
      next.description =
        "Mô tả hơi ngắn, bạn nhập thêm chi tiết (tối thiểu 10 ký tự).";
    }

    setErrors(next);
    return !next.fullName && !next.contact && !next.description;
  };

  const renderSlotButton = (slot, isSelected) => {
    const base =
      "py-2 px-1 rounded-xl text-sm font-semibold transition-all select-none";

    if (slot.disabled) {
      return (
        <button
          key={slot.time}
          type="button"
          disabled
          className={[
            base,
            "border border-slate-100 dark:border-slate-800",
            "bg-slate-50 dark:bg-slate-800/50",
            "text-slate-300 dark:text-slate-600 cursor-not-allowed",
          ].join(" ")}
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
          className={[
            base,
            "bg-primary text-white shadow-sm",
            "ring-4 ring-primary/20",
            "hover:brightness-[0.98]",
          ].join(" ")}
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
        className={[
          base,
          "border border-slate-200 dark:border-slate-700",
          "text-slate-700 dark:text-slate-200",
          "bg-white/60 dark:bg-slate-900/40",
          "hover:border-primary hover:text-primary hover:bg-primary/5",
          "hover:-translate-y-[1px]",
        ].join(" ")}
      >
        {slot.time}
      </button>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setDialog({
      open: true,
      type: "busy",
      title: "Đang xử lý...",
      message: "Vui lòng chờ trong giây lát.",
    });

    try {
      const rawUser = sessionStorage.getItem("authUser");
      if (!rawUser) throw new Error("Bạn cần đăng nhập để đặt lịch");
      const authUser = JSON.parse(rawUser || "{}");
      const userId = authUser?.id;
      if (!userId) throw new Error("Không tìm thấy userId trong session");

      if (!pharmacistId) {
        throw new Error("Không xác định dược sĩ để đặt lịch");
      }

      // build startAt using selectedDay.day and current month/year
      const now = new Date();
      const year = now.getFullYear();
      const monthIndex = now.getMonth();
      const dayOfMonth = selectedDay.day;
      const [hourStr, minuteStr] = selectedTime.split(":");
      const startDate = new Date(
        year,
        monthIndex,
        dayOfMonth,
        parseInt(hourStr, 10),
        parseInt(minuteStr, 10),
        0,
      );
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const payload = {
        userId,
        pharmacistId,
        startAt: formatLocalDateTime(startDate),
        endAt: formatLocalDateTime(endDate),
        channel: method.toUpperCase(),
        notes: description || undefined,
      };

      await appointmentApi.createAppointment(payload);

      setDialog({
        open: true,
        type: "success",
        title: "Đặt lịch thành công",
        message:
          "Bạn có thể quay lại danh sách dược sĩ hoặc tiếp tục đặt lịch khác.",
      });
    } catch (err) {
      const status = err?.status || (err?.response && err.response.status);
      const message =
        err?.message ||
        (err?.response && err.response.data?.message) ||
        "Lỗi khi đặt lịch";

      if (Number(status) === 409) {
        setDialog({
          open: true,
          type: "error",
          title: "Khung giờ không khả dụng",
          message:
            "Dược sĩ đang bận trong khung giờ này. Bạn vui lòng chọn giờ khác.",
        });
      } else {
        setDialog({
          open: true,
          type: "error",
          title: "Đặt lịch thất bại",
          message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !isSubmitting &&
    String(fullName || "").trim() &&
    String(contact || "").trim();

  const DialogIcon = ({ type }) => {
    if (type === "success")
      return (
        <div className="size-12 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">
            check_circle
          </span>
        </div>
      );
    if (type === "error")
      return (
        <div className="size-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
      );
    return (
      <div className="size-12 rounded-2xl bg-slate-500/10 text-slate-700 dark:text-slate-200 flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">
          hourglass_top
        </span>
      </div>
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={[
          "rounded-2xl overflow-hidden",
          "border border-slate-100 dark:border-slate-800",
          "bg-white dark:bg-slate-950",
          "shadow-sm",
        ].join(" ")}
      >
        {/* header gradient */}
        <div className="px-6 md:px-8 py-6 bg-gradient-to-r from-primary/10 via-sky-500/5 to-purple-500/10 dark:from-primary/10 dark:via-sky-500/10 dark:to-purple-500/10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Đặt lịch tư vấn với dược sĩ
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Chọn thời gian phù hợp và hình thức tư vấn bạn mong muốn.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToPharmacists}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Quay lại
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8">
          {/* 1) Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-7 rounded-full bg-primary text-white text-xs font-bold grid place-items-center">
                1
              </span>
              <h4 className="text-slate-900 dark:text-white text-lg font-extrabold">
                Thông tin cá nhân
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ tên đầy đủ"
                error={errors.fullName}
              />
              <Field
                label="Số điện thoại / Email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Nhập số điện thoại hoặc email"
                error={errors.contact}
              />
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 2) Date & time */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="size-7 rounded-full bg-primary text-white text-xs font-bold grid place-items-center">
                  2
                </span>
                <h4 className="text-slate-900 dark:text-white text-lg font-extrabold">
                  Thời gian tư vấn
                </h4>
              </div>

              {/* giữ UI điều hướng tháng cho đẹp (logic bạn có thể làm sau) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  aria-label="Previous month"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tháng 10, 2023
                </span>
                <button
                  type="button"
                  className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  aria-label="Next month"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* day pills */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-6 pb-2">
              {DAYS.map((day) => {
                const isSelected = day.key === selectedDayKey;

                const base =
                  "flex-none w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all";

                if (day.disabled) {
                  return (
                    <button
                      key={day.key}
                      type="button"
                      disabled
                      className={[
                        base,
                        "border border-slate-100 dark:border-slate-800",
                        "bg-slate-50 dark:bg-slate-900/40",
                        "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-70",
                      ].join(" ")}
                    >
                      <span className="text-xs font-semibold">{day.dow}</span>
                      <span className="text-xl font-extrabold">{day.day}</span>
                    </button>
                  );
                }

                if (isSelected) {
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDayKey(day.key)}
                      className={[
                        base,
                        "border border-primary bg-primary/5",
                        "ring-4 ring-primary/15",
                        "shadow-sm",
                      ].join(" ")}
                    >
                      <span className="text-xs font-semibold text-primary">
                        {day.dow}
                      </span>
                      <span className="text-xl font-extrabold text-primary">
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
                    className={[
                      base,
                      "border border-slate-200 dark:border-slate-700",
                      "bg-white/60 dark:bg-slate-900/40",
                      "hover:border-primary/50 hover:-translate-y-[1px]",
                      "text-slate-500 dark:text-slate-400",
                    ].join(" ")}
                  >
                    <span className="text-xs font-semibold hover:text-primary">
                      {day.dow}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {day.day}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-bold">
                Buổi sáng
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-5">
                {MORNING_SLOTS.map((slot) =>
                  renderSlotButton(slot, selectedTime === slot.time),
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-bold">
                Buổi chiều
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {AFTERNOON_SLOTS.map((slot) =>
                  renderSlotButton(slot, selectedTime === slot.time),
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 3) Method */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-7 rounded-full bg-primary text-white text-xs font-bold grid place-items-center">
                3
              </span>
              <h4 className="text-slate-900 dark:text-white text-lg font-extrabold">
                Hình thức tư vấn
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {METHOD_OPTIONS.map((option) => (
                <MethodCard
                  key={option.id}
                  option={option}
                  checked={method === option.id}
                  onChange={() => setMethod(option.id)}
                />
              ))}
            </div>
          </section>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* 4) Description */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="size-7 rounded-full bg-primary text-white text-xs font-bold grid place-items-center">
                4
              </span>
              <h4 className="text-slate-900 dark:text-white text-lg font-extrabold">
                Vấn đề sức khoẻ
              </h4>
            </div>

            <TextareaField
              label="Mô tả triệu chứng hoặc vấn đề cần hỗ trợ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Tôi bị đau đầu và sốt nhẹ từ tối hôm qua..."
              error={errors.description}
            />
          </section>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
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
              disabled={!canSubmit}
              className={[
                "w-full sm:w-auto h-12 min-w-[220px] rounded-xl px-6",
                "font-extrabold text-white",
                "bg-primary hover:brightness-[0.96] active:brightness-[0.94]",
                "transition-all",
                "shadow-lg shadow-primary/20",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100",
                "inline-flex items-center justify-center gap-2",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Đang đặt lịch...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận đặt lịch</span>
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Radix Dialog Popup */}
      <Dialog.Root
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            className={[
              "fixed inset-0 z-50",
              "bg-slate-950/40 backdrop-blur-[2px]",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            ].join(" ")}
          />
          <Dialog.Content
            className={[
              "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[92vw] max-w-md rounded-2xl",
              "border border-slate-200 dark:border-slate-800",
              "bg-white dark:bg-slate-950",
              "shadow-2xl shadow-slate-950/20",
              "p-5",
              "data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0",
              "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0",
            ].join(" ")}
          >
            <div className="flex items-start gap-4">
              <DialogIcon type={dialog.type} />

              <div className="flex-1">
                <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {dialog.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {dialog.message}
                </Dialog.Description>

                <div className="mt-5 flex gap-3 justify-end">
                  <Dialog.Close asChild>
                    <button
                      className={[
                        "h-10 px-4 rounded-xl font-bold",
                        "border border-slate-200 dark:border-slate-800",
                        "text-slate-700 dark:text-slate-200",
                        "hover:bg-slate-50 dark:hover:bg-slate-900",
                        "transition-colors",
                      ].join(" ")}
                    >
                      Đóng
                    </button>
                  </Dialog.Close>

                  {dialog.type === "success" ? (
                    <button
                      onClick={() => {
                        setDialog((d) => ({ ...d, open: false }));
                        navigate("/pharmacists");
                      }}
                      className={[
                        "h-10 px-4 rounded-xl font-extrabold text-white",
                        "bg-primary hover:brightness-[0.96] transition-all",
                      ].join(" ")}
                    >
                      Về danh sách
                    </button>
                  ) : null}
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default BookingForm;
