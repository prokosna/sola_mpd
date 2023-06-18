import { FileRepository } from "./FileRepository";

import { DB_FILE_COMMON_SONG_TABLE_STATE } from "@/const";
import { SongMetadataTag } from "@/models/song";
import { CommonSongTableState } from "@/models/song_table";

export const commonSongTableStateRepository =
  new FileRepository<CommonSongTableState>(
    DB_FILE_COMMON_SONG_TABLE_STATE,
    CommonSongTableState.create({
      columns: [
        {
          tag: SongMetadataTag.TITLE,
          widthFlex: 1,
        },
        {
          tag: SongMetadataTag.ARTIST,
          widthFlex: 1,
        },
        {
          tag: SongMetadataTag.ALBUM,
          widthFlex: 1,
        },
      ],
    }),
    CommonSongTableState
  );
