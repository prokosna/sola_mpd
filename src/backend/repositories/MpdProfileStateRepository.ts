import { FileRepository } from "./FileRepository";

import { DB_FILE_MPD_PROFILE_STATE } from "@/const";
import { MpdProfileState } from "@/models/mpd/mpd_profile";

export const mpdProfileStateRepository = new FileRepository<MpdProfileState>(
  DB_FILE_MPD_PROFILE_STATE,
  MpdProfileState.create({
    profiles: [],
  }),
  MpdProfileState,
);
