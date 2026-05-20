import { create, type MessageInitShape } from "@bufbuild/protobuf";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	MpdRequestSchema,
	type MpdResponse,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { Song_MetadataTag } from "@sola_mpd/shared/src/models/song_pb.js";
import { z } from "zod";

type MpdRequestCommand = MessageInitShape<typeof MpdRequestSchema>["command"];

import type { MpdClient } from "../../mpd/services/MpdClient.js";
import {
	buildSearchConditions,
	type SimpleFilter,
} from "../functions/buildSearchConditions.js";
import { songToOutput } from "../functions/songToOutput.js";
import {
	toolError,
	toolResultJson,
	toolResultText,
} from "../functions/toolResult.js";
import { validateSelectSql } from "../functions/validateSelectSql.js";
import type {
	LibraryGroupableTag,
	LibraryIndex,
} from "../services/LibraryIndex.js";
import {
	listMpdProfiles,
	NoCurrentMpdProfileError,
	resolveCurrentMpdProfile,
} from "../utils/currentMpdProfile.js";
import { ensureLibraryIndexUseCase } from "./libraryIndexUseCases.js";

// These are *defaults applied when the caller omits `limit`*, not hard caps.
// Callers that understand the trade-off (e.g. need to inspect every distinct
// genre on a 90k-song library) can pass any value; oversized responses may
// blow the client's context window, which is the caller's risk to take.
const DEFAULT_SEARCH_RESULTS = 500;
const DEFAULT_TAG_VALUES = 5000;
const DEFAULT_QUEUE_RESULTS = 1000;
const DEFAULT_SQL_ROWS = 1000;

export type RegisterMcpToolsDeps = {
	mpdClient: MpdClient;
	libraryIndex: LibraryIndex;
};

const groupableTagSchema = z.enum([
	"artist",
	"album_artist",
	"album",
	"genre",
	"composer",
	"label",
]);

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

function profileOrError(): MpdProfile {
	return resolveCurrentMpdProfile();
}

async function execute(
	mpdClient: MpdClient,
	profile: MpdProfile,
	command: MpdRequestCommand,
): Promise<MpdResponse> {
	const request = create(MpdRequestSchema, { profile, command });
	return mpdClient.execute(request);
}

function tagFromName(tagName: LibraryGroupableTag | "title"): Song_MetadataTag {
	switch (tagName) {
		case "artist":
			return Song_MetadataTag.ARTIST;
		case "album_artist":
			return Song_MetadataTag.ALBUM_ARTIST;
		case "album":
			return Song_MetadataTag.ALBUM;
		case "genre":
			return Song_MetadataTag.GENRE;
		case "composer":
			return Song_MetadataTag.COMPOSER;
		case "label":
			return Song_MetadataTag.LABEL;
		case "title":
			return Song_MetadataTag.TITLE;
	}
}

export function registerMcpTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, libraryIndex } = deps;

	const ensureIndex = async (profile: MpdProfile) =>
		ensureLibraryIndexUseCase({ profile, mpdClient, libraryIndex });

	// ----- Profile -----
	server.registerTool(
		"mpd_profiles",
		{
			title: "List MPD profiles",
			description:
				"Returns all MPD profiles configured in sola_mpd and indicates which one is currently active. Profile selection is controlled in the sola_mpd UI; this tool is read-only.",
			inputSchema: {},
		},
		async () => {
			const profiles = listMpdProfiles();
			let current: MpdProfile | undefined;
			try {
				current = resolveCurrentMpdProfile();
			} catch {
				current = undefined;
			}
			return toolResultJson({
				current: current
					? { name: current.name, host: current.host, port: current.port }
					: undefined,
				profiles: profiles.map((p) => ({
					name: p.name,
					host: p.host,
					port: p.port,
				})),
			});
		},
	);

	// ----- Status -----
	server.registerTool(
		"mpd_status",
		{
			title: "Get MPD status & current song",
			description:
				"Returns playback state (play/pause/stop), queue position, elapsed/duration, playback modes, the active output format, and the currently playing song's metadata if any.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				const [statusRes, currentRes] = await Promise.all([
					execute(mpdClient, profile, { case: "status", value: {} }),
					execute(mpdClient, profile, { case: "currentsong", value: {} }),
				]);
				const status =
					statusRes.command?.case === "status"
						? statusRes.command.value.status
						: undefined;
				const currentSong =
					currentRes.command?.case === "currentsong"
						? currentRes.command.value.song
						: undefined;
				return toolResultJson({
					playback_state:
						status?.playbackState !== undefined
							? ["UNKNOWN", "PLAY", "STOP", "PAUSE"][status.playbackState]
							: "UNKNOWN",
					queue_length: status?.playQueueLength ?? 0,
					song_position: status?.song ?? -1,
					song_id: status?.songId ?? -1,
					next_song_position: status?.nextSong ?? -1,
					elapsed_seconds: status?.elapsed ?? null,
					duration_seconds: status?.duration ?? null,
					bitrate_kbps: status?.bitrate ?? null,
					is_repeat: status?.isRepeat ?? false,
					is_random: status?.isRandom ?? false,
					is_single: status?.isSingle ?? false,
					is_consume: status?.isConsume ?? false,
					is_database_updating: status?.isDatabaseUpdating ?? false,
					current_song: currentSong ? songToOutput(currentSong) : undefined,
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"mpd_stats",
		{
			title: "Get MPD library stats",
			description:
				"Returns library-wide counts (artists, albums, songs), accumulated playtime, MPD version, and the last database update timestamp.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				const res = await execute(mpdClient, profile, {
					case: "stats",
					value: {},
				});
				if (res.command?.case !== "stats") {
					return toolError("Unexpected response from MPD stats.");
				}
				const s = res.command.value.stats;
				return toolResultJson({
					version: s?.version ?? "",
					artists_count: s?.artistsCount ?? 0,
					albums_count: s?.albumsCount ?? 0,
					songs_count: s?.songsCount ?? 0,
					total_playtime_seconds: s?.totalPlaytime ?? 0,
					uptime_seconds: s?.uptime ?? 0,
					last_updated:
						s?.lastUpdated !== undefined
							? new Date(Number(s.lastUpdated.seconds) * 1000).toISOString()
							: undefined,
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	// ----- Playback control -----
	server.registerTool(
		"playback_control",
		{
			title: "Playback control",
			description:
				"Controls playback transport. action=play optionally takes queue_position. action=seek requires seek_seconds.",
			inputSchema: {
				action: z.enum([
					"play",
					"pause",
					"resume",
					"stop",
					"next",
					"previous",
					"seek",
				]),
				queue_position: z
					.number()
					.int()
					.nonnegative()
					.optional()
					.describe(
						"Queue position to play (0-indexed). Used only when action=play.",
					),
				seek_seconds: z
					.number()
					.optional()
					.describe(
						"Time offset for seek (within the currently playing song). Used only when action=seek.",
					),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				switch (args.action) {
					case "play":
						if (args.queue_position !== undefined) {
							await execute(mpdClient, profile, {
								case: "play",
								value: {
									target: { case: "pos", value: String(args.queue_position) },
								},
							});
						} else {
							await execute(mpdClient, profile, {
								case: "play",
								value: { target: { case: "pos", value: "0" } },
							});
						}
						break;
					case "pause":
						await execute(mpdClient, profile, {
							case: "pause",
							value: { pause: true },
						});
						break;
					case "resume":
						await execute(mpdClient, profile, {
							case: "pause",
							value: { pause: false },
						});
						break;
					case "stop":
						await execute(mpdClient, profile, { case: "stop", value: {} });
						break;
					case "next":
						await execute(mpdClient, profile, { case: "next", value: {} });
						break;
					case "previous":
						await execute(mpdClient, profile, { case: "previous", value: {} });
						break;
					case "seek": {
						if (args.seek_seconds === undefined) {
							return toolError("action=seek requires seek_seconds.");
						}
						await execute(mpdClient, profile, {
							case: "seek",
							value: {
								time: args.seek_seconds,
								target: { case: "current", value: true },
							},
						});
						break;
					}
				}
				return toolResultText(`ok: ${args.action}`);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"playback_set_volume",
		{
			title: "Set playback volume",
			description: "Sets MPD output volume in the range 0-100.",
			inputSchema: {
				volume: z.number().int().min(0).max(100),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await execute(mpdClient, profile, {
					case: "setvol",
					value: { vol: args.volume },
				});
				return toolResultText(`volume set to ${args.volume}`);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"playback_set_mode",
		{
			title: "Set playback modes",
			description:
				"Sets playback modes. Only the keys you pass are changed; omitted keys are left alone.",
			inputSchema: {
				repeat: z.boolean().optional(),
				random: z.boolean().optional(),
				single: z.boolean().optional(),
				consume: z.boolean().optional(),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				const changed: string[] = [];
				if (args.repeat !== undefined) {
					await execute(mpdClient, profile, {
						case: "repeat",
						value: { enable: args.repeat },
					});
					changed.push(`repeat=${args.repeat}`);
				}
				if (args.random !== undefined) {
					await execute(mpdClient, profile, {
						case: "random",
						value: { enable: args.random },
					});
					changed.push(`random=${args.random}`);
				}
				if (args.single !== undefined) {
					await execute(mpdClient, profile, {
						case: "single",
						value: { enable: args.single },
					});
					changed.push(`single=${args.single}`);
				}
				if (args.consume !== undefined) {
					await execute(mpdClient, profile, {
						case: "consume",
						value: { enable: args.consume },
					});
					changed.push(`consume=${args.consume}`);
				}
				return toolResultText(
					changed.length === 0 ? "no modes changed" : changed.join(", "),
				);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	// ----- Queue -----
	server.registerTool(
		"queue_get",
		{
			title: "Get current play queue",
			description: "Returns songs currently in the play queue.",
			inputSchema: {
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Max rows to return. Default ${DEFAULT_QUEUE_RESULTS}. Very large values may exceed your context window.`,
					),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				const res = await execute(mpdClient, profile, {
					case: "playlistinfo",
					value: {},
				});
				if (res.command?.case !== "playlistinfo") {
					return toolError("Unexpected response from MPD playlistinfo.");
				}
				const all = res.command.value.songs.map(songToOutput);
				const limit = args.limit ?? DEFAULT_QUEUE_RESULTS;
				return toolResultJson({
					total: all.length,
					returned: Math.min(all.length, limit),
					songs: all.slice(0, limit),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"queue_add",
		{
			title: "Add to play queue",
			description:
				"Appends a URI (file path returned by library_search / library_query_sql, or an MPD-recognized directory) to the play queue.",
			inputSchema: { uri: z.string().min(1) },
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await execute(mpdClient, profile, {
					case: "add",
					value: { uri: args.uri },
				});
				return toolResultText(`added: ${args.uri}`);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"queue_clear",
		{
			title: "Clear play queue",
			description: "Removes every song from the play queue.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				await execute(mpdClient, profile, { case: "clear", value: {} });
				return toolResultText("queue cleared");
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	// ----- Playlists -----
	server.registerTool(
		"playlist_list",
		{
			title: "List stored playlists",
			description:
				"Returns names of MPD stored playlists with their last-modified timestamp.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				const res = await execute(mpdClient, profile, {
					case: "listplaylists",
					value: {},
				});
				if (res.command?.case !== "listplaylists") {
					return toolError("Unexpected response from MPD listplaylists.");
				}
				return toolResultJson({
					playlists: res.command.value.playlists.map((p) => ({
						name: p.name,
						updated_at:
							p.updatedAt !== undefined
								? new Date(Number(p.updatedAt.seconds) * 1000).toISOString()
								: undefined,
					})),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"playlist_get",
		{
			title: "Get songs in a stored playlist",
			description: "Returns the songs of a stored playlist.",
			inputSchema: {
				name: z.string().min(1),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				const res = await execute(mpdClient, profile, {
					case: "listplaylistinfo",
					value: { name: args.name },
				});
				if (res.command?.case !== "listplaylistinfo") {
					return toolError("Unexpected response from MPD listplaylistinfo.");
				}
				return toolResultJson({
					name: args.name,
					songs: res.command.value.songs.map(songToOutput),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	// ----- Library: low-level structured search -----
	server.registerTool(
		"library_list_tag_values",
		{
			title: "List distinct tag values",
			description:
				"Lists the distinct values for a metadata tag (e.g. all artists, all albums, all genres). Server-side via MPD `list`; supports optional filter conditions.",
			inputSchema: {
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
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				const conditions = args.filter
					? buildSearchConditions(args.filter as SimpleFilter)
					: [];
				const res = await execute(mpdClient, profile, {
					case: "list",
					value: { tag: tagFromName(args.tag), conditions },
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
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_search",
		{
			title: "Search the library",
			description:
				"Server-side search via MPD `search`. Supports tag equality / contains, ADDED_SINCE for recently-added queries, and pagination via limit/offset. Returns flat song objects.",
			inputSchema: {
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
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				const conditions = buildSearchConditions(args.filter as SimpleFilter);
				if (conditions.length === 0) {
					return toolError(
						"library_search requires at least one filter key. Use library_query_sql for unfiltered analytical queries.",
					);
				}
				const limit = args.limit ?? DEFAULT_SEARCH_RESULTS;
				const offset = args.offset ?? 0;
				const sortTag = (() => {
					switch (args.sort) {
						case "title":
							return Song_MetadataTag.TITLE;
						case "artist":
							return Song_MetadataTag.ARTIST;
						case "album":
							return Song_MetadataTag.ALBUM;
						case "date":
							return Song_MetadataTag.DATE;
						case "added":
							return Song_MetadataTag.ADDED_AT;
						case "updated":
							return Song_MetadataTag.UPDATED_AT;
						default:
							return Song_MetadataTag.UNKNOWN;
					}
				})();
				const res = await execute(mpdClient, profile, {
					case: "search",
					value: {
						conditions,
						sort: {
							tag: sortTag,
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
				return errorToResult(err);
			}
		},
	);

	// ----- Library analytics (SQLite-backed) -----
	server.registerTool(
		"library_top_by_tag",
		{
			title: "Top values for a metadata tag",
			description:
				"Ranks the top N values of a tag (artist / album / genre / etc.) by song count or total duration across the entire library. Backed by the in-memory analytical mirror.",
			inputSchema: {
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
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				const rows = libraryIndex.topByTag(
					args.tag,
					args.by ?? "count",
					args.limit ?? 25,
				);
				return toolResultJson({ tag: args.tag, by: args.by ?? "count", rows });
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_breakdown",
		{
			title: "Full breakdown for a tag",
			description:
				"Returns the song count and total duration for every distinct value of the given tag. Useful for full-library composition analysis.",
			inputSchema: {
				tag: groupableTagSchema,
				limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						"Optional row cap. Omit to return every distinct value. Very large libraries may exceed your context window.",
					),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				return toolResultJson({
					tag: args.tag,
					rows: libraryIndex.breakdown(args.tag, args.limit),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_format_distribution",
		{
			title: "Audio format distribution",
			description:
				"Returns song count and total duration grouped by audio format string (encoding/channels/bits/sample-rate).",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				return toolResultJson({
					rows: libraryIndex.formatDistribution(),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_decade_breakdown",
		{
			title: "Release decade breakdown",
			description:
				"Buckets songs by the decade derived from the DATE tag (parses leading 4-digit year). Songs without a parseable year fall into '(unknown)'.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				return toolResultJson({ rows: libraryIndex.decadeBreakdown() });
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_recently_added_by_artist",
		{
			title: "Recently added artists",
			description:
				"For each artist, returns the most recent file-added timestamp and song count. Use `since_days` to limit to recent activity, or omit it to find which artists have been quiet for a long time (sort by last_added ASC client-side if needed).",
			inputSchema: {
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
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				const since =
					args.since_days !== undefined
						? new Date(Date.now() - args.since_days * 24 * 3600 * 1000)
						: undefined;
				return toolResultJson({
					rows: libraryIndex.recentlyAddedByArtist({
						limit: args.limit ?? 50,
						since,
					}),
				});
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_artist_summary",
		{
			title: "Artist summary",
			description:
				"Aggregates one artist's songs across artist and album_artist tags: counts, total duration, year range, genres, formats, first/last added.",
			inputSchema: {
				name: z.string().min(1),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				const summary = libraryIndex.artistSummary(args.name);
				if (summary === undefined) {
					return toolError(`No songs found for artist: ${args.name}`);
				}
				return toolResultJson(summary);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	// ----- Library SQL -----
	const { sql_schema, notes } = libraryIndex.describe();
	server.registerTool(
		"library_query_sql",
		{
			title: "Run a SQL query against the library mirror",
			description: `Runs a read-only SQL query against the in-memory SQLite mirror of the MPD library. Only SELECT / WITH / EXPLAIN are accepted.

Schema:
${sql_schema}

${notes}

Behaviour: rows beyond row_limit (default ${DEFAULT_SQL_ROWS}) are dropped and the response sets truncated=true. Use LIMIT in your SQL or raise row_limit when you really need more — large result sets may exceed your context window.`,
			inputSchema: {
				sql: z
					.string()
					.min(1)
					.describe(
						"Single SELECT / WITH / EXPLAIN statement. Use ? placeholders bound by `params`.",
					),
				params: z
					.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
					.optional(),
				row_limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Maximum rows to materialize. Default ${DEFAULT_SQL_ROWS}. Very large values may exhaust server memory or your context window.`,
					),
			},
		},
		async (args) => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				validateSelectSql(args.sql);
				const result = libraryIndex.querySql(
					args.sql,
					args.params ?? [],
					args.row_limit ?? DEFAULT_SQL_ROWS,
				);
				return toolResultJson(result);
			} catch (err) {
				return errorToResult(err);
			}
		},
	);

	server.registerTool(
		"library_index_stats",
		{
			title: "Library mirror stats",
			description:
				"Returns metadata about the analytical SQLite mirror: when it was last built and how many songs it currently holds.",
			inputSchema: {},
		},
		async () => {
			try {
				const profile = profileOrError();
				await ensureIndex(profile);
				return toolResultJson(libraryIndex.stats());
			} catch (err) {
				return errorToResult(err);
			}
		},
	);
}

function errorToResult(err: unknown) {
	if (err instanceof NoCurrentMpdProfileError) {
		return toolError(err.message);
	}
	const message = err instanceof Error ? err.message : String(err);
	return toolError(message);
}
