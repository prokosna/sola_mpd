import { registerAdvancedSearchHandlers } from "./advanced_search/transports/registerAdvancedSearchHandlers.js";
import { registerConfigHandlers } from "./configs/transports/registerConfigHandlers.js";
import type { BackendDependencies } from "./createBackendDependencies.js";
import type { MessagingServer } from "./lib/messaging/MessagingServer.js";
import { registerMpdHandlers } from "./mpd/transports/registerMpdHandlers.js";
import { registerPluginHandlers } from "./plugins/transports/registerPluginHandlers.js";
import { registerViewStateBlobHandlers } from "./view_state_blobs/transports/registerViewStateBlobHandlers.js";

export function registerMessagingHandlers(
	server: MessagingServer,
	deps: BackendDependencies,
): void {
	registerMpdHandlers(server, deps);
	registerPluginHandlers(server, deps);
	registerAdvancedSearchHandlers(server, deps);
	registerConfigHandlers(server, deps);
	registerViewStateBlobHandlers(server, deps);
}
