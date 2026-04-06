import React from "react";
import { useLoading } from "../context/LoadingContext";
import "../styles/loading.css";

const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay modal-overlay">
      <div className="loading-container modal-content">
        {/* Animated logo/icon */}
        <div className="loading-icon">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>

        {/* Loading text with animation */}
        <p className="loading-message">{loadingMessage}</p>

        {/* Animated dots */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
