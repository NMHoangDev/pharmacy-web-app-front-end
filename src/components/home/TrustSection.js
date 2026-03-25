import React, { useEffect, useMemo, useState } from "react";

const TrustSection = () => {
  const items = useMemo(
    () => [
      {
        icon: "verified_user",
        title: "Thuốc chính hãng 100%",
        desc: "Nguồn gốc rõ ràng, đầy đủ hóa đơn chứng từ và thông tin minh bạch.",
      },
      {
        icon: "support_agent",
        title: "Dược sĩ tư vấn 1-1",
        desc: "Hỏi đáp nhanh, hướng dẫn dùng thuốc đúng – an toàn – đúng liều.",
      },
      {
        icon: "encrypted",
        title: "Bảo mật hồ sơ",
        desc: "Thông tin tư vấn & đơn thuốc được mã hóa, chỉ bạn và dược sĩ xem được.",
      },
      {
        icon: "science",
        title: "Kiểm tra tương tác thuốc",
        desc: "Cảnh báo tương tác & chống chỉ định dựa trên tiền sử và thuốc đang dùng.",
      },
    ],
    []
  );

  // perView responsive
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 1024) return 2;
      return 3;
    };
    const apply = () => setPerView(calc());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // Infinite loop clones
  const slides = useMemo(() => {
    const head = items.slice(-perView);
    const tail = items.slice(0, perView);
    return [...head, ...items, ...tail];
  }, [items, perView]);

  const [index, setIndex] = useState(perView);
  const [transitionOn, setTransitionOn] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setTransitionOn(false);
    setIndex(perView);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTransitionOn(true))
    );
  }, [perView]);

  const maxIndex = items.length + perView;

  const goNext = () => {
    if (locked) return;
    setLocked(true);
    setIndex((v) => v + 1);
  };

  const goPrev = () => {
    if (locked) return;
    setLocked(true);
    setIndex((v) => v - 1);
  };

  const onTransitionEnd = () => {
    setLocked(false);

    // left clone zone
    if (index <= perView - 1) {
      setTransitionOn(false);
      setIndex(index + items.length);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setTransitionOn(true))
      );
      return;
    }

    // right clone zone
    if (index >= maxIndex + 1) {
      setTransitionOn(false);
      setIndex(index - items.length);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setTransitionOn(true))
      );
    }
  };

  const slideWidthPct = 100 / perView;
  const translatePct = -(index * slideWidthPct);

  return (
    <section className="py-16 bg-slate-50/70 dark:bg-slate-900/30 border-y border-slate-200/70 dark:border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Lý do bạn có thể tin tưởng
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Tiêu chuẩn an toàn – minh bạch – bảo mật cho tư vấn & mua thuốc
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Trượt sang trái"
              className="size-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950
                         hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Trượt sang phải"
              className="size-10 flex items-center justify-center rounded-full border border-primary bg-primary text-white transition
                         hover:opacity-95 active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden rounded-3xl">
          <div
            onTransitionEnd={onTransitionEnd}
            className="flex"
            style={{
              transform: `translateX(${translatePct}%)`,
              transition: transitionOn
                ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            {slides.map((it, i) => (
              <div
                key={`${it.title}-${i}`}
                className="shrink-0 px-3"
                style={{ width: `${slideWidthPct}%` }}
              >
                <div
                  className="group bg-white dark:bg-surface-dark rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm
                             hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-7 h-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 size-14 rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">
                        {it.icon}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {it.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {it.desc}
                      </p>
                    </div>
                  </div>

                  {/* subtle bottom accent */}
                  <div className="mt-6 h-px bg-gradient-to-r from-primary/30 via-slate-200/40 to-transparent dark:via-slate-800" />
                </div>
              </div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-50/80 dark:from-slate-900/30 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50/80 dark:from-slate-900/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
