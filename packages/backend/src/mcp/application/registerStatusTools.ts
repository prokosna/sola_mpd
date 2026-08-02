import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { buildMpdStatsResponse } from "../functions/buildMpdStatsResponse.js";
import { buildMpdStatusResponse } from "../functions/buildMpdStatusResponse.js";
import { toolError, toolResultJson } from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import {
	errorToToolResult,
	executeMpdCommand,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

export function registerStatusTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient } = deps;

	server.registerTool(
		"mpd_status",
		{
			title: "Get MPD status & current song",
			description:
				"Returns playback state (play/pause/stop), queue position, elapsed/duration, playback modes, the active output format, and the currently playing song's metadata if any.",
			inputSchema: z.object({}),
		},
		async () => {
			try {
				const profile = resolveCurrentMpdProfile();
				const [statusRes, currentRes] = await Promise.all([
					executeMpdCommand(mpdClient, profile, { case: "status", value: {} }),
					executeMpdCommand(mpdClient, profile, {
						case: "currentsong",
						value: {},
					}),
				]);
				const status =
					statusRes.command?.case === "status"
						? statusRes.command.value.status
						: undefined;
				const currentSong =
					currentRes.command?.case === "currentsong"
						? currentRes.command.value.song
						: undefined;
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
				"Returns library-wide counts (artists, albums, songs), MPD version, and the last database update timestamp. `total_playtime_seconds` is the lifetime sum of song durations played by MPD; `uptime_seconds` is how long the current MPD process has been running (not playback duration).",
			inputSchema: z.object({}),
		},
		async () => {
			try {
				const profile = resolveCurrentMpdProfile();
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "stats",
					value: {},
				});
				if (res.command?.case !== "stats") {
					return toolError("Unexpected response from MPD stats.");
				}
				return toolResultJson(buildMpdStatsResponse(res.command.value.stats));
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
