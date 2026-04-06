import { useMutation, useQueryClient } from "@tanstack/react-query";
import notificationApi from "../../api/notificationApi";
import { queryKeys } from "../queries/queryKeys";

export const useMarkNotificationRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationApi.markNotificationAsRead(notificationId),
    onSuccess: async (...args) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount() }),
      ]);
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export default useMarkNotificationRead;
