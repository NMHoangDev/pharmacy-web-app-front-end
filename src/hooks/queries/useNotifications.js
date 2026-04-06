import { useQuery } from "@tanstack/react-query";
import notificationApi from "../../api/notificationApi";
import { toNotificationViewModel } from "../../utils/notificationUtils";
import { queryKeys } from "./queryKeys";

const THIRTY_SECONDS_MS = 30 * 1000;

const safeGetNotifications = async (limit) => {
  try {
    return await notificationApi.getMyNotifications(limit);
  } catch (err) {
    const status = Number(err?.status || err?.response?.status || 0);
    if (status === 401 || status === 403) return { items: [], unreadCount: 0 };
    throw err;
  }
};

export const useNotificationsQuery = (limit = 20, options = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications({ limit }),
    queryFn: () => safeGetNotifications(limit),
    staleTime: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
    select: (data) => {
      const items = Array.isArray(data?.items)
        ? data.items.map(toNotificationViewModel)
        : [];
      return {
        items,
        unreadCount: Math.max(0, Number(data?.unreadCount || 0)),
      };
    },
    ...options,
  });
};

export default useNotificationsQuery;
