import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import { mpdProfileStateRepository } from "../../configs/repositories/ConfigRepositoryFile.js";

export class NoCurrentMpdProfileError extends Error {
	constructor() {
		super(
			"No default MPD profile is configured. Set one in the sola_mpd UI under Settings, or pass an explicit profile name (see the mpd_profiles tool).",
		);
		this.name = "NoCurrentMpdProfileError";
	}
}

export class MpdProfileNotFoundError extends Error {
	constructor(name: string) {
		super(
			`No MPD profile named "${name}" is configured. Call the mpd_profiles tool to list the valid profile names.`,
		);
		this.name = "MpdProfileNotFoundError";
	}
}

/**
 * With `name` given, resolves that profile — this is how an MCP client, which
 * has no device of its own, targets a non-default profile. Without it, falls
 * back to the workspace default.
 */
export function resolveCurrentMpdProfile(name?: string): MpdProfile {
	const state = mpdProfileStateRepository.get();
	if (name !== undefined) {
		const profile = state.profiles.find((p) => p.name === name);
		if (profile === undefined) {
			throw new MpdProfileNotFoundError(name);
		}
		return profile;
	}
	if (state.currentProfile === undefined) {
		throw new NoCurrentMpdProfileError();
	}
	return state.currentProfile;
}

export function listMpdProfiles(): MpdProfile[] {
	return mpdProfileStateRepository.get().profiles;
}
