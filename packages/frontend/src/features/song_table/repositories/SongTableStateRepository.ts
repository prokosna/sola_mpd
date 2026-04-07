import type { SongTableState } from "@sola_mpd/shared/src/models/song_table_pb.js";
import type { StateRepository } from "../../common/repositories/StateRepository";

export type SongTableStateRepository = StateRepository<SongTableState>;
