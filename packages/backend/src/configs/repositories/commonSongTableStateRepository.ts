import { DB_FILE_COMMON_SONG_TABLE_STATE } from "@sola_mpd/domain/src/const/database.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";
import { CommonSongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";

import { FileRepository } from "./FileRepository.js";

export const commonSongTableStateRepository =
  new FileRepository<CommonSongTableState>(
    DB_FILE_COMMON_SONG_TABLE_STATE,
    new CommonSongTableState({
      columns: [
        {
          tag: Song_MetadataTag.TITLE,
          widthFlex: 1,
        },
        {
          tag: Song_MetadataTag.ARTIST,
          widthFlex: 1,
        },
        {
          tag: Song_MetadataTag.ALBUM,
          widthFlex: 1,
        },
      ],
    }),
  );
