import { z } from "zod";

export const AstigaSongSchema = z.object({
  id: z.string(),
  title: z.string().optional().or(z.literal("")),
  artist: z.string().optional().or(z.literal("")),
  album: z.string().optional().or(z.literal("")),
});

export type AstigaSong = z.infer<typeof AstigaSongSchema>;

export const AstigaPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AstigaGetPlaylistsResponseSchema = z.object({
  "subsonic-response": z.object({
    playlists: z.object({
      playlist: z.array(AstigaPlaylistSchema),
    }),
  }),
});

export type AstigaPlaylist = z.infer<typeof AstigaPlaylistSchema>;

export const AstigaGetPlaylistResponseSchema = z.object({
  "subsonic-response": z.object({
    playlist: z.object({
      entry: z.array(AstigaSongSchema),
    }),
  }),
});

export const AstigaSearch3ResponseSchema = z.object({
  "subsonic-response": z.object({
    searchResult3: z.object({
      song: z.array(AstigaSongSchema),
    }),
  }),
});

export const AstigaCreatePlaylistResponseSchema = z.object({
  "subsonic-response": z.object({
    playlist: AstigaPlaylistSchema,
  }),
});
