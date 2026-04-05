export interface PluginMessageHandler {
	register: (msg: Uint8Array) => Promise<Uint8Array>;
	execute: (msg: Uint8Array) => AsyncGenerator<[string, Uint8Array]>;
}
