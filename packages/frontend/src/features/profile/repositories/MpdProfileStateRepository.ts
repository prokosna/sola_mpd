import type { MpdProfileState } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type { StateRepository } from "../../common/repositories/StateRepository";

export type MpdProfileStateRepository = StateRepository<MpdProfileState>;
