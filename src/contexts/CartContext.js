import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as cartApi from "../api/cartApi";
import { getUserId, getAuthToken } from "../utils/auth";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }, [cartItems]);

  const setCartFromResponse = useCallback((resp) => {
    const items = Array.isArray(resp?.items) ? resp.items : [];
    const normalized = items.map((it) => ({
      productId: it.productId,
      quantity: Number(it.quantity) || 0,
    }));
    // debug log: normalized items we set into context
    // eslint-disable-next-line no-console
    console.log("CartContext.setCartFromResponse -> normalized:", normalized);
    setCartItems(normalized);
  }, []);

  const refreshCart = useCallback(async () => {
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId) {
      // eslint-disable-next-line no-console
      console.log(
        "CartContext.refreshCart -> no token or userId, clearing cart",
        { token, userId },
      );
      setCartItems([]);
      return;
    }
    // eslint-disable-next-line no-console
    console.log("CartContext.refreshCart -> start", { userId });
    setLoading(true);
    setError(null);
    try {
      const resp = await cartApi.getCart(userId);
      // eslint-disable-next-line no-console
      console.log("CartContext.refreshCart -> getCart response:", resp);
      setCartFromResponse(resp);
      // eslint-disable-next-line no-console
      console.log("CartContext.refreshCart -> after setCartFromResponse");
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [setCartFromResponse]);

  const upsertItem = useCallback(
    async (productId, quantity) => {
      const userId = getUserId();
      if (!userId) throw new Error("Not authenticated");
      const resp = await cartApi.upsertCartItem(userId, {
        productId,
        quantity,
      });
      // backend expected to return current cart
      // eslint-disable-next-line no-console
      console.log("CartContext.upsertItem -> resp:", resp);
      setCartFromResponse(resp);
      return resp;
    },
    [setCartFromResponse],
  );

  const removeItem = useCallback(
    async (productId) => {
      const userId = getUserId();
      if (!userId) throw new Error("Not authenticated");
      const resp = await cartApi.removeCartItem(userId, productId);
      // eslint-disable-next-line no-console
      console.log("CartContext.removeItem -> resp:", resp);
      setCartFromResponse(resp);
      return resp;
    },
    [setCartFromResponse],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  useEffect(() => {
    // load on mount if authenticated
    refreshCart();

    const onStorage = (ev) => {
      if (ev.key === "authToken") {
        // token changed in another tab
        const token = getAuthToken();
        if (!token) {
          clearCart();
        } else {
          refreshCart();
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshCart, clearCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        loading,
        error,
        refreshCart,
        upsertItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export default CartContext;
