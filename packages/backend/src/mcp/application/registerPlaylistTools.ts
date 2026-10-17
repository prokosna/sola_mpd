import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { findSkippedPlaylistUris } from "../functions/findSkippedPlaylistUris.js";
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
				"Returns names of MPD stored playlists with their last-modified timestamp. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
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
			description:
				"Returns the songs of a stored playlist. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				name: z.string().min(1),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
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

	server.registerTool(
		"playlist_add",
		{
			title: "Add songs to a stored playlist",
			description:
				"Appends song URIs (the `path` values returned by library_search, library_query_sql, queue_get, or playlist_get) to the end of a stored playlist, in the given order. Creates the playlist if it does not exist. Never removes or reorders existing entries. URIs are added one at a time; if one fails, the call stops there and returns an error stating how many URIs were added and which URI failed. URIs added before the failure stay in the playlist, so retry only the remaining ones. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				name: z.string().min(1).describe("Stored playlist name."),
				uris: z
					.array(z.string().min(1))
					.min(1)
					.describe("Song URIs to append, in order."),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
				const result = await executeMpdCommandsSequentially(
					mpdClient,
					profile,
					args.uris.map((uri) => ({
						case: "playlistadd",
						value: { name: args.name, uri },
					})),
				);
				if (result.failure !== undefined) {
					return toolError(
						`Added ${result.completed} of ${args.uris.length} URIs to playlist "${args.name}", then failed on ${args.uris[result.failure.index]}: ${errorMessage(result.failure.error)}. The remaining URIs were not added.`,
					);
				}
				return toolResultText(
					`added ${result.completed} URIs to playlist "${args.name}"`,
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"playlist_save_queue",
		{
			title: "Save play queue as a new stored playlist",
			description:
				"Saves the current play queue as a new stored playlist. Never overwrites: if a playlist with this name already exists, MPD rejects the call and the error is returned unchanged; choose another name, or use playlist_add to append to the existing playlist. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				name: z.string().min(1).describe("Name for the new stored playlist."),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
				await executeMpdCommand(mpdClient, profile, {
					case: "save",
					value: { name: args.name },
				});
				return toolResultText(`queue saved as playlist "${args.name}"`);
			} catch (err) {
				return toolError(
					`Failed to save the queue as playlist "${args.name}": ${errorMessage(err)}`,
				);
			}
		},
	);

	server.registerTool(
		"playlist_load",
		{
			title: "Load a stored playlist into the play queue",
			description:
				"Appends every song of a stored playlist to the end of the play queue, in playlist order. Does not clear the queue or start playback; use queue_clear and playback_control for that. Songs whose files no longer exist in the library are skipped and listed in the result. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				name: z.string().min(1).describe("Stored playlist name."),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile(args.profile);
				const playlistRes = await executeMpdCommand(mpdClient, profile, {
					case: "listplaylistinfo",
					value: { name: args.name },
				});
				if (playlistRes.command?.case !== "listplaylistinfo") {
					return toolError("Unexpected response from MPD listplaylistinfo.");
				}
				const uris = playlistRes.command.value.songs.map((song) => song.path);
				const statusRes = await executeMpdCommand(mpdClient, profile, {
					case: "status",
					value: {},
				});
				if (statusRes.command?.case !== "status") {
					return toolError("Unexpected response from MPD status.");
				}
				const queueLengthBefore =
					statusRes.command.value.status?.playQueueLength ?? 0;
				await executeMpdCommand(mpdClient, profile, {
					case: "load",
					value: { name: args.name },
				});
				let appendedUris: string[];
				try {
					const queueRes = await executeMpdCommand(mpdClient, profile, {
						case: "playlistinfo",
						value: {},
					});
					if (queueRes.command?.case !== "playlistinfo") {
						throw new Error("Unexpected response from MPD playlistinfo.");
					}
					appendedUris = queueRes.command.value.songs
						.slice(queueLengthBefore)
						.map((song) => song.path);
				} catch (err) {
					return toolError(
						`Loaded playlist "${args.name}" into the queue, but could not read the queue back to find skipped songs: ${errorMessage(err)}`,
					);
				}
				const skipped = findSkippedPlaylistUris(uris, appendedUris);
				const skippedNote =
					skipped.length > 0
						? `; skipped ${skipped.length} not in the library: ${JSON.stringify(skipped)}`
						: "";
				return toolResultText(
					`added ${uris.length - skipped.length} of ${uris.length} songs from playlist "${args.name}" to the queue${skippedNote}`,
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
