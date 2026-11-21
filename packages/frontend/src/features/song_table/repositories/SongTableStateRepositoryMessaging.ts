import { CONFIG_KEY_COMMON_SONG_TABLE_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { MessagingClient } from "../../../lib/messaging/MessagingClient";
import { StateRepositoryMessaging } from "../../common";

export class SongTableStateRepositoryMessaging extends StateRepositoryMessaging<SongTableState> {
	constructor(client: MessagingClient) {
		super(client, CONFIG_KEY_COMMON_SONG_TABLE_STATE, SongTableStateSchema);
	}
}
