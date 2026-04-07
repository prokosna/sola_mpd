import { API_CONFIGS_COMMON_SONG_TABLE_STATE } from "@sola_mpd/shared/src/const/api.js";
import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { HttpClient } from "../../../lib/http/HttpClient";
import { StateRepositoryHttp } from "../../common/repositories/StateRepositoryHttp";

export class SongTableStateRepositoryHttp extends StateRepositoryHttp<SongTableState> {
	constructor(client: HttpClient) {
		super(client, API_CONFIGS_COMMON_SONG_TABLE_STATE, SongTableStateSchema);
	}
}
