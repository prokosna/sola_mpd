import { CONFIG_KEY_RECENTLY_ADDED_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { MessagingClient } from "../../../../lib/messaging/MessagingClient";
import { StateRepositorySocketIo } from "../../../common/repositories/StateRepositorySocketIo";

export class RecentlyAddedStateRepositorySocketIo extends StateRepositorySocketIo<RecentlyAddedState> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_RECENTLY_ADDED_STATE, RecentlyAddedStateSchema);
	}
}
