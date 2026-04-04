import React from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./auth/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <LoadingProvider>
          <LoadingOverlay />
          <AppRouter />
        </LoadingProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
