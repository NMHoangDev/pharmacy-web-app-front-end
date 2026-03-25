// Backward-compatible exports.
// New source of truth lives under src/auth/.

import {
  decodeJwt,
  getRolesFromToken,
  hasAnyRole,
  isTokenExpired,
} from "../auth/jwt";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "../auth/authStorage";

export { decodeJwt, getRolesFromToken, hasAnyRole, isTokenExpired };
export { getAccessToken, setAccessToken, clearAccessToken };

// Keep old names as aliases for now to avoid breaking too many files at once,
// but point them to the new implementations.
export const getAuthToken = getAccessToken;
export const setAuthToken = setAccessToken;
export const clearAuthToken = clearAccessToken;

export const getUserId = () => {
  const token = getAccessToken();
  const decoded = decodeJwt(token);
  return decoded ? decoded.sub : null;
};

/**
 * Helper to consolidate redirect logic without importing Router in utils
 */
export const requireAuthOrRedirect = (navigate, fromLocation) => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    clearAccessToken();
    navigate("/login", { state: { from: fromLocation }, replace: true });
    return false;
  }
  return true;
};
