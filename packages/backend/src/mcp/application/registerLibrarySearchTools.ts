import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	buildSearchConditions,
	type SimpleFilter,
} from "../functions/buildSearchConditions.js";
import { mapSortKeyToMetadataTag } from "../functions/mapSortKeyToMetadataTag.js";
import { songToOutput } from "../functions/songToOutput.js";
import { tagNameToMetadataTag } from "../functions/tagNameToMetadataTag.js";
import { toolError, toolResultJson } from "../functions/toolResult.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import {
	errorToToolResult,
	executeMpdCommand,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

// Defaults applied when the caller omits `limit`.
const DEFAULT_SEARCH_RESULTS = 500;
const DEFAULT_TAG_VALUES = 5000;

const SIMPLE_FILTER_SHAPE = {
	artist: z.string().optional(),
	artist_contains: z.string().optional(),
	album_artist: z.string().optional(),
	album: z.string().optional(),
	album_contains: z.string().optional(),
	title_contains: z.string().optional(),
	genre: z.string().optional(),
	genre_contains: z.string().optional(),
	composer: z.string().optional(),
	label: z.string().optional(),
	date_equals: z.string().optional(),
	added_since: z
		.string()
		.optional()
		.describe(
			"ISO-8601 date or any string Date.parse understands. Requires MPD >= 0.24.",
		),
	uri_starts_with: z.string().optional(),
} as const;

const simpleFilterSchema = z.object(SIMPLE_FILTER_SHAPE);

export function registerLibrarySearchTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient } = deps;

	server.registerTool(
		"library_list_tag_values",
		{
			title: "List distinct tag values",
			description:
				"Lists the distinct values for a metadata tag (e.g. all artists, all albums, all genres). Server-side via MPD `list`; supports optional filter conditions.",
			inputSchema: z.object({
				tag: z.enum([
					"artist",
					"album_artist",
					"album",
					"genre",
					"composer",
					"label",
					"title",
				]),
				filter: simpleFilterSchema.optional(),
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Max values to return. Default ${DEFAULT_TAG_VALUES}. Very large values may exceed your context window.`,
					),
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				const conditions = args.filter
					? buildSearchConditions(args.filter as SimpleFilter)
					: [];
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "list",
					value: { tag: tagNameToMetadataTag(args.tag), conditions },
				});
				if (res.command?.case !== "list") {
					return toolError("Unexpected response from MPD list.");
				}
				const values = res.command.value.values;
				const limit = args.limit ?? DEFAULT_TAG_VALUES;
				return toolResultJson({
					total: values.length,
					returned: Math.min(values.length, limit),
					values: values.slice(0, limit),
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_search",
		{
			title: "Search the library",
			description:
				"Server-side search via MPD `search`. Supports tag equality / contains, ADDED_SINCE for recently-added queries, and pagination via limit/offset. Returns flat song objects.",
			inputSchema: z.object({
				filter: simpleFilterSchema,
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Max results to return. Default ${DEFAULT_SEARCH_RESULTS}. Very large values may exceed your context window.`,
					),
				offset: z.number().int().nonnegative().optional(),
				sort: z
					.enum(["title", "artist", "album", "date", "added", "updated"])
					.optional(),
				sort_descending: z.boolean().optional(),
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				const conditions = buildSearchConditions(args.filter as SimpleFilter);
				if (conditions.length === 0) {
					return toolError(
						"library_search requires at least one filter key. Use library_query_sql for unfiltered analytical queries.",
					);
				}
				const limit = args.limit ?? DEFAULT_SEARCH_RESULTS;
				const offset = args.offset ?? 0;
				const res = await executeMpdCommand(mpdClient, profile, {
					case: "search",
					value: {
						conditions,
						sort: {
							tag: mapSortKeyToMetadataTag(args.sort),
							descending: args.sort_descending ?? false,
						},
						window: { start: offset, end: offset + limit },
					},
				});
				if (res.command?.case !== "search") {
					return toolError("Unexpected response from MPD search.");
				}
				const songs = res.command.value.songs.map(songToOutput);
				return toolResultJson({
					returned: songs.length,
					offset,
					songs,
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
