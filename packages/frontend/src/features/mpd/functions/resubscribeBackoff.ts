import {
	RESUBSCRIBE_INITIAL_DELAY_MS,
	RESUBSCRIBE_MAX_DELAY_MS,
} from "../const/resubscribeBackoff";

export function getResubscribeDelayMs(attempt: number): number {
	const delay = RESUBSCRIBE_INITIAL_DELAY_MS * 2 ** Math.max(0, attempt);
	return Math.min(delay, RESUBSCRIBE_MAX_DELAY_MS);
}
