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
 * Serves both protocol eras from one endpoint, classified per request: `modern`
 * (2026-07-28, per-request `_meta` envelope) and, through the stateless
 * fallback, the 2025-era revisions. A fresh `McpServer` per request avoids
 * session bookkeeping; deps are shared so the mirror outlives a request.
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
