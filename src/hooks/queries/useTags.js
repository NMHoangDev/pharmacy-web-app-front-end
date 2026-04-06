import { useQuery } from "@tanstack/react-query";
import { getTags } from "../../api/contentApi";

export function useTags(params = {}) {
  return useQuery({
    queryKey: ["tags", params],
    queryFn: () => getTags(params),
    staleTime: 5 * 60 * 1000, // cache 5 phút, tags ít thay đổi
    select: (data) => data?.items || data || [],
  });
}
