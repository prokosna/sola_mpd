import type { RecentlyAddedState } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import type { StateRepository } from "../../../common/repositories/StateRepository";

export type RecentlyAddedStateRepository = StateRepository<RecentlyAddedState>;
