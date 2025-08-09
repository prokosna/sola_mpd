import { z } from "zod";

const stringOrNumber = z
	.union([z.string(), z.number()])
	.transform((value) => String(value));

export const SubsonicSongSchema = z.object({
	id: stringOrNumber,
	title: z.string().optional().or(z.literal("")),
	artist: z.string().optional().or(z.literal("")),
	album: z.string().optional().or(z.literal("")),
});

export type SubsonicSong = z.infer<typeof SubsonicSongSchema>;

export const SubsonicPlaylistSchema = z.object({
	id: stringOrNumber,
	name: z.string(),
});

export const SubsonicGetPlaylistsResponseSchema = z.object({
	"subsonic-response": z.object({
		playlists: z.object({
			playlist: z.array(SubsonicPlaylistSchema).optional(),
		}),
	}),
});

export type SubsonicPlaylist = z.infer<typeof SubsonicPlaylistSchema>;

export const SubsonicGetPlaylistResponseSchema = z.object({
	"subsonic-response": z.object({
		playlist: z.object({
			entry: z.array(SubsonicSongSchema).optional(),
		}),
	}),
});

export const SubsonicSearch3ResponseSchema = z.object({
	"subsonic-response": z.object({
		searchResult3: z.object({
			song: z.array(SubsonicSongSchema).optional(),
		}),
	}),
});

export const SubsonicCreatePlaylistResponseSchema = z.object({
	"subsonic-response": z.object({
		playlist: SubsonicPlaylistSchema,
	}),
});
