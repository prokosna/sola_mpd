import { useToast, UseToastOptions } from "@chakra-ui/react";

/**
 * Parameters for displaying a notification.
 */
export type NotificationParams = {
  /** Title of the notification. */
  title: string;
  /** Optional description for the notification. */
  description?: string;
  /** Status of the notification. */
  status: "info" | "warning" | "success" | "error";
};

/**
 * Custom hook for displaying consistent notifications across the application.
 * Provides a standardized way to show notification messages with predefined styling and duration.
 *
 * @returns A function that takes NotificationParams and displays a notification.
 * @example
 * ```typescript
 * const showNotification = useNotification();
 * showNotification({
 *   title: "Success",
 *   description: "Operation completed successfully",
 *   status: "success"
 * });
 * ```
 */
export function useNotification(): (params: NotificationParams) => void {
  const toast = useToast();

  return ({ title, description, status }: NotificationParams) => {
    const options: UseToastOptions = {
      title,
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "bottom",
    };

    toast(options);
  };
}
