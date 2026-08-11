// Browser and Recently Added use distinct inline params so a leftover from one
// page never leaks into the other. The blob token is shared: it is a generic
// content-addressed reference regardless of which feature minted it.
export const BROWSER_SELECTION_QUERY_PARAM = "bsel";
export const RECENTLY_ADDED_SELECTION_QUERY_PARAM = "rasel";
export const VIEW_STATE_BLOB_QUERY_PARAM = "vs";
