export interface AdvancedSearchMessageHandlerPort {
	command: (msg: Uint8Array) => Promise<Uint8Array>;
}
