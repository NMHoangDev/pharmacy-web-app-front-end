import { useEffect, useState } from "react";

/**
 * Hook để áp dụng animations cho page entrance
 * @param {string} animationType - loại animation: 'fade-up', 'fade-scale', 'slide-left', 'slide-right'
 * @returns {string} - class name cần thêm vào element
 */
export const usePageTransition = (animationType = "fade-in-up") => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "";

  const animationMap = {
    "fade-up": "animate-fade-in-up",
    "fade-scale": "animate-fade-in-scale",
    "slide-left": "animate-slide-in-left",
    "slide-right": "animate-slide-in-right",
    "slide-top": "animate-slide-in-top",
  };

  return animationMap[animationType] || animationMap["fade-up"];
};

/**
 * Hook để tạo staggered animation cho list items
 * @returns {string} - class name 'stagger-item' để dùng cho mỗi item
 */
export const useStaggerAnimation = () => {
  return "stagger-item";
};

/**
 * Component wrapper để áp dụng page transition animations
 */
export const AnimatedPage = ({ children, animation = "fade-up" }) => {
  const animationClass = usePageTransition(animation);
  return <div className={animationClass}>{children}</div>;
};

/**
 * Component wrapper để áp dụng staggered animations cho list items
 */
export const StaggerContainer = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

export const StaggerItem = ({ children, className = "" }) => {
  return <div className={`stagger-item ${className}`}>{children}</div>;
};
