import React from "react";
import { Link } from "react-router-dom";

const badgeStyles = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200/60",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  blue: "bg-blue-50 text-blue-700 ring-blue-200/60",
  purple: "bg-purple-50 text-purple-700 ring-purple-200/60",
};

const MedicinesGrid = ({ products, onAddToCart, onConsult }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/medicines/${product.slug || product.id}`}
          className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 backdrop-blur overflow-hidden
                     shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/30
                     transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          {/* Media */}
          <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            {/* subtle glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.18),transparent_55%)]" />

            <div className="absolute inset-0 p-6 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.title}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
              />
            </div>

            {/* Badge: top-left */}
            {product.badge && (
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                    "ring-1 shadow-sm backdrop-blur",
                    badgeStyles[product.badgeColor] ||
                      "bg-slate-50 text-slate-700 ring-slate-200/70",
                  ].join(" ")}
                >
                  {product.badge}
                </span>
              </div>
            )}

            {/* Rx: top-right (không chồng nhau) */}
            {product.rx && (
              <div className="absolute top-3 right-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
                                 bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 shadow-sm backdrop-blur"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    prescriptions
                  </span>
                  Rx Required
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col">
            <div className="min-h-[48px]">
              <h3 className="text-[15px] sm:text-base font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
                {product.title}
              </h3>
            </div>

            {product.description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Consult alert */}
            {product.consult && (
              <div
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-2.5 py-2
                              bg-amber-50/70 dark:bg-amber-900/15 ring-1 ring-amber-200/60 dark:ring-amber-800/30"
              >
                <span className="material-symbols-outlined text-amber-600 text-[16px]">
                  medical_services
                </span>
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-200 leading-tight">
                  Consultation needed before purchase
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-3">
              <div className="min-w-0">
                {product.oldPrice && (
                  <div className="text-xs text-slate-400 line-through truncate">
                    {product.oldPrice}
                  </div>
                )}
                <div className="text-lg font-bold text-primary leading-none">
                  {product.price}
                </div>
                {/* micro text */}
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  VAT included
                </div>
              </div>

              {/* Actions */}
              {product.consult ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onConsult?.(product);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                             bg-primary text-white text-xs font-semibold shadow-sm
                             hover:bg-primary/90 active:scale-[0.98] transition"
                >
                  Consult
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart?.(product);
                  }}
                  className="shrink-0 size-10 rounded-xl
                             bg-slate-100 dark:bg-slate-800 text-primary
                             ring-1 ring-slate-200/70 dark:ring-slate-700/70
                             hover:bg-primary hover:text-white hover:ring-primary/30
                             active:scale-[0.98] transition shadow-sm flex items-center justify-center"
                  aria-label="Add to cart"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add_shopping_cart
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* hover border glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/20 transition" />
        </Link>
      ))}
    </div>
  );
};

export default MedicinesGrid;
