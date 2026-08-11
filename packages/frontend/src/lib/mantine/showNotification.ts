import { notifications } from "@mantine/notifications";

export type NotificationParams = {
	title: string;
	description?: string;
	status: "info" | "warning" | "success" | "error";
};

// Mantine's `notifications.show` is backed by a module-scoped store, not React
// context, so this works from atoms and services too, as long as
// <Notifications /> is mounted somewhere in the tree.
export function showNotification({
	title,
	description,
	status,
}: NotificationParams): void {
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
}
