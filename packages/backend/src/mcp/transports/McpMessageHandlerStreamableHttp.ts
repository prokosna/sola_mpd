import type { IncomingMessage, ServerResponse } from "node:http";

import {
	type NodeMcpRequestHandler,
	toNodeHandler,
} from "@modelcontextprotocol/node";
import {
	createMcpHandler,
	type McpHttpHandler,
	McpServer,
} from "@modelcontextprotocol/server";

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

function reportMcpError(err: Error): void {
	console.error("MCP request failed:", err);
}

/**
 * Streamable HTTP transport serving both protocol eras from one endpoint:
 * `modern` (2026-07-28, per-request `_meta` envelope) and, through the
 * default stateless fallback, the 2025-era revisions. Clients predating
 * 2026-07-28 keep working unchanged; the era is classified per request.
 *
 * The factory builds a fresh `McpServer` per request: cheap (tool
 * registration is in-process and sub-millisecond) and free of session
 * bookkeeping. Deps (MpdClient, LibraryIndex) are shared so the analytical
 * mirror persists across requests.
 */
export class McpMessageHandlerStreamableHttp implements McpMessageHandler {
	private readonly handler: McpHttpHandler;
	private readonly nodeHandler: NodeMcpRequestHandler;

	constructor(deps: RegisterMcpToolsDeps) {
		this.handler = createMcpHandler(
			() => {
				const server = new McpServer(SERVER_INFO);
				registerMcpTools(server, deps);
				return server;
			},
			{ onerror: reportMcpError },
		);
		this.nodeHandler = toNodeHandler(this.handler, {
			onerror: reportMcpError,
		});
	}

	async handleRequest(
		req: IncomingMessage,
		res: ServerResponse,
		body?: unknown,
	): Promise<void> {
		await this.nodeHandler(req, res, body);
	}

	async close(): Promise<void> {
		await this.handler.close();
	}
}

export const mcpMessageHandlerStreamableHttp: McpMessageHandler =
	new McpMessageHandlerStreamableHttp({
		mpdClient: mpdClientMpd3,
		libraryIndex: libraryIndexSqlite,
	});
