import { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";

/**
 * Recently Added state repository.
 */
export interface RecentlyAddedStateRepository {
  fetch: () => Promise<RecentlyAddedState>;
  save: (recentlyAddedState: RecentlyAddedState) => Promise<void>;
}
