import React from "react";
import { Link } from "react-router-dom";

const badgeStyles = {
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

const MedicinesGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/medicines/${product.slug || product.id}`}
          className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
        >
          <div className="relative aspect-[4/3] bg-white p-6 flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500"
            />

            {product.badge && (
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded shadow-sm border ${badgeStyles[product.badgeColor] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                >
                  {product.badge}
                </span>
              </div>
            )}

            {product.rx && (
              <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded shadow-sm border border-blue-200 flex items-center gap-1 w-fit">
                  <span className="material-symbols-outlined text-[14px]">
                    prescriptions
                  </span>
                  Rx Required
                </span>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="mb-1">
              <span className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{product.description}</p>

            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {product.consult && (
                <div className="flex items-center gap-2 mb-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded border border-amber-100 dark:border-amber-800/30">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">
                    medical_services
                  </span>
                  <span className="text-[10px] font-medium text-amber-800 dark:text-amber-200 leading-tight">
                    Consultation needed before purchase
                  </span>
                </div>
              )}

              <div className="flex items-end justify-between pt-1">
                <div className="flex flex-col">
                  {product.oldPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      {product.oldPrice}
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary">
                    {product.price}
                  </span>
                </div>

                {product.consult ? (
                  <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-1">
                    Consult
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <button className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">
                      add_shopping_cart
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MedicinesGrid;
