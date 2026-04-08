import React from "react";
import { motion } from "framer-motion";

const defaultHighlights = [
  "Theo dõi đơn hàng và lịch sử thanh toán tập trung",
  "Nhận tư vấn dược sĩ và nội dung chăm sóc sức khỏe đáng tin cậy",
  "Lưu hồ sơ để mua thuốc và đặt lịch nhanh hơn",
];

const AuthHero = ({
  title,
  subtitle,
  image,
  highlights = defaultHighlights,
  metricValue = "24/7",
  metricLabel = "Tư vấn cùng dược sĩ",
}) => {
  return (
    <div className="relative flex h-full min-h-[720px] flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(248,252,255,0.96)_0%,rgba(238,247,255,0.96)_100%)] p-8 xl:p-10">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_38%)]"
        animate={{ opacity: [0.9, 1, 0.92] }}
        transition={{ duration: 4.8, repeat: Infinity, repeatType: "mirror" }}
      />
      <div className="absolute right-8 top-8 flex items-center gap-2 rounded-full border border-sky-100 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-[0_16px_40px_rgba(14,165,233,0.10)]">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        Bảo mật xác thực
      </div>

      <div className="relative z-10 grid h-full gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/72 px-4 py-2 text-sm font-medium text-sky-700 shadow-[0_16px_32px_rgba(15,23,42,0.05)]">
              <span className="material-symbols-outlined text-[18px]">
                verified_user
              </span>
              Truy cập tài khoản an toàn
            </div>
            <div className="max-w-xl space-y-4">
              <h2 className="text-4xl font-bold leading-tight text-slate-900 xl:text-[44px]">
                {title}
              </h2>
              <p className="max-w-lg text-base leading-7 text-slate-600 xl:text-lg">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.05 }}
              >
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe,#e0f2fe)] text-sky-700">
                  <span className="material-symbols-outlined text-[18px]">
                    task_alt
                  </span>
                </span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center">
          <motion.div
            className="absolute inset-[11%] rounded-full bg-sky-200/50 blur-3xl"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 5.5, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.div
            className="absolute inset-[20%] rounded-full border border-white/80 bg-white/52 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            animate={{ rotate: [0, 2, 0] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          />
          <motion.img
            src={image}
            alt={title}
            className="relative z-10 h-[320px] w-[320px] object-contain drop-shadow-[0_24px_40px_rgba(15,23,42,0.18)] xl:h-[360px] xl:w-[360px]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
          />

          <div className="absolute bottom-6 left-0 right-0 z-20 mx-auto flex max-w-[420px] items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/84 px-5 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div>
              <p className="text-2xl font-bold text-slate-900">{metricValue}</p>
              <p className="text-sm text-slate-500">{metricLabel}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700">
              <span className="material-symbols-outlined text-[18px]">
                monitoring
              </span>
              Trải nghiệm ổn định
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
