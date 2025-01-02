import type { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

/**
 * Repository for managing song table state persistence.
 *
 * Provides methods to save and retrieve song table configuration,
 * including column settings, sorting preferences, and view mode.
 * Abstracts the underlying storage mechanism.
 */
export interface SongTableStateRepository {
	fetch: () => Promise<SongTableState>;
	save: (songTableState: SongTableState) => Promise<void>;
}
