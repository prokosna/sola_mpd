import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { API_CONFIGS_MPD_PROFILE_STATE } from "@sola_mpd/shared/src/const/api.js";
import {
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import type { MpdProfileStateRepository } from "./MpdProfileStateRepository";

export class MpdProfileStateRepositoryHttp
	implements MpdProfileStateRepository
{
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<MpdProfileState> => {
		return this.client.get<MpdProfileState>(
			API_CONFIGS_MPD_PROFILE_STATE,
			(bytes) => fromBinary(MpdProfileStateSchema, bytes),
		);
	};

	save = async (mpdProfileState: MpdProfileState): Promise<void> => {
		return this.client.post(
			API_CONFIGS_MPD_PROFILE_STATE,
			toBinary(MpdProfileStateSchema, mpdProfileState),
		);
	};
}
