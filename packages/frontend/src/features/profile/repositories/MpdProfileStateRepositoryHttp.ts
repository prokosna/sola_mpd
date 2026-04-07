import { API_CONFIGS_MPD_PROFILE_STATE } from "@sola_mpd/shared/src/const/api.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../common/repositories/StateRepositoryHttp";

export class MpdProfileStateRepositoryHttp extends StateRepositoryHttp<MpdProfileState> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_MPD_PROFILE_STATE, MpdProfileStateSchema);
	}
}
