import type { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";

/**
 * Repository interface for managing browser state persistence.
 *
 * Provides methods for:
 * - Fetching saved browser state from storage
 * - Saving current browser state to storage
 *
 * @interface
 */
export interface BrowserStateRepository {
	fetch: () => Promise<BrowserState>;
	save: (browserState: BrowserState) => Promise<void>;
}
