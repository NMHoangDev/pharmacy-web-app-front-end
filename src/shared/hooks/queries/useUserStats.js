import { useQuery } from "@tanstack/react-query";
import adminUserApi from "../../../features/admin/api/adminUserApi";
import { queryKeys } from "./queryKeys";

export const useUserStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.userStats(params),
    queryFn: () => adminUserApi.getUserStats(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useUserStats;
