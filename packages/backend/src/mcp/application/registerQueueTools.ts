import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { songToOutput } from "../functions/songToOutput.js";
import {
	toolError,
	toolResultJson,
	toolResultText,
} from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import {
	errorToToolResult,
	executeMpdCommand,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

// Default applied when the caller omits `limit`; oversized responses may blow
// the client's context window, which is the caller's risk to take.
const DEFAULT_QUEUE_RESULTS = 1000;

export function registerQueueTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient } = deps;

	server.registerTool(
		"queue_get",
		{
			title: "Get current play queue",
			description: "Returns songs currently in the play queue.",
			inputSchema: {
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Max rows to return. Default ${DEFAULT_QUEUE_RESULTS}. Very large values may exceed your context window.`,
					),
			},
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "playlistinfo",
					value: {},
				});
				if (res.command?.case !== "playlistinfo") {
					return toolError("Unexpected response from MPD playlistinfo.");
				}
				const all = res.command.value.songs.map(songToOutput);
				const limit = args.limit ?? DEFAULT_QUEUE_RESULTS;
				return toolResultJson({
					total: all.length,
					returned: Math.min(all.length, limit),
					songs: all.slice(0, limit),
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"queue_add",
		{
			title: "Add to play queue",
			description:
				"Appends a URI (file path returned by library_search / library_query_sql, or an MPD-recognized directory) to the play queue.",
			inputSchema: { uri: z.string().min(1) },
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				await executeMpdCommand(mpdClient, profile, {
					case: "add",
					value: { uri: args.uri },
				});
				return toolResultText(`added: ${args.uri}`);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"queue_clear",
		{
			title: "Clear play queue",
			description: "Removes every song from the play queue.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = resolveCurrentMpdProfile();
				await executeMpdCommand(mpdClient, profile, {
					case: "clear",
					value: {},
				});
				return toolResultText("queue cleared");
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
