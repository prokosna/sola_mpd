import { API_CONFIGS_MPD_PROFILE_STATE } from "@sola_mpd/domain/src/const/api.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { MpdProfileStateRepository } from "../../features/profile";
import { HttpClient } from "../http/HttpClient";

export class MpdProfileStateRepositoryHttp
  implements MpdProfileStateRepository
{
  constructor(private client: HttpClient) {}

  get = async (): Promise<MpdProfileState> => {
    const profile = await this.client.get<MpdProfileState>(
      API_CONFIGS_MPD_PROFILE_STATE,
      MpdProfileState.fromBinary,
    );
    return profile;
  };

  update = async (mpdProfileState: MpdProfileState): Promise<void> => {
    this.client.post(API_CONFIGS_MPD_PROFILE_STATE, mpdProfileState.toBinary());
  };
}
