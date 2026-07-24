import { create, type MessageInitShape } from "@bufbuild/protobuf";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
	type MpdRequest,
	type MpdResponse,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import {
	type MpdProfile,
	MpdProfileSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { vi } from "vitest";

import type { MpdClient } from "../../mpd/services/MpdClient.js";
import type { LibraryIndex } from "../services/LibraryIndex.js";

export type CapturedTool = {
	name: string;
	config: {
		title?: string;
		description?: string;
		inputSchema?: unknown;
	};
	cb: (args: unknown) => Promise<CallToolResult>;
};

export type FakeMcpServer = {
	registerTool: (
		name: string,
		config: CapturedTool["config"],
		cb: CapturedTool["cb"],
	) => void;
	tools: Map<string, CapturedTool>;
	call: (name: string, args?: unknown) => Promise<CallToolResult>;
};

/**
 * Capture-only McpServer stand-in: tool callbacks are stored on the map so
 * tests can invoke them directly without spinning up an MCP transport.
 */
export function createFakeMcpServer(): FakeMcpServer {
	const tools = new Map<string, CapturedTool>();
	return {
		registerTool: (name, config, cb) => {
			tools.set(name, { name, config, cb });
		},
		tools,
		call: async (name, args) => {
			const tool = tools.get(name);
			if (tool === undefined) {
				throw new Error(`tool not registered: ${name}`);
			}
			return tool.cb(args ?? {});
		},
	};
}

export function makeProfile(): MpdProfile {
	return create(MpdProfileSchema, {
		name: "test",
		host: "localhost",
		port: 6600,
	});
}

export function makeMpdResponse(
	init: MessageInitShape<typeof MpdResponseSchema>,
): MpdResponse {
	return create(MpdResponseSchema, init);
}

export function makeMpdClient(
	respond: (req: MpdRequest) => MpdResponse | Promise<MpdResponse>,
): MpdClient {
	return {
		execute: vi.fn(async (req: MpdRequest) => respond(req)),
		executeBulk: vi.fn(async () => undefined),
		subscribe: vi.fn(async () => () => undefined),
		unsubscribe: vi.fn(async () => true),
	};
}

export function makeLibraryIndex(
	overrides: Partial<LibraryIndex> = {},
): LibraryIndex {
	return {
		refreshIfNeeded: vi.fn(() => false),
		stats: vi.fn(() => ({
			song_count: 0,
			last_built_at: null,
			last_source_signature: null,
		})),
		topByTag: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		breakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		formatDistribution: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		decadeBreakdown: vi.fn(() => ({ rows: [], distinct_values_seen: 0 })),
		recentlyAddedByArtist: vi.fn(() => ({
			rows: [],
			distinct_values_seen: 0,
		})),
		artistSummary: vi.fn(() => undefined),
		findArtistCandidates: vi.fn(() => []),
		querySql: vi.fn(() => ({
			columns: [],
			rows: [],
			row_count: 0,
			truncated: false,
		})),
		describe: vi.fn(() => ({
			sql_schema: "schema",
			notes: "notes",
		})),
		close: vi.fn(),
		...overrides,
	};
}

export function parseToolJson<T = unknown>(result: CallToolResult): T {
	const text = result.content?.[0];
	if (text === undefined || text.type !== "text") {
		throw new Error("expected text content");
	}
	return JSON.parse(text.text) as T;
}
