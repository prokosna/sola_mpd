// Channel names are defined in @sola_mpd/shared/src/const/socketio.ts.
// They are hardcoded here because the preload runs in Electron's sandboxed
// renderer, which cannot require workspace packages at runtime, and the
// bundler (tsdown) does not inline workspace dependencies.

export const CONFIG_KEYS = [
	"browser_state",
	"common_song_table_state",
	"mpd_profile_state",
	"plugin_state",
	"saved_searches",
	"recently_added_state",
] as const;

export const ALLOWED_INVOKE_CHANNELS = new Set<string>([
	"socketio_mpd_command",
	"socketio_mpd_command_bulk",
	"socketio_mpd_subscribe",
	"socketio_mpd_unsubscribe",
	"socketio_plugin_register",
	"socketio_plugin_execute",
	"socketio_advanced_search",
	"socketio_view_state_blob_save",
	"socketio_view_state_blob_fetch",
	...CONFIG_KEYS.flatMap((key) => [
		`socketio_config_fetch_${key}`,
		`socketio_config_save_${key}`,
	]),
]);

// socketio_config_changed has no desktop sender — one client cannot race with
// itself — but the renderer subscribes on every transport, and `on` throws for
// a channel that is not listed.
export const ALLOWED_RECEIVE_CHANNELS = new Set<string>([
	"socketio_mpd_event",
	"socketio_config_changed",
]);

export function isPluginCallbackChannel(channel: string): boolean {
	return /^\d+_[\d.]+$/.test(channel);
}

export function isAllowedInvokeChannel(channel: string): boolean {
	return ALLOWED_INVOKE_CHANNELS.has(channel);
}

export function isAllowedReceiveChannel(channel: string): boolean {
	return (
		ALLOWED_RECEIVE_CHANNELS.has(channel) || isPluginCallbackChannel(channel)
	);
}
