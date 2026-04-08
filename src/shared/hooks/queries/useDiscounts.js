import { useQuery } from "@tanstack/react-query";
import { discountApi } from "../../../features/admin/api/discounts/discountApi";
import { queryKeys } from "./queryKeys";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const useDiscounts = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.discounts(),
    queryFn: () => discountApi.list(),
    staleTime: FIVE_MINUTES_MS,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useDiscounts;
