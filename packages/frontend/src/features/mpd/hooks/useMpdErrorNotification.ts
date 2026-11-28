import { useEffect } from "react";

import { showNotification } from "../../../lib/mantine/showNotification";
import { MPD_ERROR_NOTIFICATION_WINDOW_MS } from "../const/mpdErrorNotification";
import { shouldNotifyMpdError } from "../functions/mpdErrorNotification";
import { MpdCommandError } from "../types/MpdCommandError";

// Only rejections no caller handled reach here, so failures a caller already
// reports (profile validation, paged loads) are not notified twice.
export function useMpdErrorNotification(): void {
	useEffect(() => {
		const lastNotifiedAt = new Map<string, number>();
		const onUnhandledRejection = (event: PromiseRejectionEvent) => {
			if (!(event.reason instanceof MpdCommandError)) {
				return;
			}
			event.preventDefault();
			console.error(event.reason);
			const message = event.reason.message;
			const now = Date.now();
			if (
				!shouldNotifyMpdError(
					lastNotifiedAt,
					message,
					now,
					MPD_ERROR_NOTIFICATION_WINDOW_MS,
				)
			) {
				return;
			}
			lastNotifiedAt.set(message, now);
			showNotification({
				title: "MPD command failed",
				description: message,
				status: "error",
			});
		};
		window.addEventListener("unhandledrejection", onUnhandledRejection);
		return () => {
			window.removeEventListener("unhandledrejection", onUnhandledRejection);
		};
	}, []);
}
