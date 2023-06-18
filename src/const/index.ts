// Database
export const DB_FILE_LAYOUT_STATE = "./db/layout_state.json";
export const DB_FILE_BROWSER_STATE = "./db/browser_state.json";
export const DB_FILE_SAVED_SEARCHES = "./db/saved_searches.json";
export const DB_FILE_COMMON_SONG_TABLE_STATE =
  "./db/common_song_table_state.json";
export const DB_FILE_MPD_PROFILE_STATE = "./db/mpd_profile_state.json";
export const DB_FILE_PLUGIN_STATE = "./db/plugin_state.json";

// Websocket
export const WS_MESSAGE = "ws_message";

// Websocket - MPD
export const WS_MPD_SUBSCRIBE = "mpd_subscribe";
export const WS_MPD_EVENT = "mpd_event";

// Websocket - plugin
export const WS_PLUGIN_REGISTER = "plugin_register";
export const WS_PLUGIN_EXECUTE = "plugin_execute";

// Frontend - URL
export const ROUTE_HOME_PLAY_QUEUE = "/home/play_queue";
export const ROUTE_HOME_BROWSER = "/home/browser";
export const ROUTE_HOME_PLAYLIST = "/home/playlists";
export const ROUTE_HOME_FILE_EXPLORE = "/home/file_explore";
export const ROUTE_HOME_SEARCH = "/home/search";
export const ROUTE_HOME_PLUGIN = "/home/plugin";
export const ROUTE_HOME_SETTINGS = "/home/settings";

// Frontend - Component ID for a context menu
export const COMPONENT_ID_BROWSER = "browser";
export const COMPONENT_ID_FILE_EXPLORE_MAIN_PANE = "file_explore_main";
export const COMPONENT_ID_PLAY_QUEUE = "play_queue";
export const COMPONENT_ID_PLAYLIST_SIDE_PANE = "playlist_select";
export const COMPONENT_ID_PLAYLIST_MAIN_PANE = "playlist_main";
export const COMPONENT_ID_SEARCH_MAIN_PANE = "search_main";
export const COMPONENT_ID_SEARCH_SIDE_PANE = "search_side";
export const COMPONENT_ID_BROWSER_FILTER_LIST_PREFIX = "browser_filter_list";

// Backend - ENDPOINT
export const ENDPOINT_MPD_COMMAND = "/api/mpd/command";
export const ENDPOINT_MPD_COMMAND_BULK = "/api/mpd/command_bulk";
export const ENDPOINT_MPD_CONNECT = "";
export const ENDPOINT_APP_BROWSER_STATE = "/api/app/browser_state";
export const ENDPOINT_APP_COMMON_SONG_TABLE_STATE =
  "/api/app/common_song_table_state";
export const ENDPOINT_APP_LAYOUT_STATE = "/api/app/layout_state";
export const ENDPOINT_APP_MPD_PROFILE_STATE = "/api/app/mpd_profile_state";
export const ENDPOINT_APP_SAVED_SEARCHES = "/api/app/saved_searches";
export const ENDPOINT_APP_PLUGIN_STATE = "/api/app/plugin_state";
