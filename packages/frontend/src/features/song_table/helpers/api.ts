import { API_CONFIGS_COMMON_SONG_TABLE_STATE } from "@sola_mpd/domain/src/const/api.js";
import { CommonSongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { HttpApiClient } from "../../http_api";

export async function fetchCommonSongTableState() {
  return await HttpApiClient.get<CommonSongTableState>(
    API_CONFIGS_COMMON_SONG_TABLE_STATE,
    CommonSongTableState.fromBinary,
  );
}

export async function sendCommonSongTableState(
  commonSongTableState: CommonSongTableState,
) {
  await HttpApiClient.post(
    API_CONFIGS_COMMON_SONG_TABLE_STATE,
    commonSongTableState.toBinary(),
  );
}
