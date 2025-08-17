import { create, toJsonString } from "@bufbuild/protobuf";
import {
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import type { MpdClient } from "../../mpd";

/**
 * Fetch MPD output devices.
 *
 * Gets device list with ID, name, plugin, and state.
 *
 * @param mpdClient MPD client instance
 * @param profile MPD profile
 * @returns Output devices array
 * @throws On invalid response
 */
export async function fetchOutputDevices(
	mpdClient: MpdClient,
	profile: MpdProfile,
) {
	const res = await mpdClient.command(
		create(MpdRequestSchema, {
			profile,
			command: {
				case: "outputs",
				value: {},
			},
		}),
	);
	if (res.command.case !== "outputs") {
		throw Error(
			`Invalid MPD response: ${toJsonString(MpdResponseSchema, res)}`,
		);
	}
	return res.command.value.devices;
}
