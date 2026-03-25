import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../../hooks/useReducedMotion";

const AnimatedCard = ({ children, className, onClick, ...props }) => {
  const shouldReduceMotion = useReducedMotion();

  const hoverVariants = shouldReduceMotion
    ? {}
    : {
        hover: {
          y: -4,
          transition: { duration: 0.2, ease: "easeOut" },
        },
        tap: {
          scale: 0.98,
          transition: { duration: 0.1 },
        },
      };

  return (
    <motion.div
      className={`group relative h-full ${className}`}
      variants={hoverVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
