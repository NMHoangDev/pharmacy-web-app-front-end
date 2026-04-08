import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPosts } from "../../../features/content/api/contentApi";
import { queryKeys } from "./queryKeys";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const usePosts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.posts(params),
    queryFn: () => getPosts(params),
    staleTime: FIVE_MINUTES_MS,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default usePosts;
