import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

export interface SongTableStateRepository {
  get: () => Promise<SongTableState>;
  update: (songTableState: SongTableState) => Promise<void>;
}
