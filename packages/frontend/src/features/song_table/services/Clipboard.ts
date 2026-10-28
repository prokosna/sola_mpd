export interface Clipboard {
	writeText(text: string): Promise<void>;
}
