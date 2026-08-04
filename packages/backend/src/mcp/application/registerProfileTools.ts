import type { McpServer } from "@modelcontextprotocol/server";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { z } from "zod";

import { toolResultJson } from "../functions/toolResult.js";
import {
	listMpdProfiles,
	resolveCurrentMpdProfile,
} from "./currentMpdProfile.js";
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
				"Returns all MPD profiles configured in sola_mpd and the workspace default profile (`default_profile`). Per-device profile selection made in the sola_mpd UI is not visible here. Other tools accept an optional `profile` argument (a name from this list) to target a specific profile; omitting it uses `default_profile`.",
			inputSchema: z.object({}),
		},
		async () => {
			const profiles = listMpdProfiles();
			let defaultProfile: MpdProfile | undefined;
			try {
				defaultProfile = resolveCurrentMpdProfile();
			} catch {
				defaultProfile = undefined;
			}
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
