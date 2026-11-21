import { CONFIG_KEY_SAVED_SEARCHES } from "@sola_mpd/shared/src/const/socketio.js";
import type { SavedSearches } from "@sola_mpd/shared/src/models/search_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { StateRepositoryMessaging } from "../../common";

export class SavedSearchesRepositoryMessaging extends StateRepositoryMessaging<SavedSearches> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_SAVED_SEARCHES, SavedSearchesSchema);
	}
}
