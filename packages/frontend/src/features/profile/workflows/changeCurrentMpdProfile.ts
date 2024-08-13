import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

export const changeCurrentMpdProfile = (
  currentMpdProfile: MpdProfile,
  mpdProfileState: MpdProfileState,
): MpdProfileState => {
  if (!mpdProfileState.profiles.includes(currentMpdProfile)) {
    throw new Error(
      `Invalid profile state: ${currentMpdProfile.toJsonString()} is not in profiles`,
    );
  }
  const newMpdProfileState = mpdProfileState.clone();
  newMpdProfileState.currentProfile = currentMpdProfile;
  return newMpdProfileState;
};
