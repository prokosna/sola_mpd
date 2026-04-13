import { contextBridge, ipcRenderer } from "electron";

// Channel names are defined in @sola_mpd/shared/src/const/socketio.ts.
// They are hardcoded here because the preload runs in Electron's sandboxed
// renderer, which cannot require workspace packages at runtime, and the
// bundler (tsdown) does not inline workspace dependencies.

const CONFIG_KEYS = [
	"browser_state",
	"common_song_table_state",
	"mpd_profile_state",
	"plugin_state",
	"saved_searches",
	"recently_added_state",
];

const ALLOWED_INVOKE_CHANNELS = new Set([
	"socketio_mpd_command",
	"socketio_mpd_command_bulk",
	"socketio_mpd_subscribe",
	"socketio_mpd_unsubscribe",
	"socketio_plugin_register",
	"socketio_plugin_execute",
	"socketio_advanced_search",
	...CONFIG_KEYS.flatMap((key) => [
		`socketio_config_fetch_${key}`,
		`socketio_config_save_${key}`,
	]),
]);

const ALLOWED_RECEIVE_CHANNELS = new Set(["socketio_mpd_event"]);

function isPluginCallbackChannel(channel: string): boolean {
	return /^\d+_[\d.]+$/.test(channel);
}

contextBridge.exposeInMainWorld("__SOLA_IPC_BRIDGE__", {
	invoke: (channel: string, payload: Uint8Array): Promise<Uint8Array> => {
		if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
			return Promise.reject(new Error(`IPC channel not allowed: ${channel}`));
		}
		return ipcRenderer.invoke(channel, payload);
	},

	on: (channel: string, callback: (payload: Uint8Array) => void): void => {
		if (
			!ALLOWED_RECEIVE_CHANNELS.has(channel) &&
			!isPluginCallbackChannel(channel)
		) {
			throw new Error(`IPC channel not allowed: ${channel}`);
		}
		ipcRenderer.on(channel, (_event, data: Uint8Array) => {
			callback(data);
		});
	},

	off: (channel: string): void => {
		ipcRenderer.removeAllListeners(channel);
	},
});
