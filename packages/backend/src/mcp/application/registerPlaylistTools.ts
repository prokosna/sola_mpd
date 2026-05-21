import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { songToOutput } from "../functions/songToOutput.js";
import { toolError, toolResultJson } from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import {
	errorToToolResult,
	executeMpdCommand,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerPlaylistTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient } = deps;

	server.registerTool(
		"playlist_list",
		{
			title: "List stored playlists",
			description:
				"Returns names of MPD stored playlists with their last-modified timestamp.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = resolveCurrentMpdProfile();
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "listplaylists",
					value: {},
				});
				if (res.command?.case !== "listplaylists") {
					return toolError("Unexpected response from MPD listplaylists.");
				}
				return toolResultJson({
					playlists: res.command.value.playlists.map((p) => ({
						name: p.name,
						updated_at:
							p.updatedAt !== undefined
								? new Date(Number(p.updatedAt.seconds) * 1000).toISOString()
								: null,
					})),
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"playlist_get",
		{
			title: "Get songs in a stored playlist",
			description: "Returns the songs of a stored playlist.",
			inputSchema: {
				name: z.string().min(1),
			},
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "listplaylistinfo",
					value: { name: args.name },
				});
				if (res.command?.case !== "listplaylistinfo") {
					return toolError("Unexpected response from MPD listplaylistinfo.");
				}
				return toolResultJson({
					name: args.name,
					songs: res.command.value.songs.map(songToOutput),
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
