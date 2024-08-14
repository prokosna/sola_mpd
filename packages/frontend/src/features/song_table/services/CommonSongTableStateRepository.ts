import { CommonSongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

export interface CommonSongTableStateRepository {
  get: () => Promise<CommonSongTableState>;
  update: (commonSongTableState: CommonSongTableState) => Promise<void>;
}
