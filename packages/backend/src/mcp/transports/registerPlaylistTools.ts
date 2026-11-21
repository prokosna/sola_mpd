import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	addUrisToPlaylistUseCase,
	getPlaylistSongsUseCase,
	listPlaylistsUseCase,
	loadPlaylistIntoQueueUseCase,
	savePlaylistFromQueueUseCase,
} from "../application/playlistUseCases.js";
import { songToOutput } from "../functions/songToOutput.js";
import {
	toolError,
	toolResultJson,
	toolResultText,
} from "../functions/toolResult.js";
import {
	errorMessage,
	errorToToolResult,
	mcpProfileNameSchema,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerPlaylistTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, mpdProfileStateRepository } = deps;

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
				const playlists = await listPlaylistsUseCase({
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultJson({
					playlists: playlists.map((p) => ({
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
				const songs = await getPlaylistSongsUseCase({
					name: args.name,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultJson({
					name: args.name,
					songs: songs.map(songToOutput),
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
				const result = await addUrisToPlaylistUseCase({
					name: args.name,
					uris: args.uris,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				if (result.failure !== undefined) {
					return toolError(
						`Added ${result.added} of ${args.uris.length} URIs to playlist "${args.name}", then failed on ${result.failure.uri}: ${errorMessage(result.failure.error)}. The remaining URIs were not added.`,
					);
				}
				return toolResultText(
					`added ${result.added} URIs to playlist "${args.name}"`,
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
				await savePlaylistFromQueueUseCase({
					name: args.name,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultText(`queue saved as playlist "${args.name}"`);
			} catch (err) {
				return errorToToolResult(err);
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
				const { requested, skippedUris } = await loadPlaylistIntoQueueUseCase({
					name: args.name,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				const skippedNote =
					skippedUris.length > 0
						? `; skipped ${skippedUris.length} not in the library: ${JSON.stringify(skippedUris)}`
						: "";
				return toolResultText(
					`added ${requested - skippedUris.length} of ${requested} songs from playlist "${args.name}" to the queue${skippedNote}`,
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
