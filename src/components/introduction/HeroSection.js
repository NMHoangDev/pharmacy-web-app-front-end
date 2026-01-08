import React from "react";

const IntroductionHeroSection = () => {
  return (
    <section className="@container px-4 lg:px-0 mb-8">
      <div
        className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 text-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBndKe-KKX5e4zT5Snsl6YFoy-1hn0fjz9YeVno9T_RjPQYkAY4WEInHjAjFp2GjEXtqOs78XAv4v8qsz9lN5E2ay5y_lX8VyxdFVaW1KPXmwuy9iWMqfRgYMmhUKDORMgNOKGPi-Z8MSc4YXF-kK4keiofGVUcgI4xWATchWx_4yzM4YUd9riQt4-W0QMr7oduswCmVxnbmmDBvC52ubXKZdiCD2MyNb9HTH8QRG4NGQ-vswjk2TN5SpagN7oSkUmirpjW72_IZ9J')",
        }}
      >
        <div className="flex flex-col gap-4 max-w-[700px]">
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
            Tận tâm vì sức khỏe cộng đồng
          </h1>
          <p className="text-white/90 text-lg font-medium leading-normal">
            Chúng tôi không chỉ bán thuốc, chúng tôi mang đến giải pháp chăm sóc
            sức khỏe toàn diện với sự thấu hiểu và sẻ chia.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center mt-4">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark text-white text-base font-bold leading-normal tracking-[0.015em] transition-all">
            <span className="truncate">Liên hệ dược sĩ</span>
          </button>
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/40 text-base font-bold leading-normal tracking-[0.015em] transition-all">
            <span className="truncate">Xem cửa hàng</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default IntroductionHeroSection;
