import { notifications } from "@mantine/notifications";

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
	return ({ title, description, status }: NotificationParams) => {
		notifications.show({
			title,
			message: description,
			color:
				status === "info"
					? "brand"
					: status === "warning"
						? "yellow"
						: status === "success"
							? "green"
							: "red",
			autoClose: status === "error" ? false : 3000,
		});
	};
}
