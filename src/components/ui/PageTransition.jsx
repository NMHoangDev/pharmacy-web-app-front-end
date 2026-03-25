import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const PageTransition = forwardRef(({ children, className, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.98
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1], // cubic-bezier for smooth easing
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -20,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

PageTransition.displayName = "PageTransition";

export default PageTransition;
