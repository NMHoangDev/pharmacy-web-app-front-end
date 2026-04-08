import React from "react";
import "./styles/App.css";
import AppRouter from "./router/AppRouter";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "../shared/auth/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingOverlay from "../shared/components/feedback/LoadingOverlay";

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
