import { MpdEvent } from "@sola_mpd/domain/src/models/mpd/mpd_event_pb.js";
import { MpdProfile } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

export type MpdVersion = string;

export interface MpdService {
  pingMpd: (host: string, port: number) => Promise<MpdVersion>;
  subscribe: (
    profile: MpdProfile,
  ) => (callback: (event: MpdEvent) => Promise<void>) => void;
  unsubscribe: (profile: MpdProfile) => () => void;
  addSongsToPlayQueue: (
    profile: MpdProfile,
  ) => (songs: Song[]) => Promise<void>;
  clearPlayQueue: (profile: MpdProfile) => () => Promise<void>;
}
