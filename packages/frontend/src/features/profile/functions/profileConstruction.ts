import { clone, create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import type { ProfileInput } from "../types/profileTypes";

export function removeProfileFromState(
	currentState: MpdProfileState,
	profileName: string,
): MpdProfileState | undefined {
	const index = currentState.profiles.findIndex((p) => p.name === profileName);
	if (index < 0) {
		return undefined;
	}
	const newState = clone(MpdProfileStateSchema, currentState);
	newState.profiles.splice(index, 1);
	return newState;
}

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
