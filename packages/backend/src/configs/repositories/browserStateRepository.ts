import { DB_FILE_BROWSER_STATE } from "@sola_mpd/domain/src/const/database.js";
import {
  BrowserFilter,
  BrowserState,
} from "@sola_mpd/domain/src/models/browser_pb.js";
import { Song_MetadataTag } from "@sola_mpd/domain/src/models/song_pb.js";

import { FileRepository } from "./FileRepository.js";

export const browserStateRepository = new FileRepository<BrowserState>(
  DB_FILE_BROWSER_STATE,
  new BrowserState({
    filters: [
      new BrowserFilter({
        tag: Song_MetadataTag.GENRE,
        order: 0,
        selectedValues: [],
        selectedOrder: -1,
      }),
      new BrowserFilter({
        tag: Song_MetadataTag.ARTIST,
        order: 1,
        selectedValues: [],
        selectedOrder: -1,
      }),
      new BrowserFilter({
        tag: Song_MetadataTag.ALBUM,
        order: 2,
        selectedValues: [],
        selectedOrder: -1,
      }),
      new BrowserFilter({
        tag: Song_MetadataTag.COMPOSER,
        order: 3,
        selectedValues: [],
        selectedOrder: -1,
      }),
    ],
  }),
);
