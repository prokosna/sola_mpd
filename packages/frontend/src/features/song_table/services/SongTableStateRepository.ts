import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

/**
 * Song table state repository.
 */
export interface SongTableStateRepository {
  fetch: () => Promise<SongTableState>;
  save: (songTableState: SongTableState) => Promise<void>;
}
