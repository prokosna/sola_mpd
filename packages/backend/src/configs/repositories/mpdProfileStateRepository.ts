import { DB_FILE_MPD_PROFILE_STATE } from "@sola_mpd/domain/src/const/database.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import { FileRepository } from "./FileRepository.js";

export const mpdProfileStateRepository = new FileRepository<MpdProfileState>(
	DB_FILE_MPD_PROFILE_STATE,
	new MpdProfileState({
		profiles: [],
	}),
);
