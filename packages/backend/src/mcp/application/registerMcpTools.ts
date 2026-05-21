import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { RegisterMcpToolsDeps } from "./mcpToolHelpers.js";
import { registerLibraryAnalyticsTools } from "./registerLibraryAnalyticsTools.js";
import { registerLibrarySearchTools } from "./registerLibrarySearchTools.js";
import { registerLibrarySqlTools } from "./registerLibrarySqlTools.js";
import { registerPlaybackTools } from "./registerPlaybackTools.js";
import { registerPlaylistTools } from "./registerPlaylistTools.js";
import { registerProfileTools } from "./registerProfileTools.js";
import { registerQueueTools } from "./registerQueueTools.js";
import { registerStatusTools } from "./registerStatusTools.js";

export type { RegisterMcpToolsDeps } from "./mcpToolHelpers.js";

export function registerMcpTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	registerProfileTools(server, deps);
	registerStatusTools(server, deps);
	registerPlaybackTools(server, deps);
	registerQueueTools(server, deps);
	registerPlaylistTools(server, deps);
	registerLibrarySearchTools(server, deps);
	registerLibraryAnalyticsTools(server, deps);
	registerLibrarySqlTools(server, deps);
}
