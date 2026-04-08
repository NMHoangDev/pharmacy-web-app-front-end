import { useQuery } from "@tanstack/react-query";
import adminOrderApi from "../../../features/admin/api/adminOrderApi";
import { queryKeys } from "./queryKeys";

export const useOrderStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orderStats(params),
    queryFn: () => adminOrderApi.getOrderStats(params),
    staleTime: 20 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useOrderStats;
