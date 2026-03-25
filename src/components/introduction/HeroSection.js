import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

const bgUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDBndKe-KKKX5e4zT5Snsl6YFoy-1hn0fjz9YeVno9T_RjPQYkAY4WEInHjAjFp2GjEXtqOs78XAv4v8qsz9lN5E2ay5y_lX8VyxdFVaW1KPXmwuy9iWMqfRgYMmhUKDORMgNOKGPi-Z8MSc4YXF-kK4keiofGVUcgI4xWATchWx_4yzM4YUd9riQt4-W0QMr7oduswCmVxnbmmDBvC52ubXKZdiCD2MyNb9HTH8QRG4NGQ-vswjk2TN5SpagN7oSkUmirpjW72_IZ9J";

const IntroductionHeroSection = () => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.2 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.2 });

  const x = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const y = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(px);
    my.set(py);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="@container px-4 lg:px-0 mb-10">
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
      >
        {/* background image layer (parallax) */}
        <motion.div
          style={{ x, y, scale: 1.06 }}
          className="absolute inset-0 will-change-transform"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${bgUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/70" />
        </motion.div>

        {/* grain + spotlight */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-[420px] rounded-full bg-sky-400/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        <div className="relative flex min-h-[520px] flex-col items-center justify-center px-6 py-14 text-center md:px-10">
          <Stagger className="max-w-[820px]">
            <StaggerItem>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
                Hỗ trợ tư vấn 24/7 • Dược sĩ chuyên môn
              </div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-5 text-white text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.03em] drop-shadow">
                Tận tâm vì sức khỏe cộng đồng
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-4 text-white/90 text-base md:text-lg font-medium leading-relaxed">
                Chúng tôi không chỉ bán thuốc — chúng tôi mang đến giải pháp chăm
                sóc sức khỏe toàn diện với sự thấu hiểu và sẻ chia.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-white font-bold shadow-lg shadow-primary/30 transition"
                >
                  <span className="absolute -inset-0.5 rounded-xl bg-primary/40 blur-xl opacity-60" />
                  <span className="relative">Liên hệ dược sĩ</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white/15 px-6 text-white font-bold backdrop-blur border border-white/25 hover:bg-white/20 transition"
                >
                  Xem cửa hàng
                </motion.button>
              </div>
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.15} className="mt-10">
            <div className="mx-auto flex items-center justify-center gap-3 text-white/70 text-sm">
              <span className="material-symbols-outlined text-base">shield</span>
              Chính hãng • Minh bạch • Bảo mật thông tin
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default IntroductionHeroSection;
