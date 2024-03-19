import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

export type PluginExecutionProps = {
  plugin: Plugin | undefined;
  songs: Song[];
};
