import { API_CONFIGS_MPD_PROFILE_STATE } from "@sola_mpd/domain/src/const/api.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";

import type { MpdProfileStateRepository } from "../../features/profile";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of MpdProfileStateRepository using HttpClient.
 */
export class MpdProfileStateRepositoryImplHttp
	implements MpdProfileStateRepository
{
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<MpdProfileState> => {
		return this.client.get<MpdProfileState>(
			API_CONFIGS_MPD_PROFILE_STATE,
			MpdProfileState.fromBinary,
		);
	};

	save = async (mpdProfileState: MpdProfileState): Promise<void> => {
		return this.client.post(
			API_CONFIGS_MPD_PROFILE_STATE,
			mpdProfileState.toBinary(),
		);
	};
}
