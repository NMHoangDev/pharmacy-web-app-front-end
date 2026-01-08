import React from "react";

const Footer = () => {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-xl">
                  local_pharmacy
                </span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                PharmaCare
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Hệ thống nhà thuốc uy tín hàng đầu, chuyên cung cấp các sản phẩm
              chăm sóc sức khỏe chất lượng cao.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  public
                </span>
              </a>
              <a
                href="#"
                className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              Về chúng tôi
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Giới thiệu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Hệ thống nhà thuốc
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Giấy phép kinh doanh
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              Chính sách
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                >
                  Phương thức thanh toán
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              Liên hệ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  location_on
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  123 Đường Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  call
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  1900 123 456
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl shrink-0">
                  mail
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  cskh@pharmacare.vn
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © 2023 PharmaCare. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
