import React, { createContext, useContext, useState } from "react";

// Tạo context dùng cho global state toàn app
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Ví dụ một global state: theme, sau này bạn có thể thêm những state khác (user, cart, ...)
  const [theme, setTheme] = useState("light");

  const value = {
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook tiện dụng để dùng context trong các page / component
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
};

export default AppContext;
