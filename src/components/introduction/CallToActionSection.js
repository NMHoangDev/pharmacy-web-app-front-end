import React from "react";
import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

const CallToActionSection = () => {
  return (
    <section className="px-4 py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0b1220] via-[#0f1d2e] to-[#102a3d] p-8 md:p-12 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 size-[420px] rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 size-[520px] rounded-full bg-sky-400/15 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                Tư vấn miễn phí • 24/7
              </div>
              <h2 className="mt-4 text-white text-2xl md:text-4xl font-black leading-tight tracking-[-0.02em]">
                Bạn cần tư vấn sức khỏe?
              </h2>
              <p className="mt-3 text-blue-100/90 text-base md:text-lg leading-relaxed">
                Đội ngũ dược sĩ của chúng tôi luôn sẵn sàng hỗ trợ bạn — nhanh,
                đúng, và an tâm.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-white font-extrabold shadow-lg shadow-primary/30"
              >
                <span className="absolute -inset-0.5 rounded-2xl bg-primary/40 blur-xl opacity-60" />
                <span className="relative inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    chat
                  </span>
                  Chat ngay
                </span>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20 px-6 text-white font-extrabold backdrop-blur hover:bg-white/20"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    call
                  </span>
                  Gọi hotline
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CallToActionSection;
