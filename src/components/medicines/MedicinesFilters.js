import React, { useMemo } from "react";

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("vi-VN")} đ`;
};

const Chip = ({ children, onRemove }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold
                   bg-primary/10 text-primary ring-1 ring-primary/15"
  >
    {children}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full hover:bg-primary/15"
        aria-label="Remove"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    )}
  </span>
);

const Section = ({ title, icon, children, defaultOpen = false }) => (
  <details className="group" open={defaultOpen}>
    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 select-none list-none">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">
            {icon}
          </span>
        ) : null}
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </span>
      </div>
      <span className="material-symbols-outlined text-[20px] text-slate-400 transition-transform group-open:rotate-180">
        expand_more
      </span>
    </summary>
    <div className="px-5 pb-5">{children}</div>
  </details>
);

const CheckboxRow = ({ checked, onChange, label }) => (
  <label className="group/item flex items-center gap-3 cursor-pointer rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/25"
    />
    <span className="text-sm text-slate-700 dark:text-slate-200 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">
      {label}
    </span>
  </label>
);

const MedicinesFilters = ({
  priceRange,
  minPrice,
  maxPrice,
  onChangePriceRange,
  categories = [],
  selectedCategoryIds = [],
  onToggleCategory,
  brands = [],
  selectedBrands = [],
  onToggleBrand,
  audiences = [],
  selectedAudiences = [],
  onToggleAudience,
  onReset,
}) => {
  const selectedCount =
    selectedCategoryIds.length +
    selectedBrands.length +
    selectedAudiences.length;

  const clampedMin = Math.min(
    priceRange.min ?? minPrice,
    priceRange.max ?? maxPrice,
  );
  const clampedMax = Math.max(
    priceRange.max ?? maxPrice,
    priceRange.min ?? minPrice,
  );

  const pricePercent = useMemo(() => {
    const range = Math.max(1, maxPrice - minPrice);
    const a = ((clampedMin - minPrice) / range) * 100;
    const b = ((clampedMax - minPrice) / range) * 100;
    return { a, b };
  }, [clampedMin, clampedMax, minPrice, maxPrice]);

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24 z-30">
      <div
        className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden
                   bg-white/80 dark:bg-slate-900/60 backdrop-blur shadow-sm
                   hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/30 transition"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              filter_list
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white">Bộ lọc</h3>
            {selectedCount > 0 && (
              <span className="ml-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {selectedCount} đã chọn
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold
                       text-primary bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/15 transition"
          >
            <span className="material-symbols-outlined text-[16px]">
              restart_alt
            </span>
            Xóa tất cả
          </button>
        </div>

        {/* Active chips */}
        {selectedCategoryIds.length ||
        selectedBrands.length ||
        selectedAudiences.length ? (
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Đang lọc theo
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryIds.slice(0, 4).map((id) => {
                const name =
                  categories.find((c) => c.id === id)?.name || "Danh mục";
                return (
                  <Chip
                    key={`cat-${id}`}
                    onRemove={() => onToggleCategory?.(id)}
                  >
                    {name}
                  </Chip>
                );
              })}

              {selectedBrands.slice(0, 4).map((b) => (
                <Chip key={`brand-${b}`} onRemove={() => onToggleBrand?.(b)}>
                  {b}
                </Chip>
              ))}

              {selectedAudiences.slice(0, 4).map((a) => (
                <Chip key={`aud-${a}`} onRemove={() => onToggleAudience?.(a)}>
                  {a}
                </Chip>
              ))}

              {selectedCount > 12 ? (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  +{selectedCount - 12} nữa
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Price range */}
          <Section title="Khoảng giá" icon="payments" defaultOpen>
            <div className="mb-3">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/70 dark:ring-slate-700/70">
                  {formatCurrency(clampedMin)}
                </div>
                <span className="text-slate-400">—</span>
                <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200/70 dark:ring-slate-700/70">
                  {formatCurrency(clampedMax)}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Kéo để chọn khoảng giá phù hợp.
              </p>
            </div>

            {/* Dual range (visual nicer) */}
            <div className="relative mt-4">
              {/* Track */}
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
              {/* Active range */}
              <div
                className="absolute top-0 h-2 rounded-full bg-primary"
                style={{
                  left: `${pricePercent.a}%`,
                  width: `${Math.max(0, pricePercent.b - pricePercent.a)}%`,
                }}
              />

              {/* Sliders */}
              <input
                type="range"
                min={minPrice}
                max={clampedMax}
                step={10000}
                value={clampedMin}
                onChange={(e) =>
                  onChangePriceRange?.({
                    ...priceRange,
                    min: Number(e.target.value),
                  })
                }
                className="absolute -top-2 left-0 w-full appearance-none bg-transparent pointer-events-auto
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-white
                           [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-primary
                           [&::-webkit-slider-thumb]:shadow
                           [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
              <input
                type="range"
                min={clampedMin}
                max={maxPrice}
                step={10000}
                value={clampedMax}
                onChange={(e) =>
                  onChangePriceRange?.({
                    ...priceRange,
                    max: Number(e.target.value),
                  })
                }
                className="absolute -top-2 left-0 w-full appearance-none bg-transparent pointer-events-auto
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-white
                           [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-primary
                           [&::-webkit-slider-thumb]:shadow
                           [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>
          </Section>

          {/* Categories */}
          <Section title="Nhóm sản phẩm" icon="category" defaultOpen>
            <div className="space-y-1">
              {categories.length ? (
                categories.map((category) => (
                  <CheckboxRow
                    key={category.id}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => onToggleCategory?.(category.id)}
                    label={category.name}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500">Chưa có danh mục.</p>
              )}
            </div>
          </Section>

          {/* Brands */}
          <Section title="Thương hiệu" icon="verified" defaultOpen={false}>
            <div
              className="max-h-56 overflow-y-auto pr-1 space-y-1
                            [scrollbar-width:thin]"
            >
              {brands.length ? (
                brands.map((brand) => (
                  <CheckboxRow
                    key={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onToggleBrand?.(brand)}
                    label={brand}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500">Chưa có dữ liệu.</p>
              )}
            </div>
          </Section>

          {/* Audiences */}
          <Section title="Đối tượng sử dụng" icon="person" defaultOpen={false}>
            <div className="space-y-1">
              {audiences.length ? (
                audiences.map((label) => (
                  <CheckboxRow
                    key={label}
                    checked={selectedAudiences.includes(label)}
                    onChange={() => onToggleAudience?.(label)}
                    label={label}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500">Chưa có dữ liệu.</p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </aside>
  );
};

export default MedicinesFilters;
