import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import {
	getArtistSummaryUseCase,
	getDecadeBreakdownUseCase,
	getFormatDistributionUseCase,
	getRecentlyAddedByArtistUseCase,
	getTagBreakdownUseCase,
	getTopByTagUseCase,
} from "../application/libraryAnalyticsUseCases.js";
import { toolResultJson } from "../functions/toolResult.js";
import {
	errorToToolResult,
	mcpProfileNameSchema,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

const groupableTagSchema = z.enum([
	"artist",
	"album_artist",
	"album",
	"genre",
	"composer",
	"label",
]);

export function registerLibraryAnalyticsTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, libraryIndex, mpdProfileStateRepository } = deps;

	server.registerTool(
		"library_top_by_tag",
		{
			title: "Top values for a metadata tag",
			description:
				"Ranks the top N values of a tag (artist / album / genre / etc.) by song count or total duration across the entire library. Backed by the in-memory analytical mirror. Returns `{ tag, by, rows, distinct_values_seen }`; `distinct_values_seen` is the total distinct non-empty values of the tag before the limit, so `distinct_values_seen=0` means the tag is genuinely absent in the library. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				tag: groupableTagSchema,
				by: z
					.enum(["count", "duration"])
					.optional()
					.describe("Default: count."),
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						"Rows to return. Default 25. Very large values may exceed your context window.",
					),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const by = args.by ?? "count";
				const result = await getTopByTagUseCase({
					tag: args.tag,
					by,
					limit: args.limit ?? 25,
					profileName: args.profile,
					mpdClient,
					libraryIndex,
					mpdProfileStateRepository,
				});
				return toolResultJson({ tag: args.tag, by, ...result });
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_breakdown",
		{
			title: "Full breakdown for a tag",
			description:
				"Returns the song count and total duration for every distinct value of the given tag. Useful for full-library composition analysis. Returns `{ tag, rows, distinct_values_seen }`; `distinct_values_seen` is the total distinct values of the tag in the library (use it to detect truncation when `limit` is set). Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				tag: groupableTagSchema,
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						"Optional row cap. Omit to return every distinct value. Very large libraries may exceed your context window.",
					),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const result = await getTagBreakdownUseCase({
					tag: args.tag,
					limit: args.limit,
					profileName: args.profile,
					mpdClient,
					libraryIndex,
					mpdProfileStateRepository,
				});
				return toolResultJson({ tag: args.tag, ...result });
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_format_distribution",
		{
			title: "Audio format distribution",
			description:
				"Returns song count and total duration grouped by audio format string (encoding/channels/bits/sample-rate). Returns `{ rows, distinct_values_seen }` — `distinct_values_seen` equals `rows.length` here (full enumeration, no limit applied) and confirms how many distinct formats exist in the library. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				return toolResultJson(
					await getFormatDistributionUseCase({
						profileName: args.profile,
						mpdClient,
						libraryIndex,
						mpdProfileStateRepository,
					}),
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_decade_breakdown",
		{
			title: "Release decade breakdown",
			description:
				"Buckets songs by the decade derived from the DATE tag (parses leading 4-digit year). Years outside 1000-2100 and songs without a parseable year fall into '(unknown)'. Returns `{ rows, distinct_values_seen }` — `distinct_values_seen` equals `rows.length` here (full enumeration). Omitting profile uses the workspace default profile.",
			inputSchema: z.object({ profile: mcpProfileNameSchema }),
		},
		async (args) => {
			try {
				return toolResultJson(
					await getDecadeBreakdownUseCase({
						profileName: args.profile,
						mpdClient,
						libraryIndex,
						mpdProfileStateRepository,
					}),
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_recently_added_by_artist",
		{
			title: "Recently added artists",
			description:
				"For each artist, returns the most recent file-added timestamp and song count. Use `since_days` to limit to recent activity, or omit it to find which artists have been quiet for a long time (sort by last_added ASC client-side if needed). Returns `{ rows, distinct_values_seen }`; `distinct_values_seen` is the total distinct artists matching the since filter before the row limit, so you can tell when the limit truncated. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						"Rows to return. Default 50. Very large values may exceed your context window.",
					),
				since_days: z
					.number()
					.int()
					.positive()
					.optional()
					.describe("If set, only consider songs added within this many days."),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				return toolResultJson(
					await getRecentlyAddedByArtistUseCase({
						limit: args.limit ?? 50,
						sinceDays: args.since_days,
						profileName: args.profile,
						mpdClient,
						libraryIndex,
						mpdProfileStateRepository,
					}),
				);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_artist_summary",
		{
			title: "Artist summary",
			description:
				"Aggregates one artist's songs across artist and album_artist tags: counts, total duration, year range, genres, formats, first/last added. On a miss returns `{ found: false, suggestions: [...] }` with loosely matching names so callers can recover from typos or HTML-escaped input. Omitting profile uses the workspace default profile.",
			inputSchema: z.object({
				name: z.string().min(1),
				profile: mcpProfileNameSchema,
			}),
		},
		async (args) => {
			try {
				const result = await getArtistSummaryUseCase({
					name: args.name,
					profileName: args.profile,
					mpdClient,
					libraryIndex,
					mpdProfileStateRepository,
				});
				if (!result.found) {
					return toolResultJson({
						found: false,
						name_searched: args.name,
						suggestions: result.suggestions,
					});
				}
				return toolResultJson({ found: true, ...result.summary });
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
