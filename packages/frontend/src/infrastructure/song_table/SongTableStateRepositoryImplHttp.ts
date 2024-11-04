import { API_CONFIGS_COMMON_SONG_TABLE_STATE } from "@sola_mpd/domain/src/const/api.js";
import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { SongTableStateRepository } from "../../features/song_table";
import { HttpClient } from "../http/HttpClient";

export class SongTableStateRepositoryImplHttp
  implements SongTableStateRepository
{
  constructor(private client: HttpClient) {}

  get = async (): Promise<SongTableState> => {
    return this.client.get<SongTableState>(
      API_CONFIGS_COMMON_SONG_TABLE_STATE,
      SongTableState.fromBinary,
    );
  };

  update = async (commonSongTableState: SongTableState): Promise<void> => {
    return this.client.post(
      API_CONFIGS_COMMON_SONG_TABLE_STATE,
      commonSongTableState.toBinary(),
    );
  };
}
