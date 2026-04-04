import { useMutation, useQueryClient } from "@tanstack/react-query";
import notificationApi from "../../api/notificationApi";
import { queryKeys } from "../queries/queryKeys";

export const useDeleteNotification = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationApi.deleteNotification(notificationId),
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

export default useDeleteNotification;
