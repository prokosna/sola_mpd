import { API_CONFIGS_MPD_PROFILE_STATE } from "@sola_mpd/domain/src/const/api.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { HttpApiClient } from "../../http_api";

export async function fetchMpdProfileState() {
  const profile = await HttpApiClient.get<MpdProfileState>(
    API_CONFIGS_MPD_PROFILE_STATE,
    MpdProfileState.fromBinary,
  );
  return profile;
}

export async function sendMpdProfileState(mpdProfileState: MpdProfileState) {
  HttpApiClient.post(API_CONFIGS_MPD_PROFILE_STATE, mpdProfileState.toBinary());
}
