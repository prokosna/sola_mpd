import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import { mpdProfileStateRepository } from "../../configs/repositories/ConfigRepositoryFile.js";

export class NoCurrentMpdProfileError extends Error {
	constructor() {
		super(
			"No current MPD profile is selected. Configure a profile in the sola_mpd UI first.",
		);
		this.name = "NoCurrentMpdProfileError";
	}
}

/**
 * Resolves the active MPD profile from the persisted profile state.
 * The MCP layer reuses the same `MpdProfileState` the frontend writes,
 * so switching profiles in the UI is immediately visible to MCP tools.
 */
export function resolveCurrentMpdProfile(): MpdProfile {
	const state = mpdProfileStateRepository.get();
	if (state.currentProfile === undefined) {
		throw new NoCurrentMpdProfileError();
	}
	return state.currentProfile;
}

export function listMpdProfiles(): MpdProfile[] {
	return mpdProfileStateRepository.get().profiles;
}
