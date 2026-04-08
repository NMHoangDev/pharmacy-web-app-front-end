import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/useAuth";

export const useLogout = (options = {}) => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Local logout only (clears token/storage via AuthContext).
      logout();
      return true;
    },
    onSuccess: async (...args) => {
      // Drop all server state after logout to prevent leaking cached data.
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export default useLogout;
