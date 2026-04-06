import React, { useEffect, useMemo, useRef, useState } from "react";
import { uploadMediaImage } from "../../api/contentApi";
import { fileToDataUrl, normalizeMediaUrl } from "../../utils/media";

const consultationModeOptions = [
  { value: "VIDEO", label: "Video" },
  { value: "CHAT", label: "Chat" },
  { value: "VOICE_CALL", label: "Gọi thoại" },
  { value: "IN_PERSON", label: "Tại chi nhánh" },
];

const statusOptions = [
  { value: "ONLINE", label: "Đang online" },
  { value: "OFFLINE", label: "Ngoại tuyến" },
  { value: "BUSY", label: "Bận" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "SUSPENDED", label: "Tạm khóa" },
];

const workingDayOptions = [
  { value: "MONDAY", label: "Thứ 2" },
  { value: "TUESDAY", label: "Thứ 3" },
  { value: "WEDNESDAY", label: "Thứ 4" },
  { value: "THURSDAY", label: "Thứ 5" },
  { value: "FRIDAY", label: "Thứ 6" },
  { value: "SATURDAY", label: "Thứ 7" },
  { value: "SUNDAY", label: "Chủ nhật" },
];

const workingHourOptions = [
  { value: "07:00 - 11:00", label: "Ca sáng 07:00 - 11:00" },
  { value: "08:00 - 12:00", label: "Ca sáng 08:00 - 12:00" },
  { value: "13:00 - 17:00", label: "Ca chiều 13:00 - 17:00" },
  { value: "14:00 - 18:00", label: "Ca chiều 14:00 - 18:00" },
  { value: "17:00 - 21:00", label: "Ca tối 17:00 - 21:00" },
  { value: "08:00 - 17:00", label: "Cả ngày 08:00 - 17:00" },
];

const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join(", ") : "";

const toInputState = (profile) => ({
  code: profile?.code || "",
  name: profile?.name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  avatarUrl: profile?.avatarUrl || "",
  specialty: profile?.specialty || "",
  experienceYears: profile?.experienceYears ?? 0,
  status: profile?.status || "OFFLINE",
  verified: Boolean(profile?.verified),
  availability: profile?.availability || "",
  rating: profile?.rating ?? 0,
  reviewCount: profile?.reviewCount ?? 0,
  bio: profile?.bio || "",
  education: profile?.education || "",
  languages: joinList(profile?.languages),
  workingDays: Array.isArray(profile?.workingDays) ? profile.workingDays : [],
  workingHours: profile?.workingHours || "",
  consultationModes: Array.isArray(profile?.consultationModes)
    ? profile.consultationModes
    : [],
  licenseNumber: profile?.licenseNumber || "",
  branchId: profile?.branchId || "",
});

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder = "",
}) => (
  <label className="flex flex-col gap-2">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={onChange}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 read-only:bg-slate-50"
    />
  </label>
);

const TextAreaField = ({ label, value, onChange, rows = 4 }) => (
  <label className="flex flex-col gap-2">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </label>
);

const Section = ({ title, description, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  </section>
);

const MultiSelectDropdown = ({
  label,
  options,
  values,
  onToggle,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative flex flex-col gap-2" ref={containerRef}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        aria-expanded={open}
      >
        <span className={selectedLabels.length ? "" : "text-slate-400"}>
          {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
        </span>
        <span
          className={[
            "material-symbols-outlined text-base text-slate-400 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          expand_more
        </span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {options.map((option) => {
              const checked = values.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 rounded border-slate-300 text-primary"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary"
            >
              Xong
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const PharmacistProfileForm = ({
  title,
  subtitle,
  initialProfile,
  branches = [],
  onSubmit,
  submitting = false,
  submitLabel = "Lưu thay đổi",
  readOnlyManagedFields = false,
}) => {
  const [form, setForm] = useState(() => toInputState(initialProfile));
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(toInputState(initialProfile));
    setAvatarPreview(normalizeMediaUrl(initialProfile?.avatarUrl || ""));
    setAvatarError("");
  }, [initialProfile]);

  const metadata = useMemo(
    () => ({
      createdAt: initialProfile?.createdAt
        ? new Date(initialProfile.createdAt).toLocaleString("vi-VN")
        : "-",
      updatedAt: initialProfile?.updatedAt
        ? new Date(initialProfile.updatedAt).toLocaleString("vi-VN")
        : "-",
      id: initialProfile?.id || "-",
    }),
    [initialProfile],
  );

  const patchField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const toggleMode = (mode) => {
    setForm((prev) => {
      const nextModes = prev.consultationModes.includes(mode)
        ? prev.consultationModes.filter((item) => item !== mode)
        : [...prev.consultationModes, mode];
      return { ...prev, consultationModes: nextModes };
    });
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => {
      const nextDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: nextDays };
    });
  };

  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarUploading(true);
    setAvatarError("");

    try {
      const localPreview = await fileToDataUrl(file);
      if (localPreview) {
        setAvatarPreview(localPreview);
      }

      const { url } = await uploadMediaImage(file);
      if (!url) {
        throw new Error("Không thể tải ảnh đại diện.");
      }

      patchField("avatarUrl", url);
      setAvatarPreview(normalizeMediaUrl(url));
    } catch (uploadError) {
      setAvatarError(
        uploadError?.message || "Không thể tải ảnh đại diện lên media.",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!String(form.name || "").trim()) {
      setError("Tên dược sĩ là bắt buộc.");
      return;
    }

    if (!String(form.specialty || "").trim()) {
      setError("Chuyên môn là bắt buộc.");
      return;
    }

    const payload = {
      code: form.code || null,
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      avatarUrl: form.avatarUrl || null,
      specialty: form.specialty.trim(),
      experienceYears: Number(form.experienceYears || 0),
      status: form.status || "OFFLINE",
      verified: Boolean(form.verified),
      availability: form.availability || null,
      rating: Number(form.rating || 0),
      reviewCount: Number(form.reviewCount || 0),
      bio: form.bio || null,
      education: form.education || null,
      languages: splitList(form.languages),
      workingDays: form.workingDays,
      workingHours: form.workingHours || null,
      consultationModes: form.consultationModes,
      licenseNumber: form.licenseNumber || null,
      branchId: form.branchId || null,
    };

    try {
      await onSubmit?.(payload);
    } catch (submitError) {
      setError(submitError?.message || "Không thể lưu hồ sơ dược sĩ.");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">
          Quản lý hồ sơ dược sĩ
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Section
        title="Thông tin cơ bản"
        description="Các trường này hiển thị trực tiếp ở danh sách dược sĩ, trang đặt lịch và hồ sơ cá nhân."
      >
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={form.name || "Ảnh đại diện dược sĩ"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-400">
                    {String(form.name || "P")
                      .trim()
                      .slice(0, 1)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Ảnh đại diện
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Chọn ảnh để tải lên media service và hiển thị ngay trên hồ sơ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-primary disabled:opacity-60"
            >
              {avatarUploading ? "Đang tải..." : "Chọn ảnh"}
            </button>
          </div>
          {avatarError ? (
            <p className="mt-3 text-sm text-rose-600">{avatarError}</p>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelected}
          />
        </div>

        <Field label="Mã dược sĩ" value={metadata.id} readOnly />
        <Field
          label="Họ và tên"
          value={form.name}
          onChange={(e) => patchField("name", e.target.value)}
        />
        <Field
          label="Email"
          value={form.email}
          onChange={(e) => patchField("email", e.target.value)}
          type="email"
        />
        <Field
          label="Số điện thoại"
          value={form.phone}
          onChange={(e) => patchField("phone", e.target.value)}
        />
        <Field
          label="URL ảnh đại diện"
          value={form.avatarUrl}
          onChange={(e) => {
            patchField("avatarUrl", e.target.value);
            setAvatarPreview(normalizeMediaUrl(e.target.value));
          }}
          placeholder="/api/media/... hoặc https://..."
        />
        <Field
          label="Chuyên môn"
          value={form.specialty}
          onChange={(e) => patchField("specialty", e.target.value)}
          placeholder="Ví dụ: Dược lâm sàng"
        />
        <Field
          label="Số năm kinh nghiệm"
          type="number"
          value={form.experienceYears}
          onChange={(e) => patchField("experienceYears", e.target.value)}
        />
        <Field
          label="Số giấy phép"
          value={form.licenseNumber}
          onChange={(e) => patchField("licenseNumber", e.target.value)}
        />
      </Section>

      <Section
        title="Chi nhánh và lịch làm việc"
        description="Mỗi dược sĩ làm việc tại một chi nhánh cố định và có thể chọn nhanh ngày, khung giờ làm việc."
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Chi nhánh</span>
          <select
            value={form.branchId}
            onChange={(e) => patchField("branchId", e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Chưa gán chi nhánh</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            Khung giờ làm việc
          </span>
          <select
            value={form.workingHours}
            onChange={(e) => patchField("workingHours", e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Chọn khung giờ</option>
            {workingHourOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <MultiSelectDropdown
          label="Ngày làm việc"
          options={workingDayOptions}
          values={form.workingDays}
          onToggle={toggleWorkingDay}
          placeholder="Chọn ngày làm việc"
        />

        <Field
          label="Mô tả khả dụng"
          value={form.availability}
          onChange={(e) => patchField("availability", e.target.value)}
          placeholder="Ví dụ: Có mặt buổi sáng tại chi nhánh Quận 1"
        />

        <div className="md:col-span-2 space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Hình thức tư vấn
          </span>
          <div className="flex flex-wrap gap-2">
            {consultationModeOptions.map((option) => {
              const checked = form.consultationModes.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleMode(option.value)}
                  className={[
                    "rounded-full border px-3 py-2 text-sm transition",
                    checked
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        title="Nội dung hồ sơ"
        description="Dữ liệu này hiển thị ở hồ sơ chi tiết và card dược sĩ cho người dùng."
      >
        <Field
          label="Ngôn ngữ"
          value={form.languages}
          onChange={(e) => patchField("languages", e.target.value)}
          placeholder="Tiếng Việt, English"
        />

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            Trạng thái làm việc
          </span>
          <select
            value={form.status}
            onChange={(e) => patchField("status", e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={form.verified}
            disabled={readOnlyManagedFields}
            onChange={(e) => patchField("verified", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary"
          />
          <span className="text-sm text-slate-700">
            Đã xác minh chứng chỉ hành nghề
          </span>
        </label>

        <Field
          label="Điểm đánh giá"
          type="number"
          value={form.rating}
          readOnly={readOnlyManagedFields}
          onChange={(e) => patchField("rating", e.target.value)}
        />
        <Field
          label="Số lượt đánh giá"
          type="number"
          value={form.reviewCount}
          readOnly={readOnlyManagedFields}
          onChange={(e) => patchField("reviewCount", e.target.value)}
        />

        <div className="md:col-span-2">
          <TextAreaField
            label="Tiểu sử"
            value={form.bio}
            onChange={(e) => patchField("bio", e.target.value)}
            rows={5}
          />
        </div>
        <div className="md:col-span-2">
          <TextAreaField
            label="Học vấn"
            value={form.education}
            onChange={(e) => patchField("education", e.target.value)}
            rows={4}
          />
        </div>
      </Section>

      <Section
        title="Thông tin hệ thống"
        description="Hỗ trợ đối soát và kiểm tra trạng thái đồng bộ của hồ sơ."
      >
        <Field label="ID" value={metadata.id} readOnly />
        <Field label="Tạo lúc" value={metadata.createdAt} readOnly />
        <Field label="Cập nhật lúc" value={metadata.updatedAt} readOnly />
      </Section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || avatarUploading}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-primary disabled:opacity-60"
        >
          {submitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PharmacistProfileForm;
