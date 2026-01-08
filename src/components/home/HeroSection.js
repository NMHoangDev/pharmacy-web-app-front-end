import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-white dark:bg-surface-dark py-8 lg:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Chăm sóc sức khỏe <br className="hidden lg:block" />
                <span className="text-primary">toàn diện</span> cho gia đình
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Cam kết thuốc chính hãng 100%, được dược sĩ tư vấn tận tâm và
                giao hàng nhanh chóng trong 2h.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button className="h-12 px-8 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-base transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span>
                <span>Mua thuốc ngay</span>
              </button>
              <button className="h-12 px-8 rounded-lg bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-900 dark:text-white font-bold text-base transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                <span>Đặt lịch tư vấn</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 icon-filled text-[20px]">
                  check_circle
                </span>
                <span>100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 icon-filled text-[20px]">
                  check_circle
                </span>
                <span>Miễn phí vận chuyển</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHE9jCx4rCnMUxVbJAySChC-u3rXDd779DTJIho90iNXA5Bh9uGTph55cDDePmafGn9MeOJ6FhjDJxzt-BXEV6qegdH9gFZX5aV8E40GD_IEN5rvN_v26NXQYs633EpC0N8JFGV5IlECStIcKABbw5M1oKTrlsY6HsntrTAO9Q8w43GK6h1p1v3ty6R7KwpPq0MMMmnldxEMiZrGyDXzYsKac2Xu_BAxP9A5PHwIopeLaspavoKdzzQ8N-qLLWgT7T40IRnScydxNk')",
                }}
              />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
