import React from "react";
import { motion } from "framer-motion";

const AuthHero = ({ title, image }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(135deg, #e0f2fe, #f0fdf4, #eef2ff)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute -top-20 left-[8%] h-72 w-72 rounded-full bg-blue-400/30 blur-[80px]"
        animate={{ x: [-8, 8, -8], y: [0, -8, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] -right-20 h-80 w-80 rounded-full bg-violet-400/24 blur-[80px]"
        animate={{ x: [10, -10, 10], y: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 left-[35%] h-72 w-72 rounded-full bg-cyan-300/26 blur-[80px]"
        animate={{ x: [-6, 6, -6], y: [0, 6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-black/15" />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-12">
        <div className="relative flex w-full max-w-xl flex-col items-center gap-8">
          <motion.div
            className="absolute top-[28%] h-64 w-64 rounded-full bg-white/35 blur-3xl"
            animate={{ scale: [1, 1.06, 1], opacity: [0.34, 0.5, 0.34] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              alt={title}
              className="h-[290px] w-[290px] object-contain drop-shadow-[0_14px_30px_rgba(15,23,42,0.22)]"
              src={image}
            />
          </motion.div>

          <div className="relative w-full">
            <svg
              className="h-12 w-full opacity-70"
              viewBox="0 0 400 60"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M0 36 L64 36 L82 18 L106 52 L128 22 L150 36 L220 36 L238 20 L260 42 L282 18 L304 36 L400 36"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="450"
                animate={{ strokeDashoffset: [0, -450] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          <p className="max-w-md text-center text-3xl font-semibold leading-snug text-white/90">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
