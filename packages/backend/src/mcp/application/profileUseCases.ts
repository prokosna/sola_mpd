import type {
	MpdProfile,
	MpdProfileState,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ConfigRepository } from "../../configs/repositories/ConfigRepository.js";
import {
	listMpdProfiles,
	resolveCurrentMpdProfile,
} from "./currentMpdProfile.js";

export type ListMpdProfilesResult = {
	defaultProfile: MpdProfile | undefined;
	profiles: MpdProfile[];
};

export function listMpdProfilesUseCase(input: {
	mpdProfileStateRepository: ConfigRepository<MpdProfileState>;
}): ListMpdProfilesResult {
	const { mpdProfileStateRepository } = input;
	const profiles = listMpdProfiles(mpdProfileStateRepository);
	let defaultProfile: MpdProfile | undefined;
	try {
		defaultProfile = resolveCurrentMpdProfile(mpdProfileStateRepository);
	} catch {
		defaultProfile = undefined;
	}
	return { defaultProfile, profiles };
}
