export interface AdvancedSearchMessageHandler {
	command: (msg: Uint8Array) => Promise<Uint8Array>;
}
