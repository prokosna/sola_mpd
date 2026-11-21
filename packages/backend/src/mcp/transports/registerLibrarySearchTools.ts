import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	listTagValuesUseCase,
	searchLibraryUseCase,
} from "../application/librarySearchUseCases.js";
import type { SimpleFilter } from "../functions/buildSearchConditions.js";
import { songToOutput } from "../functions/songToOutput.js";
import { toolResultJson } from "../functions/toolResult.js";
import {
	errorToToolResult,
	mcpProfileNameSchema,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

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
	const { mpdClient, mpdProfileStateRepository } = deps;

	server.registerTool(
		"library_list_tag_values",
		{
			title: "List distinct tag values",
			description:
				"Lists the distinct values for a metadata tag (e.g. all artists, all albums, all genres). Server-side via MPD `list`; supports optional filter conditions. Omitting profile uses the workspace default profile.",
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
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const { total, values } = await listTagValuesUseCase({
					tag: args.tag,
					filter: args.filter as SimpleFilter | undefined,
					limit: args.limit ?? DEFAULT_TAG_VALUES,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				return toolResultJson({
					total,
					returned: values.length,
					values,
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
				"Server-side search via MPD `search`. Supports tag equality / contains, ADDED_SINCE for recently-added queries, and pagination via limit/offset. Returns flat song objects. Omitting profile uses the workspace default profile.",
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
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const offset = args.offset ?? 0;
				const songs = await searchLibraryUseCase({
					filter: args.filter as SimpleFilter,
					limit: args.limit ?? DEFAULT_SEARCH_RESULTS,
					offset,
					sort: args.sort,
					sortDescending: args.sort_descending,
					profileName: args.profile,
					mpdClient,
					mpdProfileStateRepository,
				});
				const output = songs.map(songToOutput);
				return toolResultJson({
					returned: output.length,
					offset,
					songs: output,
				});
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
