import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { songToOutput } from "../functions/songToOutput.js";
import {
	toolError,
	toolResultJson,
	toolResultText,
} from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "./currentMpdProfile.js";
import {
	errorMessage,
	errorToToolResult,
	executeMpdCommand,
	executeMpdCommandsSequentially,
	mcpProfileNameSchema,
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
			description:
				"Returns songs currently in the play queue. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Max rows to return. Default ${DEFAULT_QUEUE_RESULTS}. Very large values may exceed your context window.`,
					),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
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
				"Appends URIs (file paths returned by library_search / library_query_sql / playlist_get, or MPD-recognized directories) to the end of the play queue. Pass exactly one of `uri` (a single URI) or `uris` (several, added in order). With `uris`, URIs are added one at a time; if one fails, the call stops there and returns an error stating how many URIs were added and which URI failed. URIs added before the failure stay in the queue, so retry only the remaining ones. Omitting profile uses the workspace default profile.",
			inputSchema: z
				.object({
					uri: z.string().min(1).optional().describe("A single URI to add."),
					uris: z
						.array(z.string().min(1))
						.min(1)
						.optional()
						.describe("Several URIs to add, in order."),
					profile: mcpProfileNameSchema,
				})
				.refine((v) => (v.uri === undefined) !== (v.uris === undefined), {
					message: "Provide exactly one of `uri` or `uris`.",
				}),
		},
		async (args) => {
			try {
				if (args.uri !== undefined && args.uris === undefined) {
					const profile = resolveCurrentMpdProfile(args.profile);
					await executeMpdCommand(mpdClient, profile, {
						case: "add",
						value: { uri: args.uri },
					});
					return toolResultText(`added: ${args.uri}`);
				}
				if (args.uri !== undefined || args.uris === undefined) {
					return toolError("Provide exactly one of `uri` or `uris`.");
				}
				const uris = args.uris;
				const profile = resolveCurrentMpdProfile(args.profile);
				const result = await executeMpdCommandsSequentially(
					mpdClient,
					profile,
					uris.map((uri) => ({ case: "add", value: { uri } })),
				);
				if (result.failure !== undefined) {
					return toolError(
						`Added ${result.completed} of ${uris.length} URIs to the queue, then failed on ${uris[result.failure.index]}: ${errorMessage(result.failure.error)}. The remaining URIs were not added.`,
					);
				}
				return toolResultText(`added ${result.completed} URIs to the queue`);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"queue_clear",
		{
			title: "Clear play queue",
			description:
				"Removes every song from the play queue. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
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
