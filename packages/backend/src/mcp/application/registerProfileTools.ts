import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import { toolResultJson } from "../functions/toolResult.js";
import {
	listMpdProfiles,
	resolveCurrentMpdProfile,
} from "../utils/currentMpdProfile.js";
import type { RegisterMcpToolsDeps } from "./mcpToolHelpers.js";

export function registerProfileTools(
	server: McpServer,
	_deps: RegisterMcpToolsDeps,
): void {
	server.registerTool(
		"mpd_profiles",
		{
			title: "List MPD profiles",
			description:
				"Returns all MPD profiles configured in sola_mpd and indicates which one is currently active. Profile selection is controlled in the sola_mpd UI; this tool is read-only.",
			inputSchema: {},
		},
		async () => {
			const profiles = listMpdProfiles();
			let current: MpdProfile | undefined;
			try {
				current = resolveCurrentMpdProfile();
			} catch {
				current = undefined;
			}
			return toolResultJson({
				current: current
					? { name: current.name, host: current.host, port: current.port }
					: undefined,
				profiles: profiles.map((p) => ({
					name: p.name,
					host: p.host,
					port: p.port,
				})),
			});
		},
	);
}
