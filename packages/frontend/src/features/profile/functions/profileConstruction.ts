import { clone, create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ProfileInput } from "../types/profileTypes";

export function buildMpdProfileStateWithNewProfile(
	currentState: MpdProfileState,
	input: ProfileInput,
): MpdProfileState {
	const profile = create(MpdProfileSchema, {
		name: input.name,
		host: input.host,
		port: input.port,
		password: input.password ?? "",
	});

	const newState = clone(MpdProfileStateSchema, currentState);
	newState.profiles.push(profile);
	if (newState.currentProfile === undefined) {
		newState.currentProfile = profile;
	}

	return newState;
}
