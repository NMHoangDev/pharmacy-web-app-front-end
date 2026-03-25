import React from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
