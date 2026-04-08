import { useCallback } from "react";
import { useAppContext } from "../../app/contexts/AppContext";
import { notifyAfterSuccess as notifyAfterSuccessAction } from "../services/notificationService";

const useNotificationAction = () => {
  const { refreshNotifications, refreshUnreadCount } = useAppContext();

  const notifyAfterSuccess = useCallback(
    async ({ action, notificationPayload, options = {} }) => {
      return notifyAfterSuccessAction({
        action,
        notificationPayload,
        refreshNotifications,
        refreshUnreadCount,
        onNotificationError: (error) => {
          if (options?.silent !== true) {
            console.error(
              options?.errorMessage ||
                "Failed to create notification after successful action:",
              error,
            );
          }
        },
      });
    },
    [refreshNotifications, refreshUnreadCount],
  );

  return {
    notifyAfterSuccess,
  };
};

export default useNotificationAction;
