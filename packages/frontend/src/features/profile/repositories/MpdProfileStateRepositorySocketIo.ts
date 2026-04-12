import { CONFIG_KEY_MPD_PROFILE_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import { StateRepositorySocketIo } from "../../common/repositories/StateRepositorySocketIo";

export class MpdProfileStateRepositorySocketIo extends StateRepositorySocketIo<MpdProfileState> {
	constructor(client: SocketIoClient) {
		super(client, CONFIG_KEY_MPD_PROFILE_STATE, MpdProfileStateSchema);
	}
}
