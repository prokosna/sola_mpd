import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";

/**
 * Browser state repository.
 */
export interface BrowserStateRepository {
  fetch: () => Promise<BrowserState>;
  save: (browserState: BrowserState) => Promise<void>;
}
