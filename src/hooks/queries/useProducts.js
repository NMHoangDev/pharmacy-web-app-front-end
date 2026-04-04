import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as productApi from "../../api/productApi";
import { queryKeys } from "./queryKeys";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => productApi.getProducts(params),
    staleTime: FIVE_MINUTES_MS,
    placeholderData: keepPreviousData,
    ...options,
  });
};

export default useProducts;
