import React from "react";

const FeaturedProducts = () => {
  return (
    <section className="py-12 bg-white dark:bg-surface-dark">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sản phẩm nổi bật
          </h2>
          <div className="flex gap-2">
            <button className="size-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-lg">
                chevron_left
              </span>
            </button>
            <button className="size-8 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-primary text-white border-primary transition-colors">
              <span className="material-symbols-outlined text-lg">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product Card 1 */}
          <div className="group relative bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                -15%
              </span>
            </div>
            <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden p-6">
              <div
                className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLDci1rffV4qD_ZorsdGyK_k-4R1-xtJXbxzTCKEGB83K-lHQMGkAzfUkbQvleq_m0LUgvmMMDnfaRUz1G0F0K0hfA13uARn6tbU8DvGxK6RCJRS9D9kvI4-CxLGlCg_3lYYRYxRHlu6VCjIfuS-jNEIMaMB7Us2sFQtJL2H7f63yNs2-ze2cE5Y0l13G87Wx1YNsTrMXiOQV2-4c-G2f7N9RFw3IPw3fGv_pAxwEotJYwwpZu99Z-BNM4bNuuZ1He5gaz2xbVldrs')",
                }}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-slate-500 mb-1">
                Vitamin &amp; TPCN
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                Multi-Vitamin Complex Daily Support 60 Viên
              </h3>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400 line-through">
                    250.000đ
                  </p>
                  <p className="text-lg font-bold text-primary">212.000đ</p>
                </div>
                <button className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="group relative bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden p-6">
              <div
                className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCl6PogJnuegeusY9-nJZjZ1FKHcBZgnIfLpGDwJXNDXX_eUqOpMI8E5lBDf4SF0gK24arGe1PbpgVja25_UwVE603Nsr5ZAUPEjRZURF-rqChZapcLHpBZu1S8WPgN1KTUtbNt9PKfQY9BMzcHnInGQSCeZwz9y7fMXTQSQG-FN0y_i64oRKOHB71CP0puafJ0OnCTm9RfFjf4f47_ctWVPImilOqFAJN1Mv2cQ4x86W-QcB2xBYbw3RqsfiPGbL8T7pr1sXbJ7kbp')",
                }}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-slate-500 mb-1">
                Thuốc không kê đơn
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                Panadol Extra with Optizorb 120 Tablets
              </h3>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">185.000đ</p>
                </div>
                <button className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Card 3 */}
          <div className="group relative bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Mới
              </span>
            </div>
            <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden p-6">
              <div
                className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJdkQUZknEd4wNkQnbfuIxBAFGbcCr14GLvSLjFI8FeQVfXriH3SgkoDG_znwwtIGewTAvlAWHA4jjfmNmnsAAZj9N2DWVNb_d8Eso-S49qTW3qh9ZcoWkYuk-swFteMNKkgFTLnQsCSuWk5dUTAN8nvRavMK8SQ8rGbdMuv4RBPfAL09vlQKu5e0lMQZwQZm6II62a8hva2IZQKqRC96bzaXB2EHR1VegsS7WbzKq3s4BqhqDV56hMN1b8tfvgb4e5fZbGBQXQ8Br')",
                }}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-slate-500 mb-1">Tim mạch</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                Omega 3 Fish Oil Premium 1000mg
              </h3>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">320.000đ</p>
                </div>
                <button className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Card 4 */}
          <div className="group relative bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 rounded-t-xl overflow-hidden p-6">
              <div
                className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDE-eNcotkYoLVWPvPKvKgdQPqb3YvhQgq8cw8tCAnC5NXZOp9YJOMHn_fHjDWx0kwnIXCXV0XriIY6eT5A6fd58pEr4868yPiutUqxZI3p9DE-rgGN10xQhPSV2MB4qxP7kwg26r14ex6tJEgl5MviXkvOS9K072qSMEiFdJxGI9mustvw8K7gg98byi7PGcEfyR45yT-9n2q0gRvZda_bts8QRjQTVwaFFVodS0KS70y3uo93ISuPfNe3LjdJ0qbbTkStpj3OLq1V')",
                }}
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-slate-500 mb-1">Mẹ và Bé</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                Siro ho thảo dược Prospan 100ml
              </h3>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">85.000đ</p>
                </div>
                <button className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
