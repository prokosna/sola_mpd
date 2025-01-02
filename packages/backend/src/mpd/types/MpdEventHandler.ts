import type { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb";

export type MpdEventHandler = {
	profile: MpdProfile;
	handle: (name?: string) => void;
};
