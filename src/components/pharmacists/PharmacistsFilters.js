import React from "react";

const specialties = [
  { value: "all", label: "Tất cả" },
  { value: "clinical", label: "Dược lâm sàng" },
  { value: "pediatric", label: "Dược nhi" },
  { value: "supplement", label: "Tư vấn TPCN" },
  { value: "cosmetic", label: "Dược mỹ phẩm" },
  { value: "obstetric", label: "Dược thai sản" },
];

const modes = [
  { value: "all", label: "Tất cả" },
  { value: "ONLINE", label: "Online (Video/Chat)" },
  { value: "IN_PERSON", label: "Tại quầy thuốc" },
];

const experiences = [
  { value: "all", label: "Tất cả" },
  { value: "junior", label: "Dưới 3 năm" },
  { value: "mid", label: "3 - 5 năm" },
  { value: "senior", label: "Trên 5 năm" },
];

const Section = ({ title, children }) => (
  <section className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
    <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
    <div className="space-y-2.5">{children}</div>
  </section>
);

const RadioField = ({ checked, onChange, label, name, value }) => (
  <label className="flex items-center gap-2.5 text-sm text-slate-600">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
    />
    <span>{label}</span>
  </label>
);

const PharmacistsFilters = ({ filters, onChange, onReset, onApply }) => {
  return (
    <aside className="hidden lg:flex lg:flex-col gap-4 sticky top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Bộ lọc</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Xóa tất cả
        </button>
      </div>

      <Section title="Chuyên môn">
        {specialties.map((item) => (
          <RadioField
            key={item.value}
            name="specialty"
            value={item.value}
            label={item.label}
            checked={filters.specialty === item.value}
            onChange={(e) =>
              onChange({ ...filters, specialty: e.target.value })
            }
          />
        ))}
      </Section>

      <Section title="Hình thức tư vấn">
        {modes.map((item) => (
          <RadioField
            key={item.value}
            name="mode"
            value={item.value}
            label={item.label}
            checked={filters.mode === item.value}
            onChange={(e) => onChange({ ...filters, mode: e.target.value })}
          />
        ))}
      </Section>

      <Section title="Kinh nghiệm">
        {experiences.map((item) => (
          <RadioField
            key={item.value}
            name="experience"
            value={item.value}
            label={item.label}
            checked={filters.experience === item.value}
            onChange={(e) =>
              onChange({ ...filters, experience: e.target.value })
            }
          />
        ))}
      </Section>

      <Section title="Đánh giá">
        <label className="flex items-center gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={filters.ratingGte === 4}
            onChange={() =>
              onChange({
                ...filters,
                ratingGte: filters.ratingGte === 4 ? null : 4,
              })
            }
          />
          <span className="inline-flex items-center gap-1">
            4
            <span className="material-symbols-outlined text-[15px] text-amber-500">
              star
            </span>
            trở lên
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={filters.ratingGte === 5}
            onChange={() =>
              onChange({
                ...filters,
                ratingGte: filters.ratingGte === 5 ? null : 5,
              })
            }
          />
          <span className="inline-flex items-center gap-1">
            5
            <span className="material-symbols-outlined text-[15px] text-amber-500">
              star
            </span>
          </span>
        </label>
      </Section>

      <button
        type="button"
        onClick={onApply}
        className="mt-1 h-10 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Áp dụng
      </button>
    </aside>
  );
};

export default PharmacistsFilters;
