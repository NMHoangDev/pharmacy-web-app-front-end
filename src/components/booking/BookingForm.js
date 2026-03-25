import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import * as appointmentApi from "../../api/appointmentApi";
import useNotificationAction from "../../hooks/useNotificationAction";
import "./scrollbar.css";

const MORNING_SLOTS = [
  { time: "08:00", disabled: false },
  { time: "08:30", disabled: false },
  { time: "09:00", disabled: false },
  { time: "09:30", disabled: false },
  { time: "10:00", disabled: false },
  { time: "10:30", disabled: false },
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
    title: "Video call",
    desc: "Tư vấn qua video trực tuyến",
    icon: "videocam",
  },
  {
    id: "voice_call",
    title: "Voice call",
    desc: "Tư vấn qua cuộc gọi thoại",
    icon: "call",
  },
  {
    id: "chat",
    title: "Chat",
    desc: "Tư vấn qua nhắn tin",
    icon: "chat",
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
  return /^[0-9]{9,11}$/.test(
    String(v || "")
      .trim()
      .replace(/\s/g, ""),
  );
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function formatDow(d) {
  const map = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return map[d.getDay()];
}

function formatMonthYear(d) {
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

const Section = ({ step, title, children }) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
        {step}
      </span>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}) => {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "h-11 w-full rounded-lg border px-3 text-sm",
          "bg-white text-slate-900 placeholder:text-slate-400",
          "outline-none focus:ring-2 focus:ring-blue-100",
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-blue-400",
        ].join(" ")}
      />
    </label>
  );
};

const TextareaField = ({ label, value, onChange, placeholder, error }) => {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          "min-h-[120px] w-full rounded-lg border px-3 py-2.5 text-sm",
          "bg-white text-slate-900 placeholder:text-slate-400",
          "outline-none focus:ring-2 focus:ring-blue-100 resize-none",
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-blue-400",
        ].join(" ")}
      />
    </label>
  );
};

const MethodCard = ({ option, checked, onChange }) => {
  return (
    <label className="cursor-pointer">
      <input
        className="sr-only"
        name="method"
        type="radio"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={[
          "h-full rounded-lg border p-3 transition-colors",
          checked
            ? "border-blue-300 bg-blue-50"
            : "border-slate-200 bg-white hover:bg-slate-50",
        ].join(" ")}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={[
              "material-symbols-outlined text-[18px] mt-0.5",
              checked ? "text-blue-700" : "text-slate-500",
            ].join(" ")}
          >
            {option.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {option.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{option.desc}</p>
          </div>
        </div>
      </div>
    </label>
  );
};

const BookingForm = ({ onBackToPharmacists, pharmacistId }) => {
  const navigate = useNavigate();
  const { notifyAfterSuccess } = useNotificationAction();

  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");

  const today = useMemo(() => startOfDay(new Date()), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateISO, setSelectedDateISO] = useState(
    today.toISOString().slice(0, 10),
  );

  const [selectedTime, setSelectedTime] = useState("09:00");
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
    type: "success",
    title: "",
    message: "",
  });

  const days = useMemo(() => {
    const base = addDays(today, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(base, i);
      const iso = date.toISOString().slice(0, 10);
      const disabled = date < today;
      return {
        key: iso,
        iso,
        date,
        dow: formatDow(date),
        day: date.getDate(),
        disabled,
      };
    });
  }, [today, weekOffset]);

  const selectedDay = useMemo(() => {
    return days.find((d) => d.iso === selectedDateISO) ?? days[0];
  }, [days, selectedDateISO]);

  const monthLabel = useMemo(() => {
    return formatMonthYear(days[0]?.date ?? today);
  }, [days, today]);

  const canGoPrev = weekOffset > 0;

  const validate = () => {
    const next = { fullName: "", contact: "", description: "" };

    if (!String(fullName || "").trim()) {
      next.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!String(contact || "").trim()) {
      next.contact = "Vui lòng nhập số điện thoại hoặc email.";
    } else if (!isEmail(contact) && !isPhone(contact)) {
      next.contact =
        "Thông tin liên hệ không hợp lệ (email hoặc số điện thoại).";
    }

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
    const now = new Date();
    const bufferMinutes = 10;

    const isToday = isSameDay(selectedDay.date, now);
    const slotIsPast =
      isToday &&
      toMinutes(slot.time) <=
        now.getHours() * 60 + now.getMinutes() + bufferMinutes;

    const disabled = Boolean(slot.disabled) || slotIsPast;

    if (disabled) {
      return (
        <button
          key={slot.time}
          type="button"
          disabled
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-medium text-slate-300"
          title={slotIsPast ? "Giờ này đã qua" : "Không khả dụng"}
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
          "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
          isSelected
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
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
      if (!pharmacistId) throw new Error("Không xác định dược sĩ để đặt lịch");

      const [hourStr, minuteStr] = selectedTime.split(":");
      const startDate = new Date(selectedDay.date);
      startDate.setHours(parseInt(hourStr, 10), parseInt(minuteStr, 10), 0, 0);

      if (startDate.getTime() < Date.now()) {
        throw new Error("Bạn không thể chọn thời gian trong quá khứ.");
      }

      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const payload = {
        userId,
        pharmacistId,
        startAt: formatLocalDateTime(startDate),
        endAt: formatLocalDateTime(endDate),
        channel: method.toUpperCase(),
        notes: description || undefined,
      };

      await notifyAfterSuccess({
        action: () => appointmentApi.createAppointment(payload),
        notificationPayload: (createdAppointment) => ({
          category: "APPOINTMENT",
          title: "Đặt cuộc hẹn thành công",
          message: "Bạn đã đặt cuộc hẹn thành công",
          sourceType: "APPOINTMENT",
          sourceId: String(createdAppointment?.id || ""),
          sourceEventType: "APPOINTMENT_CREATED",
          actionUrl: "/appointments",
        }),
        options: {
          silent: false,
          errorMessage:
            "Failed to create notification after create appointment:",
        },
      });

      setDialog({
        open: true,
        type: "success",
        title: "Đặt lịch thành công",
        message:
          "Bạn có thể quay lại danh sách dược sĩ hoặc tiếp tục đặt lịch khác.",
      });
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const message =
        err?.message || err?.response?.data?.message || "Lỗi khi đặt lịch";

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
    if (type === "success") {
      return (
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <span className="material-symbols-outlined text-[22px]">
            check_circle
          </span>
        </div>
      );
    }

    if (type === "error") {
      return (
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-600">
          <span className="material-symbols-outlined text-[22px]">error</span>
        </div>
      );
    }

    return (
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <span className="material-symbols-outlined text-[22px]">
          hourglass_top
        </span>
      </div>
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Đặt lịch tư vấn
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Hoàn tất thông tin bên dưới để gửi yêu cầu đặt lịch.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToPharmacists}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[17px]">
                arrow_back
              </span>
              Quay lại
            </button>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5 md:px-6 md:py-6">
          <Section step={1} title="Thông tin cá nhân">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </Section>

          <div className="h-px bg-slate-200" />

          <Section step={2} title="Chọn ngày và giờ">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{monthLabel}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (canGoPrev) setWeekOffset((x) => x - 1);
                  }}
                  disabled={!canGoPrev}
                  className={[
                    "grid h-8 w-8 place-items-center rounded-md border transition-colors",
                    canGoPrev
                      ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "border-slate-200 text-slate-300 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Previous week"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((x) => x + 1)}
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  aria-label="Next week"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => {
                const isSelected = day.iso === selectedDateISO;

                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={day.disabled}
                    onClick={() => !day.disabled && setSelectedDateISO(day.iso)}
                    className={[
                      "flex-none rounded-lg border px-3 py-2 text-center min-w-[64px]",
                      day.disabled
                        ? "border-slate-200 bg-slate-50 text-slate-300"
                        : isSelected
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="text-[11px] font-medium">{day.dow}</p>
                    <p className="text-base font-semibold leading-5">
                      {day.day}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Buổi sáng
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {MORNING_SLOTS.map((slot) =>
                    renderSlotButton(slot, selectedTime === slot.time),
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Buổi chiều
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {AFTERNOON_SLOTS.map((slot) =>
                    renderSlotButton(slot, selectedTime === slot.time),
                  )}
                </div>
              </div>
            </div>
          </Section>

          <div className="h-px bg-slate-200" />

          <Section step={3} title="Hình thức tư vấn">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {METHOD_OPTIONS.map((option) => (
                <MethodCard
                  key={option.id}
                  option={option}
                  checked={method === option.id}
                  onChange={() => setMethod(option.id)}
                />
              ))}
            </div>
          </Section>

          <div className="h-px bg-slate-200" />

          <Section step={4} title="Mô tả vấn đề sức khỏe">
            <TextareaField
              label="Nội dung cần tư vấn"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Tôi đang đau đầu và sốt nhẹ từ tối qua..."
              error={errors.description}
            />
          </Section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Bằng việc đặt lịch, bạn đồng ý với điều khoản dịch vụ của hệ
              thống.
            </p>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "inline-flex h-11 min-w-[220px] items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold",
                "bg-blue-600 text-white hover:bg-blue-700 transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận đặt lịch</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <Dialog.Root
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/35" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3.5">
              <DialogIcon type={dialog.type} />

              <div className="flex-1">
                <Dialog.Title className="text-base font-semibold text-slate-900">
                  {dialog.title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-6 text-slate-600">
                  {dialog.message}
                </Dialog.Description>

                <div className="mt-4 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Đóng
                    </button>
                  </Dialog.Close>

                  {dialog.type === "success" ? (
                    <button
                      onClick={() => {
                        setDialog((d) => ({ ...d, open: false }));
                        navigate("/pharmacists");
                      }}
                      className="h-9 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Về danh sách
                    </button>
                  ) : null}
                </div>
              </div>

              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="text-slate-400 hover:text-slate-700"
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
