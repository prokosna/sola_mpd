// Each backend subscribe attempt already retries the MPD connection for several
// seconds, so these only space out attempts while MPD stays down.
export const RESUBSCRIBE_INITIAL_DELAY_MS = 1_000;
export const RESUBSCRIBE_MAX_DELAY_MS = 30_000;
