import type { IncomingMessage, ServerResponse } from "node:http";

export interface McpMessageHandler {
	handleRequest(
		req: IncomingMessage,
		res: ServerResponse,
		body?: unknown,
	): Promise<void>;
	close(): Promise<void>;
}
