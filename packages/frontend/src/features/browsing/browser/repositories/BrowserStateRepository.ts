import type { BrowserState } from "@sola_mpd/shared/src/models/browser_pb.js";
import type { StateRepository } from "../../../common/repositories/StateRepository";

export type BrowserStateRepository = StateRepository<BrowserState>;
