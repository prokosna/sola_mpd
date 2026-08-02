// Query param names for the URL-encoded navigation position (see
// docs/design/state-scoping.md §6.2, §14.3(b)). Browser and Recently Added
// use distinct inline params so a stray leftover from one page never leaks
// into the other; the blob-token fallback is shared because it is a generic,
// content-addressed reference regardless of which feature minted it.
export const BROWSER_SELECTION_QUERY_PARAM = "bsel";
export const RECENTLY_ADDED_SELECTION_QUERY_PARAM = "rasel";
export const VIEW_STATE_BLOB_QUERY_PARAM = "vs";
