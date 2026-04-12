export interface ConfigMessageHandler {
	fetch: (configKey: string) => Buffer;
	save: (configKey: string, data: Buffer) => void;
}
