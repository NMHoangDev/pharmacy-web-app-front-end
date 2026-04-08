import { useQuery } from "@tanstack/react-query";
import * as productApi from "../../../features/medicines/api/productApi";
import { queryKeys } from "./queryKeys";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const useProductDetail = (idOrSlug, options = {}) => {
  const enabled = options?.enabled ?? Boolean(idOrSlug);

  return useQuery({
    queryKey: queryKeys.productDetail(idOrSlug),
    queryFn: () => productApi.getProductBySlug(idOrSlug),
    enabled,
    staleTime: FIVE_MINUTES_MS,
    ...options,
  });
};

export default useProductDetail;
