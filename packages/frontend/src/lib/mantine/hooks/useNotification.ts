import { type NotificationParams, showNotification } from "../showNotification";

export function useNotification(): (params: NotificationParams) => void {
	return showNotification;
}
