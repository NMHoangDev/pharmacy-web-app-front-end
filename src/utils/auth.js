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
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
  clearAuthUser,
} from "../auth/authStorage";

export { decodeJwt, getRolesFromToken, hasAnyRole, isTokenExpired };
export { getAccessToken, setAccessToken, clearAccessToken };
export { getRefreshToken, setRefreshToken, clearRefreshToken };
export { clearAuthUser };

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
  const refreshToken = getRefreshToken();
  const hasRefreshToken = Boolean(String(refreshToken || "").trim());

  // If access token is expired but refresh token still exists,
  // let centralized interceptors refresh transparently.
  if ((!token || isTokenExpired(token)) && !hasRefreshToken) {
    clearAccessToken();
    clearRefreshToken();
    navigate("/login", { state: { from: fromLocation }, replace: true });
    return false;
  }
  return true;
};
