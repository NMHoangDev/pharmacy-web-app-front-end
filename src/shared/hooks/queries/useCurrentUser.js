import { useQuery } from "@tanstack/react-query";
import userApi from "../../../features/account/api/userApi";
import { useAuth } from "../../auth/useAuth";
import { queryKeys } from "./queryKeys";

export const useCurrentUser = (options = {}) => {
  const { isAuthenticated, userId } = useAuth();

  const enabled = options?.enabled ?? Boolean(isAuthenticated && userId);

  return useQuery({
    queryKey: queryKeys.currentUser(),
    queryFn: () => userApi.getUser(userId),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useCurrentUser;
