import { useQuery } from "@tanstack/react-query";
import notificationApi from "../../../features/notifications/api/notificationApi";
import { queryKeys } from "./queryKeys";

const THIRTY_SECONDS_MS = 30 * 1000;

const safeUnreadCount = async () => {
  try {
    return await notificationApi.getUnreadNotificationCount();
  } catch (err) {
    const status = Number(err?.status || err?.response?.status || 0);
    if (status === 401 || status === 403) return 0;
    throw err;
  }
};

export const useUnreadCount = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.unreadCount(),
    queryFn: safeUnreadCount,
    staleTime: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useUnreadCount;
