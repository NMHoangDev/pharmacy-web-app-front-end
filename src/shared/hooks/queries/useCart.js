import { useQuery } from "@tanstack/react-query";
import * as cartApi from "../../../features/cart/api/cartApi";
import { queryKeys } from "./queryKeys";

export const useCartQuery = (userId, options = {}) => {
  const enabled = options?.enabled ?? Boolean(userId);

  return useQuery({
    queryKey: queryKeys.cart(userId),
    queryFn: () => cartApi.getCart(userId),
    enabled,
    // Cart should feel fresh; rely on invalidation after mutations.
    staleTime: 0,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useCartQuery;
