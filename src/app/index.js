import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import { QueryProvider } from "./providers/QueryProvider";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </QueryProvider>
  </React.StrictMode>,
);

reportWebVitals();
