import { FileRepository } from "./FileRepository";

import { DB_FILE_LAYOUT_STATE } from "@/const";
import { LayoutState } from "@/models/layout";

export const layoutStateRepository = new FileRepository<LayoutState>(
  DB_FILE_LAYOUT_STATE,
  LayoutState.create({
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
  LayoutState,
);
