import { FileRepository } from "./FileRepository";

import { DB_FILE_BROWSER_STATE } from "@/const";
import { BrowserFilter, BrowserState } from "@/models/browser";
import { SongMetadataTag } from "@/models/song";

export const browserStateRepository = new FileRepository<BrowserState>(
  DB_FILE_BROWSER_STATE,
  BrowserState.create({
    filters: [
      BrowserFilter.create({
        tag: SongMetadataTag.GENRE,
        order: 0,
        selectedValues: [],
        selectedOrder: -1,
      }),
      BrowserFilter.create({
        tag: SongMetadataTag.ARTIST,
        order: 1,
        selectedValues: [],
        selectedOrder: -1,
      }),
      BrowserFilter.create({
        tag: SongMetadataTag.ALBUM,
        order: 2,
        selectedValues: [],
        selectedOrder: -1,
      }),
      BrowserFilter.create({
        tag: SongMetadataTag.COMPOSER,
        order: 3,
        selectedValues: [],
        selectedOrder: -1,
      }),
    ],
  }),
  BrowserState
);
