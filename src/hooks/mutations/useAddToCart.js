import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as cartApi from "../../api/cartApi";
import { queryKeys } from "../queries/queryKeys";

export const useAddToCart = (userId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }) =>
      cartApi.upsertCartItem(userId, { productId, quantity }),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export default useAddToCart;
