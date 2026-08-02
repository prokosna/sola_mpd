// Socket IO
export const SOCKETIO_MESSAGE = "socketio_message";

// Socket IO - MPD
export const SOCKETIO_MPD_SUBSCRIBE = "socketio_mpd_subscribe";
export const SOCKETIO_MPD_UNSUBSCRIBE = "socketio_mpd_unsubscribe";
export const SOCKETIO_MPD_EVENT = "socketio_mpd_event";
export const SOCKETIO_MPD_COMMAND = "socketio_mpd_command";
export const SOCKETIO_MPD_COMMAND_BULK = "socketio_mpd_command_bulk";

// Socket IO - plugin
export const SOCKETIO_PLUGIN_REGISTER = "socketio_plugin_register";
export const SOCKETIO_PLUGIN_EXECUTE = "socketio_plugin_execute";

// Socket IO - Advanced Search
export const SOCKETIO_ADVANCED_SEARCH = "socketio_advanced_search";

// Socket IO - Config State
export const SOCKETIO_CONFIG_FETCH = "socketio_config_fetch";
export const SOCKETIO_CONFIG_SAVE = "socketio_config_save";
// Server-initiated: broadcast to every other connected client after a
// successful save so they can refetch the config key that changed.
export const SOCKETIO_CONFIG_CHANGED = "socketio_config_changed";

// Socket IO - View State Blob
export const SOCKETIO_VIEW_STATE_BLOB_SAVE = "socketio_view_state_blob_save";
export const SOCKETIO_VIEW_STATE_BLOB_FETCH = "socketio_view_state_blob_fetch";

export const CONFIG_KEY_BROWSER_STATE = "browser_state";
export const CONFIG_KEY_COMMON_SONG_TABLE_STATE = "common_song_table_state";
export const CONFIG_KEY_MPD_PROFILE_STATE = "mpd_profile_state";
export const CONFIG_KEY_PLUGIN_STATE = "plugin_state";
export const CONFIG_KEY_SAVED_SEARCHES = "saved_searches";
export const CONFIG_KEY_RECENTLY_ADDED_STATE = "recently_added_state";
