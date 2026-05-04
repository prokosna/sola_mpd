// Per-step extension for the progressive Recently Added load. One
// scroll-triggered load extends the visible range by STEP_DAYS until either
// the loaded count reaches `stats.songs` or the cutoff exceeds MAX_DAYS (a
// safety bound for libraries that contain songs without a known `added`
// time, which the server-side filter cannot return).
export const RECENTLY_ADDED_STEP_DAYS = 30;
export const RECENTLY_ADDED_MAX_DAYS = 36500;
