import { notifications } from "@mantine/notifications";

export type NotificationParams = {
	title: string;
	description?: string;
	status: "info" | "warning" | "success" | "error";
};

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
