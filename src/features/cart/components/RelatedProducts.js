import React from "react";

const RelatedProducts = ({ products }) => {
  return (
    <div className="storefront-fade-up mt-8 px-4 pb-12">
      <div className="storefront-card rounded-[30px] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Gợi ý mua kèm
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Có thể bạn cần thêm
            </h2>
          </div>
          <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary">
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group storefront-soft-card storefront-float rounded-[24px] p-4 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative mb-4 overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-50 to-sky-50">
                <div
                  className="aspect-square w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${product.image})` }}
                  aria-label={product.alt}
                />
                {product.discount ? (
                  <div className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">
                    {product.discount}
                  </div>
                ) : null}
              </div>

              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{product.subtitle}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-bold text-primary">
                  {product.price}
                </span>
                <button
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white transition-all hover:-translate-y-0.5 hover:bg-primary"
                  aria-label="Them vao gio hang"
                >
                  <span className="material-symbols-outlined text-lg">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
