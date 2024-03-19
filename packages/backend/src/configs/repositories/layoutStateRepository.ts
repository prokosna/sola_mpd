import { DB_FILE_LAYOUT_STATE } from "@sola_mpd/domain/src/const/database.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";

import { FileRepository } from "./FileRepository.js";

export const layoutStateRepository = new FileRepository<LayoutState>(
  DB_FILE_LAYOUT_STATE,
  new LayoutState({
    fileExploreLayout: {
      sidePaneWidth: 300,
    },
    searchLayout: {
      sidePaneWidth: 300,
    },
    browserLayout: {
      sidePaneWidth: 300,
    },
    playlistLayout: {
      sidePaneWidth: 300,
    },
  }),
);
