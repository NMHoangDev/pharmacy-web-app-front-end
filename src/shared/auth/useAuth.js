import { useAuthContext } from "./AuthContext";

// Public hook for UI components.
export const useAuth = () => {
  return useAuthContext();
};
