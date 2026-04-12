import { CONFIG_KEY_SAVED_SEARCHES } from "@sola_mpd/shared/src/const/socketio.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import type { SocketIoClient } from "../../../lib/socket_io/SocketIoClient";
import { StateRepositorySocketIo } from "../../common/repositories/StateRepositorySocketIo";

export class SavedSearchesRepositorySocketIo extends StateRepositorySocketIo<SavedSearches> {
	constructor(client: SocketIoClient) {
		super(client, CONFIG_KEY_SAVED_SEARCHES, SavedSearchesSchema);
	}
}
