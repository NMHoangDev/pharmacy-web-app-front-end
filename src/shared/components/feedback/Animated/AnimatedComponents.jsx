import React from "react";
import "../styles/animations.css";

/**
 * Animated Button Component
 * Includes hover lift, click press, and focus glow effects
 */
export const AnimatedButton = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseClasses =
    "button-interactive px-4 py-2 rounded-lg font-medium transition-all";

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-hover text-white",
    secondary: "bg-surface-2 hover:bg-border text-text",
    danger: "bg-danger hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-surface-2 text-text border border-border",
  };

  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner-tiny"></span>}
      {children}
    </button>
  );
};

/**
 * Animated Card Component
 * Includes hover lift effect
 */
export const AnimatedCard = ({
  children,
  className = "",
  onClick = null,
  hoverable = true,
  ...props
}) => {
  const baseClasses = "bg-surface rounded-lg p-6 border border-border";
  const hoverClasses = hoverable ? "interactive-hover cursor-pointer" : "";
  const finalClasses = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div className={finalClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

/**
 * Animated Input Component
 * Includes smooth focus transitions
 */
export const AnimatedInput = ({ className = "", ...props }) => {
  const baseClasses = `w-full px-4 py-2 bg-surface-2 border border-border rounded-lg text-text
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
    transition-all duration-200`;

  return <input className={`${baseClasses} ${className}`} {...props} />;
};

/**
 * Animated Textarea Component
 */
export const AnimatedTextarea = ({ className = "", ...props }) => {
  const baseClasses = `w-full px-4 py-2 bg-surface-2 border border-border rounded-lg text-text
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
    transition-all duration-200 resize-vertical`;

  return <textarea className={`${baseClasses} ${className}`} {...props} />;
};

/**
 * Animated Badge Component
 */
export const AnimatedBadge = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200";

  const variantClasses = {
    primary: "bg-primary bg-opacity-20 text-primary",
    success: "bg-green-500 bg-opacity-20 text-green-400",
    warning: "bg-yellow-500 bg-opacity-20 text-yellow-400",
    danger: "bg-danger bg-opacity-20 text-danger",
    muted: "bg-surface-2 text-muted",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Animated Loading Indicator
 * Shows spinner with optional text
 */
export const AnimatedSpinner = ({
  size = "medium",
  text = "",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-2 border-transparent border-t-primary border-r-primary rounded-full"></div>
      </div>
      {text && <span className="text-muted">{text}</span>}
    </div>
  );
};

/**
 * Animated List Component
 * Applies stagger effect to children
 */
export const AnimatedList = ({ items, renderItem, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="stagger-item">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

/**
 * Animated Modal Component
 */
export const AnimatedModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
    "extra-large": "max-w-2xl",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content bg-surface rounded-lg shadow-2xl p-6 ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="text-text">{children}</div>
      </div>
    </div>
  );
};

/**
 * Animated Section Component
 * With fade-in animation
 */
export const AnimatedSection = ({
  children,
  title,
  className = "",
  animation = "fade-up",
}) => {
  const animationClasses = {
    "fade-up": "animate-fade-in-up",
    "fade-scale": "animate-fade-in-scale",
    "slide-left": "animate-slide-in-left",
    "slide-right": "animate-slide-in-right",
  };

  return (
    <section className={`${animationClasses[animation]} ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
};

export default {
  AnimatedButton,
  AnimatedCard,
  AnimatedInput,
  AnimatedTextarea,
  AnimatedBadge,
  AnimatedSpinner,
  AnimatedList,
  AnimatedModal,
  AnimatedSection,
};
