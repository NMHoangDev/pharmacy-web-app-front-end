import React from "react";

const RelatedProducts = ({ products }) => {
  return (
    <div className="mt-8 px-4 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0d141b] dark:text-white">
          Có thể bạn cần thêm
        </h2>
        <button className="text-primary text-sm font-medium hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white dark:bg-[#1a2634] rounded-lg border border-[#cfdbe7] dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="aspect-square bg-slate-50 dark:bg-gray-800 rounded-lg mb-3 relative overflow-hidden">
              <div
                className="bg-center bg-no-repeat bg-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundImage: `url(${product.image})` }}
                aria-label={product.alt}
              />
              {product.discount && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {product.discount}
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-[#0d141b] dark:text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-[#4c739a] mb-2">{product.subtitle}</p>
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold text-sm">
                {product.price}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Thêm vào giỏ hàng"
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
  );
};

export default RelatedProducts;
