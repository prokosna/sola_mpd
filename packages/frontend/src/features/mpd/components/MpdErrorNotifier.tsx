import { useMpdErrorNotification } from "../hooks/useMpdErrorNotification";

export function MpdErrorNotifier() {
	useMpdErrorNotification();
	return null;
}
