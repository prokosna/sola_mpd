import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";

/**
 * Represents the properties required for plugin execution.
 */
export type PluginExecutionProps = {
  plugin: Plugin | undefined;
  songs: Song[];
};
