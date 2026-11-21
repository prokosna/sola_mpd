import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { listMpdProfilesUseCase } from "../application/profileUseCases.js";
import { toolResultJson } from "../functions/toolResult.js";
import type { RegisterMcpToolsDeps } from "./mcpToolHelpers.js";

export function registerProfileTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	server.registerTool(
		"mpd_profiles",
		{
			title: "List MPD profiles",
			description:
				"Returns all MPD profiles configured in sola_mpd and the workspace default profile (`default_profile`). Per-device profile selection made in the sola_mpd UI is not visible here. Other tools accept an optional `profile` argument (a name from this list) to target a specific profile; omitting it uses `default_profile`.",
			inputSchema: z.object({}),
		},
		async () => {
			const { defaultProfile, profiles } = listMpdProfilesUseCase({
				mpdProfileStateRepository: deps.mpdProfileStateRepository,
			});
			return toolResultJson({
				default_profile: defaultProfile
					? {
							name: defaultProfile.name,
							host: defaultProfile.host,
							port: defaultProfile.port,
						}
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
