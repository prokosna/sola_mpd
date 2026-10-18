// Drives only the local elapsed interpolation; MPD is not queried on each tick.
// Half a second keeps timer jitter from skipping a whole-second label.
export const PLAYER_CLOCK_TICK_INTERVAL_MS = 500;

// Recovers from idle events lost while the backend's MPD idle connection
// reconnects (mpd3 retries silently) and from local clock drift.
export const PLAYER_STATUS_RESYNC_INTERVAL_MS = 15_000;
