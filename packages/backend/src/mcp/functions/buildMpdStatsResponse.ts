import type { MpdStats } from "@sola_mpd/shared/src/models/mpd/mpd_stats_pb.js";

export type MpdStatsResponse = {
	version: string;
	artists_count: number;
	albums_count: number;
	songs_count: number;
	total_playtime_seconds: number;
	uptime_seconds: number;
	last_updated: string | undefined;
};

export function buildMpdStatsResponse(
	stats: MpdStats | undefined,
): MpdStatsResponse {
	return {
		version: stats?.version ?? "",
		artists_count: stats?.artistsCount ?? 0,
		albums_count: stats?.albumsCount ?? 0,
		songs_count: stats?.songsCount ?? 0,
		total_playtime_seconds: stats?.totalPlaytime ?? 0,
		uptime_seconds: stats?.uptime ?? 0,
		last_updated:
			stats?.lastUpdated !== undefined
				? new Date(Number(stats.lastUpdated.seconds) * 1000).toISOString()
				: undefined,
	};
}
