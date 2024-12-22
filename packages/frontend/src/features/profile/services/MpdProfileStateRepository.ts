import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

/**
 * MPD profile state repository.
 */
export interface MpdProfileStateRepository {
  fetch: () => Promise<MpdProfileState>;
  save: (mpdProfileState: MpdProfileState) => Promise<void>;
}
