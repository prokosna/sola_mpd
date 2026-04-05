import { create } from "@bufbuild/protobuf";
import { DB_FILE_MPD_PROFILE_STATE } from "@sola_mpd/shared/src/const/database.js";
import {
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";

import { ConfigRepositoryFile } from "./ConfigRepositoryFile.js";

export const mpdProfileStateRepository =
	new ConfigRepositoryFile<MpdProfileState>(
		DB_FILE_MPD_PROFILE_STATE,
		MpdProfileStateSchema,
		create(MpdProfileStateSchema, {
			profiles: [],
		}),
	);
