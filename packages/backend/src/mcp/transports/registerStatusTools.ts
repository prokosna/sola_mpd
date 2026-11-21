import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	getMpdStatsUseCase,
	getMpdStatusUseCase,
} from "../application/statusUseCases.js";
import { buildMpdStatsResponse } from "../functions/buildMpdStatsResponse.js";
import { buildMpdStatusResponse } from "../functions/buildMpdStatusResponse.js";
import { toolResultJson } from "../functions/toolResult.js";
import {
	errorToToolResult,
	mcpProfileNameSchema,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerStatusTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, mpdProfileStateRepository } = deps;

	server.registerTool(
		"mpd_status",
		{
			title: "Get MPD status & current song",
			description:
				"Returns playback state (play/pause/stop), queue position, elapsed/duration, playback modes, the active output format, and the currently playing song's metadata if any. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				const { status, currentSong } = await getMpdStatusUseCase({
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultJson(buildMpdStatusResponse(status, currentSong));
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"mpd_stats",
		{
			title: "Get MPD library stats",
			description:
				"Returns library-wide counts (artists, albums, songs), MPD version, and the last database update timestamp. `total_playtime_seconds` is the lifetime sum of song durations played by MPD; `uptime_seconds` is how long the current MPD process has been running (not playback duration). Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				const stats = await getMpdStatsUseCase({
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultJson(buildMpdStatsResponse(stats));
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
