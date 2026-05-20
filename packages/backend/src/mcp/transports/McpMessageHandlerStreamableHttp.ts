import type { IncomingMessage, ServerResponse } from "node:http";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { mpdClientMpd3 } from "../../mpd/services/MpdClientMpd3.js";
import {
	type RegisterMcpToolsDeps,
	registerMcpTools,
} from "../application/registerMcpTools.js";
import { libraryIndexSqlite } from "../services/LibraryIndexSqlite.js";
import type { McpMessageHandler } from "./McpMessageHandler.js";

const SERVER_INFO = {
	name: "sola-mpd",
	version: "0.1.0",
	title: "sola_mpd MCP server",
} as const;

/**
 * Stateless Streamable-HTTP transport. Every request gets a fresh
 * `McpServer` + transport pair: cheap (tool registration is in-process and
 * sub-millisecond) and avoids the session bookkeeping that stateful mode
 * requires. Deps (MpdClient, LibraryIndex) are shared so the analytical
 * mirror persists across requests.
 */
export class McpMessageHandlerStreamableHttp implements McpMessageHandler {
	constructor(private readonly deps: RegisterMcpToolsDeps) {}

	async handleRequest(
		req: IncomingMessage,
		res: ServerResponse,
		body?: unknown,
	): Promise<void> {
		const server = new McpServer(SERVER_INFO);
		registerMcpTools(server, this.deps);
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});
		res.on("close", () => {
			void transport.close().catch((err) => {
				console.warn("MCP transport close failed:", err);
			});
			void server.close().catch((err) => {
				console.warn("MCP server close failed:", err);
			});
		});
		try {
			await server.connect(transport);
			await transport.handleRequest(req, res, body);
		} catch (err) {
			console.error("MCP request failed:", err);
			if (!res.headersSent) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify({
						jsonrpc: "2.0",
						error: {
							code: -32603,
							message: err instanceof Error ? err.message : String(err),
						},
						id: null,
					}),
				);
			} else {
				res.end();
			}
		}
	}

	async close(): Promise<void> {
		// No long-lived state to close in stateless mode. The shared library
		// index is owned by the composition root.
	}
}

export const mcpMessageHandlerStreamableHttp: McpMessageHandler =
	new McpMessageHandlerStreamableHttp({
		mpdClient: mpdClientMpd3,
		libraryIndex: libraryIndexSqlite,
	});
