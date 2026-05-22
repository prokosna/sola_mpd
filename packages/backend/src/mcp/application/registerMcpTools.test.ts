import { describe, expect, it, vi } from "vitest";

import { registerMcpTools } from "./registerMcpTools.js";
import {
	createFakeMcpServer,
	makeLibraryIndex,
	makeMpdClient,
	makeMpdResponse,
} from "./testHelpers.js";

vi.mock("../utils/currentMpdProfile.js", () => ({
	NoCurrentMpdProfileError: class extends Error {},
	resolveCurrentMpdProfile: vi.fn(),
	listMpdProfiles: vi.fn(() => []),
}));

describe("registerMcpTools", () => {
	it("wires every register* and exposes the full tool surface", () => {
		const server = createFakeMcpServer();
		registerMcpTools(server as never, {
			mpdClient: makeMpdClient(() => makeMpdResponse({})),
			libraryIndex: makeLibraryIndex(),
		});

		const expected = [
			"mpd_profiles",
			"mpd_status",
			"mpd_stats",
			"playback_control",
			"playback_set_volume",
			"playback_set_mode",
			"queue_get",
			"queue_add",
			"queue_clear",
			"playlist_list",
			"playlist_get",
			"library_list_tag_values",
			"library_search",
			"library_top_by_tag",
			"library_breakdown",
			"library_format_distribution",
			"library_decade_breakdown",
			"library_recently_added_by_artist",
			"library_artist_summary",
			"library_query_sql",
			"library_index_stats",
		];

		for (const name of expected) {
			expect(server.tools.has(name), `expected ${name} to be registered`).toBe(
				true,
			);
		}
	});
});
