export interface IpcBridge {
	invoke: (channel: string, payload: Uint8Array) => Promise<Uint8Array>;
	on: (channel: string, callback: (payload: Uint8Array) => void) => void;
	off: (channel: string) => void;
}

declare global {
	interface Window {
		__SOLA_IPC_BRIDGE__?: IpcBridge;
	}
}
