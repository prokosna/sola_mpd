import { contextBridge, ipcRenderer } from "electron";
import { isAllowedInvokeChannel, isAllowedReceiveChannel } from "./channels.js";

contextBridge.exposeInMainWorld("__SOLA_IPC_BRIDGE__", {
	invoke: (channel: string, payload: Uint8Array): Promise<Uint8Array> => {
		if (!isAllowedInvokeChannel(channel)) {
			return Promise.reject(new Error(`IPC channel not allowed: ${channel}`));
		}
		return ipcRenderer.invoke(channel, payload);
	},

	on: (channel: string, callback: (payload: Uint8Array) => void): void => {
		if (!isAllowedReceiveChannel(channel)) {
			throw new Error(`IPC channel not allowed: ${channel}`);
		}
		ipcRenderer.on(channel, (_event, data: Uint8Array) => {
			callback(data);
		});
	},

	off: (channel: string): void => {
		if (!isAllowedReceiveChannel(channel)) {
			throw new Error(`IPC channel not allowed: ${channel}`);
		}
		ipcRenderer.removeAllListeners(channel);
	},
});
