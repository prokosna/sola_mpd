import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";

/**
 * Layout state repository.
 */
export interface LayoutStateRepository {
  fetch: () => Promise<LayoutState>;
  save: (layoutState: LayoutState) => Promise<void>;
}
