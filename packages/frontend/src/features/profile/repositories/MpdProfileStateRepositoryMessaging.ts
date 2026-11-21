import { CONFIG_KEY_MPD_PROFILE_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { StateRepositoryMessaging } from "../../common";

export class MpdProfileStateRepositoryMessaging extends StateRepositoryMessaging<MpdProfileState> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_MPD_PROFILE_STATE, MpdProfileStateSchema);
	}
}
