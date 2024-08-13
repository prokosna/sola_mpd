import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

export interface MpdProfileStateRepository {
  get: () => Promise<MpdProfileState>;
  update: (mpdProfileState: MpdProfileState) => Promise<void>;
}
