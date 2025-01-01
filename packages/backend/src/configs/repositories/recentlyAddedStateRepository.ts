import { DB_FILE_RECENTLY_ADDED_STATE } from "@sola_mpd/domain/src/const/database.js";
import {
  RecentlyAddedFilter,
  RecentlyAddedState,
} from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FileRepository } from "./FileRepository.js";

export const recentlyAddedStateRepository =
  new FileRepository<RecentlyAddedState>(
    DB_FILE_RECENTLY_ADDED_STATE,
    new RecentlyAddedState({
      filters: [
        new RecentlyAddedFilter({
          tag: Song_MetadataTag.ALBUM,
        }),
        new RecentlyAddedFilter({
          tag: Song_MetadataTag.ARTIST,
        }),
        new RecentlyAddedFilter({
          tag: Song_MetadataTag.COMPOSER,
        }),
      ],
    }),
  );
