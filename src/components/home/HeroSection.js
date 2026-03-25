import React, { useEffect, useMemo, useRef, useState } from "react";

const AUTOPLAY_MS = 5500;
const TICK_MS = 40;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const HeroSection = () => {
  const slides = useMemo(
    () => [
      {
        badgeIcon: "verified",
        badgeText: "Tư vấn bởi dược sĩ • Giao hàng nhanh • Chính hãng",
        titleTop: "Chăm sóc sức khỏe",
        titleEm: "toàn diện",
        titleBottom: "cho gia đình",
        desc:
          "Cam kết thuốc chính hãng 100%, được dược sĩ tư vấn tận tâm và giao hàng nhanh chóng trong 2h.",
        cta1Icon: "shopping_bag",
        cta1Text: "Mua thuốc ngay",
        cta2Icon: "calendar_month",
        cta2Text: "Đặt lịch tư vấn",
        img:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAHE9jCx4rCnMUxVbJAySChC-u3rXDd779DTJIho90iNXA5Bh9uGTph55cDDePmafGn9MeOJ6FhjDJxzt-BXEV6qegdH9gFZX5aV8E40GD_IEN5rvN_v26NXQYs633EpC0N8JFGV5IlECStIcKABbw5M1oKTrlsY6HsntrTAO9Q8w43GK6h1p1v3ty6R7KwpPq0MMMmnldxEMiZrGyDXzYsKac2Xu_BAxP9A5PHwIopeLaspavoKdzzQ8N-qLLWgT7T40IRnScydxNk",
      },
      {
        badgeIcon: "ecg_heart",
        badgeText: "Nhắc liều thông minh • Theo dõi đơn • An toàn cho bạn",
        titleTop: "Uống thuốc",
        titleEm: "đúng liều",
        titleBottom: "đúng giờ",
        desc:
          "Lưu lịch dùng thuốc, nhận nhắc liều và tư vấn nhanh khi có dấu hiệu bất thường.",
        cta1Icon: "pill",
        cta1Text: "Xem thuốc phù hợp",
        cta2Icon: "chat",
        cta2Text: "Hỏi dược sĩ ngay",
        img:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB5mG4QjQ8mC6vVxS9XvG8c4mB0Cw1e6vVv4bQGf3x8g2JQ2z0V4h3pGm0oVhVZfZ8oD8mWw5n8r2p5x7pQ3p1x3v8w0b7s2x5g8u2d5s6c1x0q4u7g2",
      },
      {
        badgeIcon: "shield",
        badgeText: "Bảo mật hồ sơ • Minh bạch nguồn gốc • Kiểm tra tương tác",
        titleTop: "Mua thuốc",
        titleEm: "an tâm",
        titleBottom: "mỗi ngày",
        desc:
          "Thông tin rõ ràng, cảnh báo tương tác và hướng dẫn sử dụng chi tiết ngay trên từng sản phẩm.",
        cta1Icon: "storefront",
        cta1Text: "Khám phá sản phẩm",
        cta2Icon: "description",
        cta2Text: "Xem hướng dẫn dùng",
        img:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD8GfJYw8iV2p5u9n1x3c7r9w2e6k8m0v1b2n3c4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0q1w2e3r4t5y6",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // progress 0..1 (for autoplay bar)
  const [progress, setProgress] = useState(0);

  // parallax pointer state (-1..1)
  const [p, setP] = useState({ x: 0, y: 0 });

  const autoplayRef = useRef(null);
  const progressRef = useRef(null);

  const touchRef = useRef({ x: 0, y: 0, t: 0 });

  const go = (idx) => {
    const next = (idx + slides.length) % slides.length;
    setActive(next);
    setProgress(0); // reset bar on manual nav
  };

  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  // Autoplay slide
  useEffect(() => {
    if (paused) return;
    autoplayRef.current = setInterval(() => {
      setActive((v) => (v + 1) % slides.length);
      setProgress(0);
    }, AUTOPLAY_MS);

    return () => clearInterval(autoplayRef.current);
  }, [paused, slides.length]);

  // Progress bar ticker
  useEffect(() => {
    if (paused) return;

    let t = 0;
    progressRef.current = setInterval(() => {
      t += TICK_MS;
      setProgress((prevVal) => {
        // keep monotonic & smooth, cap at 1
        const nextVal = clamp(t / AUTOPLAY_MS, 0, 1);
        return nextVal < prevVal ? prevVal : nextVal;
      });
    }, TICK_MS);

    return () => clearInterval(progressRef.current);
  }, [paused, active]); // restart ticking each slide

  // Reset progress if slide changes from outside
  useEffect(() => {
    setProgress(0);
  }, [active]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Swipe (mobile)
  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.t;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 600) {
      if (dx < 0) next();
      else prev();
    }
  };

  // Parallax handlers (desktop)
  const onStageMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const nx = clamp((e.clientX - cx) / (r.width / 2), -1, 1);
    const ny = clamp((e.clientY - cy) / (r.height / 2), -1, 1);
    setP({ x: nx, y: ny });
  };
  const onStageLeave = () => setP({ x: 0, y: 0 });

  // Parallax transforms (subtle)
  const imgTransform = `translate3d(${p.x * 8}px, ${p.y * 6}px, 0) scale(1.04)`;
  const glowTransform = `translate3d(${p.x * 18}px, ${p.y * 14}px, 0)`;

  return (
    <section
      className="relative bg-white dark:bg-surface-dark py-10 lg:py-16 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setP({ x: 0, y: 0 });
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[520px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* Stage */}
        <div
          className="relative rounded-[28px] border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 backdrop-blur overflow-visible "
          onMouseMove={onStageMove}
          onMouseLeave={onStageLeave}
        >
          {/* Floating Prev/Next on sides */}
<button
  type="button"
  onClick={prev}
  aria-label="Previous slide"
  className="
    absolute -left-5 sm:-left-6 top-1/2 -translate-y-1/2 z-20
    size-11 sm:size-12 rounded-full
    bg-white/80 dark:bg-slate-950/50 backdrop-blur
    border border-slate-200/70 dark:border-slate-800
    shadow-lg shadow-black/10
    flex items-center justify-center
    text-slate-800 dark:text-slate-100
    hover:bg-white hover:dark:bg-slate-900/70 hover:scale-[1.03]
    active:scale-95
    transition
    focus:outline-none focus:ring-2 focus:ring-primary/30
  "
>
  <span className="material-symbols-outlined text-[22px]">chevron_left</span>
</button>

<button
  type="button"
  onClick={next}
  aria-label="Next slide"
  className="
    absolute -right-5 sm:-right-6 top-1/2 -translate-y-1/2 z-20
    size-11 sm:size-12 rounded-full
    bg-primary/90 backdrop-blur
    border border-primary/40
    shadow-lg shadow-primary/20
    flex items-center justify-center
    text-white
    hover:bg-primary hover:scale-[1.03]
    active:scale-95
    transition
    focus:outline-none focus:ring-2 focus:ring-primary/30
  "
>
  <span className="material-symbols-outlined text-[22px]">chevron_right</span>
</button>
          {/* Slides */}
          <div className="relative min-h-[520px] lg:min-h-[440px]">
            {slides.map((s, i) => {
              const isActive = i === active;

              return (
                <div
                  key={i}
                  className={[
                    "absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 translate-x-6 pointer-events-none",
                  ].join(" ")}
                >
                  <div className="relative px-6 sm:px-8 lg:px-10 py-10">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
                      {/* Text */}
                      <div className="flex-1 space-y-7 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            {s.badgeIcon}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {s.badgeText}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {s.titleTop}{" "}
                            <br className="hidden lg:block" />
                            <span className="text-primary">{s.titleEm}</span>{" "}
                            {s.titleBottom}
                          </h1>

                          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                            {s.desc}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                          <button
                            type="button"
                            className="h-12 px-7 rounded-xl bg-primary text-white font-bold text-base transition
                                       hover:opacity-95 active:scale-95
                                       shadow-lg shadow-primary/20
                                       focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined">
                              {s.cta1Icon}
                            </span>
                            <span>{s.cta1Text}</span>
                          </button>

                          <button
                            type="button"
                            className="h-12 px-7 rounded-xl bg-white dark:bg-transparent border border-slate-200 dark:border-slate-800
                                       hover:border-primary text-slate-900 dark:text-white font-bold text-base transition
                                       active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined">
                              {s.cta2Icon}
                            </span>
                            <span>{s.cta2Text}</span>
                          </button>
                        </div>

                        <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                              check_circle
                            </span>
                            <span>100% Chính hãng</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                              check_circle
                            </span>
                            <span>Miễn phí vận chuyển</span>
                          </div>
                        </div>
                      </div>

                      {/* Image (parallax) */}
                      <div className="flex-1 w-full max-w-lg lg:max-w-none">
                        <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 group">
                          <div
                            className="absolute inset-0 bg-cover bg-center will-change-transform"
                            style={{
                              backgroundImage: `url('${s.img}')`,
                              transform: imgTransform,
                              transition:
                                "transform 700ms cubic-bezier(0.22,1,0.36,1)",
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

                          {/* glow with parallax */}
                          <div
                            className="absolute -bottom-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl will-change-transform"
                            style={{
                              transform: glowTransform,
                              transition:
                                "transform 700ms cubic-bezier(0.22,1,0.36,1)",
                            }}
                          />

                          {/* glass label */}
                          <div className="absolute left-4 bottom-4 px-3 py-2 rounded-2xl bg-white/70 dark:bg-slate-950/40 backdrop-blur border border-white/40 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">
                                local_pharmacy
                              </span>
                              <div className="leading-tight">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                  PharmaCare
                                </p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                  Tư vấn & mua thuốc online
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* subtle sheen */}
                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div
                              className="absolute -top-1/2 -left-1/2 size-[120%] rotate-12"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                                transform: `translate3d(${p.x * 12}px, ${
                                  p.y * 10
                                }px, 0)`,
                                transition:
                                  "transform 700ms cubic-bezier(0.22,1,0.36,1)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots + Progress */}
          <div className="px-6 sm:px-8 lg:px-10 pb-6">
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    i === active
                      ? "w-10 bg-primary"
                      : "w-2.5 bg-slate-300/70 dark:bg-slate-700 hover:bg-slate-400/80 dark:hover:bg-slate-600",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* Progress bar (autoplay) */}
            <div className="mt-3 flex items-center justify-center">
              <div className="w-[220px] sm:w-[280px] h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-75 ease-linear"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Vuốt trái/phải trên mobile • Hover để tạm dừng • ← / → để điều khiển
            </p>
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white/70 dark:from-slate-950/30 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/70 dark:from-slate-950/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
