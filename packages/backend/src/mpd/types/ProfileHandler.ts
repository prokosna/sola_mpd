import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb";

export type ProfileHandler = {
  profile: MpdProfile;
  handle: (name?: string) => void;
};
